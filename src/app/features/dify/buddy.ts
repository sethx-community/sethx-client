import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface BuddyChat {
  id: string;
  title: string;
  conversationId: string;
  messages: Message[];
  updatedAt: number;
}

@Component({
  selector: "app-buddy",
  imports: [CommonModule, FormsModule],
  templateUrl: "./buddy.html",
  styleUrls: ["./buddy.css"],
})
export class BuddyComponent implements OnInit, AfterViewChecked {
  @ViewChild("scrollContainer") private scrollContainer!: ElementRef;

  @Input() isOracleBuddyOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  isTyping: boolean = false;
  userInput: string = "";
  chats: BuddyChat[] = [];
  activeChatId: string = "";

  private proxyUrl = "https://graph.sethx.com/dify";
  private readonly storageKey = "sethx-buddy-chats-v1";

  get activeChat(): BuddyChat {
    const existing = this.chats.find((chat) => chat.id === this.activeChatId);
    if (existing) return existing;

    const freshChat = this.createEmptyChat();
    this.chats = [freshChat, ...this.chats];
    this.activeChatId = freshChat.id;
    this.persistChats();
    return freshChat;
  }

  get messages(): Message[] {
    return this.activeChat.messages;
  }

  get conversationId(): string {
    return this.activeChat.conversationId;
  }

  set conversationId(value: string) {
    this.activeChat.conversationId = value;
    this.activeChat.updatedAt = Date.now();
    this.persistChats();
  }

  ngOnInit() {
    this.restoreChats();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  closeBuddy() {
    this.close.emit();
  }

  newChat() {
    const chat = this.createEmptyChat();
    this.chats = [chat, ...this.chats];
    this.activeChatId = chat.id;
    this.userInput = "";
    this.persistChats();
    setTimeout(() => this.scrollToBottom(), 0);
  }

  clearCurrentChat() {
    const chat = this.activeChat;
    chat.messages = [];
    chat.conversationId = "";
    chat.title = "New chat";
    chat.updatedAt = Date.now();
    this.userInput = "";
    this.persistChats();
  }

  selectChat(chatId: string) {
    if (this.isTyping) return;
    this.activeChatId = chatId;
    this.userInput = "";
    this.persistChats();
    setTimeout(() => this.scrollToBottom(), 0);
  }

  deleteChat(chatId: string, event?: Event) {
    event?.stopPropagation();
    if (this.isTyping) return;

    this.chats = this.chats.filter((chat) => chat.id !== chatId);
    if (!this.chats.length) {
      this.newChat();
      return;
    }

    if (this.activeChatId === chatId) {
      this.activeChatId = this.chats[0].id;
    }
    this.persistChats();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  async sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isTyping) return;

    const chat = this.activeChat;
    chat.messages.push({ role: "user", text });
    chat.updatedAt = Date.now();
    this.updateChatTitle(chat, text);
    this.userInput = "";
    this.isTyping = true;
    this.persistChats();

    const payload = {
      inputs: {},
      query: text,
      response_mode: "blocking",
      conversation_id: chat.conversationId,
      user: "sethx-web-client",
    };

    try {
      const response = await fetch(this.proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const data = await response.json();

      if (data.conversation_id) {
        chat.conversationId = data.conversation_id;
      }

      chat.messages.push({
        role: "assistant",
        text: this.cleanAnswer(data.answer || "No text response generated."),
      });
      chat.updatedAt = Date.now();
      this.moveChatToTop(chat.id);
      this.persistChats();
    } catch (error: any) {
      chat.messages.push({
        role: "assistant",
        text: `Connection failure to proxy endpoint: ${error.message}`,
      });
      chat.updatedAt = Date.now();
      this.persistChats();
    } finally {
      this.isTyping = false;
    }
  }

  private restoreChats() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const parsed = stored ? (JSON.parse(stored) as BuddyChat[]) : [];
      this.chats = Array.isArray(parsed) && parsed.length ? parsed : [this.createEmptyChat()];
    } catch {
      this.chats = [this.createEmptyChat()];
    }

    this.chats = this.chats
      .map((chat) => ({
        ...chat,
        conversationId: chat.conversationId || "",
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        title: chat.title || "New chat",
        updatedAt: chat.updatedAt || Date.now(),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    this.activeChatId = this.chats[0].id;
    this.persistChats();
  }

  private persistChats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.chats.slice(0, 12)));
    } catch {}
  }

  private createEmptyChat(): BuddyChat {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: "New chat",
      conversationId: "",
      messages: [],
      updatedAt: Date.now(),
    };
  }

  private updateChatTitle(chat: BuddyChat, firstMessage: string) {
    if (chat.title !== "New chat" && chat.messages.length > 1) return;
    chat.title = firstMessage.length > 34 ? `${firstMessage.slice(0, 31)}...` : firstMessage;
  }

  private moveChatToTop(chatId: string) {
    const chat = this.chats.find((item) => item.id === chatId);
    if (!chat) return;
    this.chats = [chat, ...this.chats.filter((item) => item.id !== chatId)];
  }

  private cleanAnswer(answer: string): string {
    return answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }
}

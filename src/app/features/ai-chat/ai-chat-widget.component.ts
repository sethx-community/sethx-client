import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PlatformAssistantService, AssistantMode } from '../../services/shared/assistant/platform-assistant.service';
import { TranslationPipe } from '../../services/shared/i18n/t.pipe';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './ai-chat-widget.component.html',
})
export class AiChatWidgetComponent {
  private readonly assistant = inject(PlatformAssistantService);

  readonly draft = signal('');
  readonly mode = signal<AssistantMode>('protocol');
  readonly messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask me about SETHX products, account/vault concepts, fees once wired, governance, treasury, risk, or general crypto strategy education. I do not provide personalized financial advice.',
    },
  ]);

  setMode(mode: AssistantMode): void {
    this.mode.set(mode);
  }

  send(): void {
    const text = this.draft().trim();
    if (!text) return;

    void this.assistant.warmData();
    this.messages.update((messages) => [
      ...messages,
      { role: 'user', content: text },
      { role: 'assistant', content: this.assistant.draftPlaceholderAnswer(text, this.mode()) },
    ]);
    this.draft.set('');
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";

import {
  NavigationEnd,
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { WalletConnectComponent } from "../../wallet/wallet-connect/wallet-connect.component";
import { WalletConnectService } from "../../wallet/wallet-connect.service";
import { NetworkStatusService } from "../../services/shared/network-status.service";
import { AccessLayerService } from "../../services/shared/access/access-layer.service";
import { TreasuryModeService } from "../../services/shared/treasury-mode.service";
import { ThemeService } from "../../services/shared/theme/theme.service";
import { TriggerService } from "../../services/shared/trigger.service";
import { WarningCenterService } from "../../services/shared/warnings/warning-center.service";
import { BlockRefreshService } from "../../services/shared/block-refresh.service";
import { ClientLandingComponent } from "../../features/landing/client-landing.component";

import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-shell",
  imports: [
    CommonModule,
    WalletConnectComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ClientLandingComponent,
  ],
  templateUrl: "./shell.component.html",
})
export class ShellComponent implements AfterViewInit, OnDestroy {
  wallet = inject(WalletConnectService);
  readonly network = inject(NetworkStatusService);
  readonly access = inject(AccessLayerService);
  readonly treasuryMode = inject(TreasuryModeService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly triggers = inject(TriggerService);
  readonly warnings = inject(WarningCenterService);
  private readonly blockRefresh = inject(BlockRefreshService);

  // ******** sethx-buddy *************
  private readonly sanitizer = inject(DomSanitizer);

  isOracleBuddyOpen = false;
  safeChatbotUrl: SafeResourceUrl;

  openBuddy(): void {
    this.isOracleBuddyOpen = true;
  }

  closeBuddy(): void {
    this.isOracleBuddyOpen = false;
  }

  // **************************************

  walletAddress = this.wallet.address;
  readonly hasTreasuryAccess = this.access.hasTreasuryAccess;
  readonly currentUrl = signal(this.router.url);
  readonly mainCanScrollUp = signal(false);
  readonly mainCanScrollDown = signal(false);
  readonly rightCanScrollUp = signal(false);
  readonly rightCanScrollDown = signal(false);
  readonly refreshPulse = signal(false);

  @ViewChild("mainScroll") private mainScrollRef?: ElementRef<HTMLElement>;
  @ViewChild("rightPanelScroll")
  private rightPanelScrollRef?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;
  private scrollStateFrame: number | null = null;
  private readonly scrollSettleTimers: Record<
    "main" | "right",
    ReturnType<typeof setTimeout> | null
  > = {
    main: null,
    right: null,
  };

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
        this.triggers.refreshActiveRoute(event.urlAfterRedirects);
        this.queueScrollStateUpdate();
      }
    });

    effect(() => {
      const address = this.walletAddress();
      if (!address) {
        this.treasuryMode.reset();
        return;
      }
      if (this.hasTreasuryAccess()) void this.treasuryMode.refresh(true);
      else this.treasuryMode.reset();
    });

    this.safeChatbotUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://udify.app/chat/GAHwxhS8k0vQum2S",
    );
  }

  refreshCurrentPage(): void {
    this.refreshPulse.set(true);
    this.triggers.refreshActiveRoute(this.currentUrl(), true);
    window.setTimeout(() => this.refreshPulse.set(false), 650);
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() =>
      this.queueScrollStateUpdate(),
    );
    if (this.mainScrollRef?.nativeElement)
      this.resizeObserver.observe(this.mainScrollRef.nativeElement);
    if (this.rightPanelScrollRef?.nativeElement)
      this.resizeObserver.observe(this.rightPanelScrollRef.nativeElement);
    this.queueScrollStateUpdate();
    this.blockRefresh.start();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.scrollStateFrame !== null)
      cancelAnimationFrame(this.scrollStateFrame);
    this.clearScrollSettleTimers();
  }

  scrollPane(target: HTMLElement, direction: "up" | "down"): void {
    const distance = Math.max(160, Math.floor(target.clientHeight * 0.85));
    target.scrollBy({
      top: direction === "up" ? -distance : distance,
      behavior: "smooth",
    });
  }

  updateScrollState(pane: "main" | "right", target: HTMLElement): void {
    if (this.scrollSettleTimers[pane] !== null)
      clearTimeout(this.scrollSettleTimers[pane]);
    this.scrollSettleTimers[pane] = setTimeout(() => {
      this.scrollSettleTimers[pane] = null;
      this.applyScrollState(pane, target);
    }, 160);
  }

  private queueScrollStateUpdate(): void {
    if (this.scrollStateFrame !== null)
      cancelAnimationFrame(this.scrollStateFrame);
    this.scrollStateFrame = requestAnimationFrame(() => {
      this.scrollStateFrame = null;
      const main = this.mainScrollRef?.nativeElement;
      const right = this.rightPanelScrollRef?.nativeElement;
      if (main) this.applyScrollState("main", main);
      if (right) this.applyScrollState("right", right);
    });
  }

  private applyScrollState(pane: "main" | "right", target: HTMLElement): void {
    const tolerance = 2;
    const canScrollUp = target.scrollTop > tolerance;
    const canScrollDown =
      target.scrollTop + target.clientHeight < target.scrollHeight - tolerance;

    if (pane === "main") {
      this.mainCanScrollUp.set(canScrollUp);
      this.mainCanScrollDown.set(canScrollDown);
      return;
    }

    this.rightCanScrollUp.set(canScrollUp);
    this.rightCanScrollDown.set(canScrollDown);
  }

  private clearScrollSettleTimers(): void {
    for (const pane of ["main", "right"] as const) {
      if (this.scrollSettleTimers[pane] !== null) {
        clearTimeout(this.scrollSettleTimers[pane]);
        this.scrollSettleTimers[pane] = null;
      }
    }
  }

  lastRefreshText(): string {
    const ts = this.triggers.lastRefreshAt();
    if (!ts) return "Not refreshed yet";
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  onThemeToggle(): void {
    this.theme.toggleTheme();
  }

  onTreasuryModeChange(event: Event): void {
    const enabled = (event.target as HTMLInputElement | null)?.checked === true;
    this.treasuryMode.setActingAsTreasurer(enabled);
  }

  onTreasuryAccountChange(event: Event): void {
    const account = (event.target as HTMLSelectElement | null)?.value ?? "";
    this.treasuryMode.selectTreasuryAccount(account);
  }

  readonly unsupportedTreasuryOrderbookSegments = [
    "optionstrade",
    "futurestrade",
    "nftspottrade",
    "binaryoptionstrade",
    "marginoptionstrade",
  ];

  treasuryNavDisabled(segment: string): boolean {
    return (
      this.treasuryMode.actingAsTreasurer() &&
      this.unsupportedTreasuryOrderbookSegments.includes(segment)
    );
  }

  treasuryDisabledTitle(segment: string): string | null {
    return this.treasuryNavDisabled(segment)
      ? "not activated for treasury"
      : null;
  }

  onUnsupportedTreasuryNav(event: MouseEvent, segment: string): void {
    if (!this.treasuryNavDisabled(segment)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  unsupportedTreasuryRoute(): boolean {
    if (!this.treasuryMode.actingAsTreasurer()) return false;
    const url = this.currentUrl();
    return this.unsupportedTreasuryOrderbookSegments.some((segment) =>
      url.includes(segment),
    );
  }
}

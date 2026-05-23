import { Injectable, computed, inject } from '@angular/core';

import { AccessLayerService, AccessSnapshot } from '../access/access-layer.service';
import { ProtocolDataService, ProtocolKnowledge } from '../data/protocol-data.service';
import { GovernanceDataService } from '../data/governance-data.service';
import { TreasuryDataService } from '../data/treasury-data.service';
import { ProtocolConfigService } from '../config/protocol-config.service';

export type AssistantMode = 'protocol' | 'user-context' | 'crypto-education';

export type AssistantContext = {
  mode: AssistantMode;
  walletAddress: string | null;
  access: AccessSnapshot;
  protocol: ProtocolKnowledge;
  guardrails: string[];
};

@Injectable({ providedIn: 'root' })
export class PlatformAssistantService {
  private readonly access = inject(AccessLayerService);
  private readonly protocol = inject(ProtocolDataService);
  private readonly governance = inject(GovernanceDataService);
  private readonly treasury = inject(TreasuryDataService);
  private readonly protocolConfig = inject(ProtocolConfigService);

  readonly context = computed(() => this.buildContext('protocol'));

  buildContext(mode: AssistantMode): AssistantContext {
    return {
      mode,
      walletAddress: this.access.walletAddress(),
      access: this.access.snapshot(),
      protocol: this.protocol.knowledge(),
      guardrails: this.protocolConfig.assistant().guardrails,
    };
  }

  async warmData(): Promise<void> {
    this.protocol.warmLiveReads();
    await Promise.all([
      this.governance.loadSettings().catch(() => null),
      this.treasury.loadDashboard().catch(() => null),
    ]);
  }

  draftPlaceholderAnswer(question: string, mode: AssistantMode): string {
    const context = this.buildContext(mode);
    const accessLabel = context.access.walletConnected
      ? `Connected wallet ${context.walletAddress}. Voting power shown by MVP data layer: ${context.access.votingPower.toString()}.`
      : 'No wallet is connected, so I can only answer from public protocol knowledge.';

    return [
      `Assistant backend placeholder for ${mode}.`,
      accessLabel,
      `Question received: "${question}"`,
      `Live read layer currently knows ${context.protocol.products.length} products and ${context.protocol.assets.length} assets on ${context.protocol.networkName}.`,
      'Final integration should answer from Library content, live fee/config reads, contract addresses, governance state, treasury state, and curated crypto education with risk disclaimers.',
    ].join(' ');
  }
}

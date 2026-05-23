import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ERC20ContractService } from '../../../services/onchain/contracts/erc20-contract.service';

@Component({
  selector: 'app-approve-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approve-modal.component.html',
})
export class ApproveModalComponent {
  private readonly erc20 = inject(ERC20ContractService);

  @Input() decimals = 18;
  @Input() tokenSymbol = 'Token';
  @Input() tokenAddress!: string;

  /** spender should be the Account contract address */
  @Input() account!: string;

  @Input() amount!: string;

  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  readonly error = signal<string | null>(null);
  readonly pending = signal(false);

  async approve(): Promise<void> {
    if (this.pending()) return;
    this.pending.set(true);
    this.error.set(null);

    try {
      await this.erc20.approve(
        this.tokenAddress,
        this.account,
        this.amount,
        this.decimals,
      );
      this.success.emit();
    } catch (err) {
      console.error('Approval failed:', err);
      this.error.set('Approval transaction failed.');
    } finally {
      this.pending.set(false);
    }
  }

  cancelAction(): void {
    this.cancel.emit();
  }
}

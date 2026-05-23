import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ContractActionFunction = {
  name: string;
  signature: string;
  purpose: string;
};

export type ContractActionModalData = {
  title: string;
  subtitle: string;
  contractNames: string[];
  status?: string;
  functions: ContractActionFunction[];
  note?: string;
};

@Component({
  selector: 'app-contract-action-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-action-modal.component.html',
  styleUrl: './contract-action-modal.component.scss',
})
export class ContractActionModalComponent {
  @Input({ required: true }) data!: ContractActionModalData;
  @Input() onClose?: (result?: any) => void;

  close(result?: any) {
    this.onClose?.(result);
  }
}

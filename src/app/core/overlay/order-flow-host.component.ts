// src/app/actions/mutation-flow/mutation-host.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFlowService } from './order-flow.service';

@Component({
  selector: 'app-order-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-flow-host.component.html',
  styleUrl: './order-flow-host.component.scss',
})
export class OrderHostComponent {
  readonly flow = inject(OrderFlowService);

  readonly onClose = (result?: any) => {
    this.flow.close();
  };
}

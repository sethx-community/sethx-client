import { Injectable, inject } from '@angular/core';
import { FuturesOrderBookStore } from './futures-orderbook.store';
import { FuturesOrderBookActionsService } from './futures-orderbook-actions.service';

@Injectable({ providedIn: 'root' })
export class FuturesOrderBookFacade {
  readonly store = inject(FuturesOrderBookStore);
  readonly actions = inject(FuturesOrderBookActionsService);
}

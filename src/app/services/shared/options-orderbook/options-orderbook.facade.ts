import { Injectable, inject } from '@angular/core';
import { OptionsOrderBookStore } from './options-orderbook.store';
import { OptionsOrderBookActionsService } from './options-orderbook-actions.service';

@Injectable({ providedIn: 'root' })
export class OptionsOrderBookFacade {
  readonly store = inject(OptionsOrderBookStore);
  readonly actions = inject(OptionsOrderBookActionsService);
}

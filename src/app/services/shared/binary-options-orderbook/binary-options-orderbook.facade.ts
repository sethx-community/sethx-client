import { Injectable, inject } from '@angular/core';
import { BinaryOptionsOrderBookStore } from './binary-options-orderbook.store';
import { BinaryOptionsOrderBookActionsService } from './binary-options-orderbook-actions.service';
@Injectable({providedIn:'root'})
export class BinaryOptionsOrderBookFacade{readonly store=inject(BinaryOptionsOrderBookStore); readonly actions=inject(BinaryOptionsOrderBookActionsService);}

import { Injectable, inject } from '@angular/core';
import { MarginOptionsOrderBookStore } from './margin-options-orderbook.store';
import { MarginOptionsOrderBookActionsService } from './margin-options-orderbook-actions.service';
@Injectable({providedIn:'root'})
export class MarginOptionsOrderBookFacade{readonly store=inject(MarginOptionsOrderBookStore); readonly actions=inject(MarginOptionsOrderBookActionsService)}

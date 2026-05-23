import { OrderFlowAction, MarginOptionsOrderModalData } from '../../../../../types/order_flow/order-flow.types';
import { MarginOptionsOrderModalComponent } from '../../order-modal/marginoptionsorder-modal.component';
export interface MarginOptionsPageCtx{selectedMarketKey?:string|null}
const data=(intent:MarginOptionsOrderModalData['intent'],ctx:MarginOptionsPageCtx):MarginOptionsOrderModalData=>({intent,defaultMarketKey:ctx.selectedMarketKey??undefined});
export const marginOptionsPageActions:Array<OrderFlowAction<MarginOptionsPageCtx,MarginOptionsOrderModalData>>=[
 {id:'marginoptions.place',group:'Trading',label:'Place Margin Option Order',description:'Create a buy, sell-holder, write, or sell-writer margin option order.',buildData:(ctx)=>data('place',ctx),modal:MarginOptionsOrderModalComponent},
 {id:'marginoptions.accept',group:'Orders',label:'Accept Selected Order',description:'Select an order in the book and fill it from the right panel.',enabled:()=>false,disabledReason:()=>'Select an order row, then use Fill selected order.',buildData:(ctx)=>data('accept',ctx),modal:MarginOptionsOrderModalComponent},
 {id:'marginoptions.cancel',group:'Orders',label:'Cancel Selected Order',description:'Select one of your orders and cancel it from the right panel.',enabled:()=>false,disabledReason:()=>'Select one of your orders, then use Cancel selected order.',buildData:(ctx)=>data('cancel',ctx),modal:MarginOptionsOrderModalComponent},
 {id:'marginoptions.claim',group:'Account',label:'Claim Payout',description:'Use My Positions to claim settled holder payout.',enabled:()=>false,disabledReason:()=>'Open My Positions and use the row Claim action.',buildData:(ctx)=>data('claim',ctx),modal:MarginOptionsOrderModalComponent},
 {id:'marginoptions.reclaim',group:'Account',label:'Reclaim Writer Margin',description:'Use My Positions to reclaim residual writer margin.',enabled:()=>false,disabledReason:()=>'Open My Positions and use the row Reclaim action.',buildData:(ctx)=>data('reclaim',ctx),modal:MarginOptionsOrderModalComponent},
 {id:'marginoptions.quote',group:'Quotes',label:'Fee & Margin Quote',description:'Preview premium, margin, and fee locks without submitting.',buildData:(ctx)=>data('quote',ctx),modal:MarginOptionsOrderModalComponent},
];

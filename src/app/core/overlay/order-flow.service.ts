import { Injectable, Type, signal, computed } from '@angular/core';

export interface OrderFlowOverlayState {
  component: Type<any> | null;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class OrderFlowService {
  private readonly _state = signal<OrderFlowOverlayState>({
    component: null,
    data: null,
  });
  readonly state = this._state.asReadonly();
  readonly isOpen = computed(() => !!this._state().component);

  open(component: Type<any>, data: any) {
    this._state.set({ component, data });
  }

  close() {
    this._state.set({ component: null, data: null });
  }
}

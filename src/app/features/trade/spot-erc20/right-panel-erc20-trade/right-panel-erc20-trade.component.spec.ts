import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightPanelErc20TradeComponent } from './right-panel-erc20-trade.component';

describe('RightPanelErc20TradeComponent', () => {
  let component: RightPanelErc20TradeComponent;
  let fixture: ComponentFixture<RightPanelErc20TradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightPanelErc20TradeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RightPanelErc20TradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

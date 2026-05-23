import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Erc20TradeComponent } from './erc20-trade.component';

describe('Erc20TradeComponent', () => {
  let component: Erc20TradeComponent;
  let fixture: ComponentFixture<Erc20TradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Erc20TradeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Erc20TradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

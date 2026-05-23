import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletStateComponent } from './wallet-state.component';

describe('WalletStateComponent', () => {
  let component: WalletStateComponent;
  let fixture: ComponentFixture<WalletStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

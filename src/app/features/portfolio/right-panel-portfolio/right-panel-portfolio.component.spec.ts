import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightPanelPortfolioComponent } from './right-panel-portfolio.component';

describe('RightPanelPortfolioComponent', () => {
  let component: RightPanelPortfolioComponent;
  let fixture: ComponentFixture<RightPanelPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightPanelPortfolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightPanelPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

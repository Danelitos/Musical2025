import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatingPlanComponent } from './seating-plan-component.component';

describe('SeatingPlanComponentComponent', () => {
  let component: SeatingPlanComponent;
  let fixture: ComponentFixture<SeatingPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatingPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatingPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

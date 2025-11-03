import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidarEntradasComponent } from './validar-entradas';

describe('ValidarEntradasComponent', () => {
  let component: ValidarEntradasComponent;
  let fixture: ComponentFixture<ValidarEntradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidarEntradasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidarEntradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

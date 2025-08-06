import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeInputBooleanComponent } from './three-input-boolean.component';

describe('ThreeInputBooleanComponent', () => {
  let component: ThreeInputBooleanComponent;
  let fixture: ComponentFixture<ThreeInputBooleanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeInputBooleanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeInputBooleanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

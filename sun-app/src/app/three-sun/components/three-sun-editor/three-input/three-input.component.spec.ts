import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeInputComponent } from './three-input.component';

describe('ThreeInputComponent', () => {
  let component: ThreeInputComponent;
  let fixture: ComponentFixture<ThreeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

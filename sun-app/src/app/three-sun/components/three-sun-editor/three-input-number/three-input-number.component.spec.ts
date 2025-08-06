import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeInputNumberComponent } from './three-input-number.component';

describe('ThreeInputNumberComponent', () => {
  let component: ThreeInputNumberComponent;
  let fixture: ComponentFixture<ThreeInputNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeInputNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeInputNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeInputStringComponent } from './three-input-string.component';

describe('ThreeInputStringComponent', () => {
  let component: ThreeInputStringComponent;
  let fixture: ComponentFixture<ThreeInputStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeInputStringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeInputStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

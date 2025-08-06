import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeInputColorComponent } from './three-input-color.component';

describe('ThreeInputColorComponent', () => {
  let component: ThreeInputColorComponent;
  let fixture: ComponentFixture<ThreeInputColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeInputColorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeInputColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

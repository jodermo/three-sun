import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeSunComponent } from './three-sun.component';

describe('ThreeSunComponent', () => {
  let component: ThreeSunComponent;
  let fixture: ComponentFixture<ThreeSunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeSunComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeSunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

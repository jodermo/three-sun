import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeSunEditorComponent } from './three-sun-editor.component';

describe('ThreeSunEditorComponent', () => {
  let component: ThreeSunEditorComponent;
  let fixture: ComponentFixture<ThreeSunEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeSunEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeSunEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

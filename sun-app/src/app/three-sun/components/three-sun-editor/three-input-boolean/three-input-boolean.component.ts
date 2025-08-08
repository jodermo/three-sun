// three-input-boolean.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { ThreeInputComponent } from '../three-input/three-input.component';
@Component({
  selector: 'app-three-input-boolean',
  standalone: false,
  templateUrl: './three-input-boolean.component.html',
  styleUrls: ['./three-input-boolean.component.scss'],
})
export class ThreeInputBooleanComponent extends ThreeInputComponent<boolean> {
  override id = 'ThreeInputBooleanComponent';

  @Output() override onChange = new EventEmitter<boolean>();

  override getInputValue(): string {
    return this.value ? 'true' : 'false';
  }
}

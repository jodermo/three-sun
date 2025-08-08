import { Component, EventEmitter, Output } from '@angular/core';
import { ThreeInputComponent } from '../three-input/three-input.component';

@Component({
  selector: 'app-three-input-string',
  standalone: false,
  templateUrl: './three-input-string.component.html',
  styleUrl: './three-input-string.component.scss',
})
export class ThreeInputStringComponent extends ThreeInputComponent<string> {
  override id = 'ThreeInputNumberComponent';

  @Output() override onChange = new EventEmitter<string>();

  override getInputValue() {
    if (this.value) {
      return this.value;
    }
    return '';
  }

}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThreeInputComponent } from '../three-input/three-input.component';

@Component({
  selector: 'app-three-input-number',
  standalone: false,
  templateUrl: './three-input-number.component.html',
  styleUrl: './three-input-number.component.scss',
})
export class ThreeInputNumberComponent extends ThreeInputComponent<number> {
  override id = 'ThreeInputNumberComponent';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;

  @Input() suffix?: string;

  @Output() override onChange = new EventEmitter<number>();

  override initValue() {
    if (this.value === undefined) {
      super.initValue();
      return;
    }
    if (this.min && this.value < this.min) {
      this.value = this.min;
      this.onChange.emit(this.value);
    }
    if (this.max && this.value > this.max) {
      this.value = this.max;
      this.onChange.emit(this.value);
    }
    super.initValue();
  }

  override getInputValue() {
    if (this.value) {
      return this.value + '';
    }
    return 'none';
  }

  override triggerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = parseFloat(input.value);
    this.onChange.emit(this.value);
    this.storeValueFromURLQuery();
  }

  hasSlider(): boolean {
    return this.min !== undefined && this.max !== undefined;
  }
}

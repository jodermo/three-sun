import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-three-input-number',
  standalone: false,
  templateUrl: './three-input-number.component.html',
  styleUrl: './three-input-number.component.scss',
})
export class ThreeInputNumberComponent {
  @Input() value?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() label?: string;
  @Input() id = 'ThreeInputNumberComponent';
  @Input() preventRealtimeChanges = false;

  @Output() onChange = new EventEmitter<number>();

  getInputValue() {
    if (this.value) {
      return this.value + '';
    }
    return 'none';
  }

  triggerRealtimeChange(event: Event) {
    if (!this.preventRealtimeChanges) {
      this.triggerChange(event);
    }
  }

  triggerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = parseFloat(input.value);
    this.onChange.emit(this.value);
  }

  hasSlider(): boolean {
    return this.min !== undefined && this.max !== undefined;
  }
}

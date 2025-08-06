import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-three-input-string',
  standalone: false,
  templateUrl: './three-input-string.component.html',
  styleUrl: './three-input-string.component.scss',
})
export class ThreeInputStringComponent {
  @Input() value?: string;
  @Input() label?: string;
  @Input() id = 'ThreeInputNumberComponent';
  @Input() preventRealtimeChanges = false;

  @Output() onChange = new EventEmitter<string>();

  getInputValue() {
    if (this.value) {
      return this.value;
    }
    return '';
  }

  triggerRealtimeChange(event: Event) {
    if (!this.preventRealtimeChanges) {
      this.triggerChange(event);
    }
  }

  triggerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange.emit(this.value);
  }
}

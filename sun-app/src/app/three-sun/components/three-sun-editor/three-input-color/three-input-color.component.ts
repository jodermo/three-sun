import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Color } from 'three';

@Component({
  selector: 'app-three-input-color',
  standalone: false,
  templateUrl: './three-input-color.component.html',
  styleUrls: ['./three-input-color.component.scss'],
})
export class ThreeInputColorComponent {
  @Input() value?: Color;
  @Input() label?: string;
  @Input() id = 'ThreeInputColorComponent';
  @Input() preventRealtimeChanges = false;

  @Output() onChange = new EventEmitter<Color>();

  getInputValue() {
    if (this.value) {
      return '#' + this.value.getHexString();
    }
    return '#000000';
  }

  triggerRealtimeChange(event: Event) {
    if (!this.preventRealtimeChanges) {
      this.triggerChange(event);
    }
  }

  triggerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!this.value) {
      this.value = new Color();
    }
    this.value.set(input.value);
    this.onChange.emit(this.value);
  }
}

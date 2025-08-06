import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-three-input-boolean',
  standalone: false,
  templateUrl: './three-input-boolean.component.html',
  styleUrl: './three-input-boolean.component.scss'
})
export class ThreeInputBooleanComponent {
  @Input() value?: boolean;
  @Input() label?: string;
  @Input() id = 'ThreeInputNumberComponent';
  @Input() preventRealtimeChanges = false;

  @Output() onChange = new EventEmitter<boolean>();

   getInputValue() {
      if (this.value) {
        return 'true';
      }
      return 'false';
    }
  
    triggerRealtimeChange(event: Event) {
      if (!this.preventRealtimeChanges) {
        this.triggerChange(event);
      }
    }
  
    triggerChange(event: Event) {
      const input = event.target as HTMLInputElement;
      this.value = input.checked;
      this.onChange.emit(this.value);
    }
}

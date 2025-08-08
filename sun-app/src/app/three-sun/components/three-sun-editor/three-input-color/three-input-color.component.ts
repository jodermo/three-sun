import { Component, EventEmitter, Output } from '@angular/core';
import { Color } from 'three';
import { ThreeInputComponent } from '../three-input/three-input.component';

@Component({
  selector: 'app-three-input-color',
  standalone: false,
  templateUrl: './three-input-color.component.html',
  styleUrls: ['./three-input-color.component.scss'],
})
export class ThreeInputColorComponent extends ThreeInputComponent<Color> {
  override id = 'ThreeInputColorComponent';
  @Output() override onChange = new EventEmitter<Color>();

  override getInputValue(): string {
    if (this.value) {
      return '#' + this.value.getHexString();
    }
    return '#000000';
  }
  override storeValueFromURLQuery(): void {
    if (!this.value) return;

    const hexString = `#${this.value.getHexString()}`;

    const queryParams = {
      ...this.route.snapshot.queryParams,
      [this.id]: hexString,
    };

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  override loadValueFromURLQuery(): void {
    const queryValue = this.route.snapshot.queryParamMap.get(this.id);
    if (queryValue !== null) {
      this.value = new Color(queryValue);
      this.onChange.emit(this.value);
    }
  }

  override triggerChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!this.value) {
      this.value = new Color();
    }

    this.value.set(input.value);
    this.onChange.emit(this.value);
    this.storeValueFromURLQuery();
  }
}

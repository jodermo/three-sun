// three-input.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Color } from 'three';

@Component({
  selector: 'app-three-input',
  standalone: false,
  templateUrl: './three-input.component.html',
  styleUrls: ['./three-input.component.scss'],
})
export class ThreeInputComponent<T = any> implements OnInit {
  @Input() id = 'ThreeInputComponent';
  @Input() value?: T;
  @Input() label?: string;
  @Input() preventRealtimeChanges = false;
  @Output() onChange = new EventEmitter<T>();

  initialValue?: any;

  constructor(public route: ActivatedRoute, public router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.initValue();
    }, 0);
  }

  initValue() {
    if (this.value instanceof Color) {
      this.initialValue = this.value.clone();
    } else {
      this.initialValue = this.value;
    }

    this.route.queryParams.subscribe((params) => {
      this.loadValueFromURLQuery(params);
    });
    console.log('initialValue', this.id, this.initialValue);
  }

  resetValue() {
    this.value = this.initialValue;
    console.log('reset value', this.id, this.initialValue);
    this.onChange.emit(this.value);
    this.storeValueFromURLQuery();
  }

  getInputValue(): string {
    if (this.value !== undefined) {
      return JSON.stringify(this.value);
    }
    return 'no value';
  }

  triggerRealtimeChange(event: Event): void {
    if (!this.preventRealtimeChanges) {
      this.triggerChange(event);
    }
  }

  triggerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.checked as unknown as T;
    this.onChange.emit(this.value);
    this.storeValueFromURLQuery();
  }

  loadValueFromURLQuery(params: Params) {
    const queryValue = params[this.id];
    if (queryValue !== undefined) {
      try {
        this.value = JSON.parse(queryValue);
      } catch {
        this.value = queryValue as any as T;
      }
      this.onChange.emit(this.value);
    }
  }
  storeValueFromURLQuery() {
    const queryParams = {
      ...this.route.snapshot.queryParams,
      [this.id]: JSON.stringify(this.value),
    };

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

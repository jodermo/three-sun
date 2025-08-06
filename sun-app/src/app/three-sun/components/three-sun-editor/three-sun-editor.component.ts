import { Component } from '@angular/core';
import { ThreeSunService } from '../../three-sun.service';

@Component({
  selector: 'app-three-sun-editor',
  standalone: false,
  templateUrl: './three-sun-editor.component.html',
  styleUrl: './three-sun-editor.component.scss',
})
export class ThreeSunEditorComponent {
  emissiveColor?: string;

  constructor(public sun: ThreeSunService) {}


}

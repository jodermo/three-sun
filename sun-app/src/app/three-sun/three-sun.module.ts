/**
 * Three.js Sun Module
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * Procedural solar simulation using ShaderMaterial, FBM noise,
 * and animated corona and flare layers. Fully customizable in real-time
 * via uniform-driven parameters.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeSunComponent } from './three-sun.component';
import { ThreeSunEditorComponent } from './components/three-sun-editor/three-sun-editor.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ThreeInputColorComponent } from './components/three-sun-editor/three-input-color/three-input-color.component';
import { ThreeInputNumberComponent } from './components/three-sun-editor/three-input-number/three-input-number.component';
import { ThreeInputBooleanComponent } from './components/three-sun-editor/three-input-boolean/three-input-boolean.component';
import { ThreeInputStringComponent } from './components/three-sun-editor/three-input-string/three-input-string.component';
import { NgThreeSunService } from './ng-three-sun.service';

@NgModule({
  declarations: [
    ThreeSunComponent,
    ThreeSunEditorComponent,
    ThreeInputColorComponent,
    ThreeInputNumberComponent,
    ThreeInputBooleanComponent,
    ThreeInputStringComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [NgThreeSunService],
  exports: [ThreeSunComponent],
})
export class ThreeSunModule {}

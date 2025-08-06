/**
 * Three.js Sun Component
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * Modular solar rendering component using Three.js with custom shaders.
 * Includes animated FBM-based surface, corona glow, and procedural solar flares.
 * Designed for real-time configuration and visual fidelity.
 */

import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';

import { ThreeSunService } from './three-sun.service';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  Color,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js'
@Component({
  selector: 'app-three-sun',
  standalone: false,
  templateUrl: './three-sun.component.html',
  styleUrls: ['./three-sun.component.scss'],
})
export class ThreeSunComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sunContainer', { static: false }) sunContainer!: ElementRef;

  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  composer!: EffectComposer;
  renderTarget!: WebGLRenderTarget;
  renderPass!: RenderPass;
  bloomPass!: UnrealBloomPass;
 stats = new Stats()

  /**
   * Settings for camera, background, and post-processing effects.
   */
  sceneOptions = {
    camera: { fov: 75, near: 0.1, far: 1000, position: new Vector3(0, 0, 5) },
    backgroundColor: new Color(0x00000000),
    postProcessing: {
      bloom: {
        active: false,
        strength: 0.1,
        radius: 0.5,
        threshold: 0,
      },
    },
  };


  private lastFrameTime = performance.now();
  private animationId!: number;

  /**
   * Width and height of the render target.
   */
  public width = 1920;
  public height = 1080;

  /**
   * Frame delta time (in seconds).
   */
  public deltaTime = 0;

  constructor(public sun: ThreeSunService) {}

  /**
   * Angular lifecycle hook — initializes the Three.js scene.
   */
  ngAfterViewInit(): void {
    this.initScene();
  }

  /**
   * Angular lifecycle hook — cleans up resources.
   */
  ngOnDestroy(): void {
    this.sun.destroy();
    cancelAnimationFrame(this.animationId);
  }

  /**
   * Updates renderer and composer size to match the container.
   */
  resize(): void {
    this.width = this.sunContainer.nativeElement.clientWidth;
    this.height = this.sunContainer.nativeElement.clientHeight;
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Initializes the entire Three.js scene: camera, renderer, postprocessing, sun.
   */
  initScene(): void {
    document.body.appendChild(this.stats.dom)
    this.width = this.sunContainer.nativeElement.clientWidth;
    this.height = this.sunContainer.nativeElement.clientHeight;

    this.scene = new Scene();
    this.scene.background = this.sceneOptions.backgroundColor;

    this.camera = new PerspectiveCamera(
      this.sceneOptions.camera.fov,
      this.width / this.height,
      this.sceneOptions.camera.near,
      this.sceneOptions.camera.far
    );
    this.camera.position.copy(this.sceneOptions.camera.position);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setSize(this.width, this.height);
    this.sunContainer.nativeElement.appendChild(this.renderer.domElement);

    // Create and initialize the sun
    this.sun.initSun(this.scene, this.camera);

    this.renderTarget = new WebGLRenderTarget(this.width, this.height);
    this.composer = new EffectComposer(this.renderer, this.renderTarget);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.createPostProcessing();
    this.initControls();
    this.resize();
    this.animate();
  }

  /**
   * Initializes bloom post-processing effects.
   */
  createPostProcessing(): void {
    this.bloomPass = new UnrealBloomPass(
      new Vector2(this.width, this.height),
      this.sceneOptions.postProcessing.bloom.strength,
      this.sceneOptions.postProcessing.bloom.radius,
      this.sceneOptions.postProcessing.bloom.threshold
    );

    if (this.sceneOptions.postProcessing.bloom.active) {
      this.composer.addPass(this.bloomPass);
    }
  }

  /**
   * Enables orbit controls for camera interaction.
   */
  initControls(): void {
    const controls = new OrbitControls(
      this.camera,
      this.sunContainer.nativeElement
    );
    controls.minDistance = 2;
    controls.maxDistance = 10;
  }

  /**
   * Main render loop.
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const now = performance.now();
    this.deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.sun.animate(this.deltaTime);
    this.updatePostProcessing(this.deltaTime);

    this.renderer.render(this.scene, this.camera);
    this.composer.render();
    this.stats.update();
  };

  /**
   * Updates bloom effect settings each frame.
   * @param deltaTime Time since last frame.
   */
  private updatePostProcessing(deltaTime: number): void {
    this.bloomPass.threshold = this.sceneOptions.postProcessing.bloom.threshold;
    this.bloomPass.strength = this.sceneOptions.postProcessing.bloom.strength;
    this.bloomPass.radius = this.sceneOptions.postProcessing.bloom.radius;
  }
}

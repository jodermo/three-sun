/**
 * Three.js Sun Service
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * Core service for managing the procedural sun system in a Three.js scene.
 * Initializes the sun mesh, shaders, post-processing (bloom, lens flares),
 * and updates animated layers including corona and solar flares.
 * Designed for real-time visual effects and customization.
 */

import {
  Material,
  Mesh,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector3,
} from 'three';
import { SolarFlare, SolarFlareOptions } from './classes/solar-flare';
import { SunCorona } from './classes/sun-corona';
import {
  SunShaderOptions,
  SunShaderService,
} from './services/sun-shader.service';
import { ThreeSunConfig } from './three-sun.config';
import { SunCoronaOptions } from './services/sun-corona.service';
import Stats from 'three/examples/jsm/libs/stats.module.js';
export interface SolarEruptionFlareOptions {
  min: SolarFlareOptions;
  max: SolarFlareOptions;
  shader: {
    emissiveStrength: number;
    opacity: number;
    distortionScale: number;
    fadeStart: number;
    fadeEnd: number;
    noiseScaleX: number;
    noiseScaleY: number;
    speed: number;
  };
}
export interface SolarEruptionOptions {
  active: boolean;
  min: {
    count: number;
    interval: number;
  };
  max: {
    count: number;
    interval: number;
  };
  flareOptions: SolarEruptionFlareOptions;
}

export interface ThreeSunOptions {
  rotation: {
    direction: Vector3;
    speed: number;
  };
  shader: SunShaderOptions;
  coronas: SunCoronaOptions[];
  solarEruptions: SolarEruptionOptions;
}

export class ThreeSunService {
  editorActive = false;

  stats = new Stats();

  // Scene graph references
  scene!: Scene;
  camera!: PerspectiveCamera;

  // Sun geometry and material
  sunMesh!: Mesh;
  sunGeometry!: SphereGeometry;
  sunMaterial!: Material;
  light!: PointLight;

  // Effect components
  coronas: SunCorona[] = [];
  solarFlares: SolarFlare[] = [];

  // Texture loader for lensflare elements
  textureLoader = new TextureLoader();

  config = new ThreeSunConfig();

  /**
   * Configurable visual and logic options for the sun system.
   */
  options: ThreeSunOptions = this.config.options;

  /**
   * Handles animated lava shader logic and color options.
   */
  shader = new SunShaderService(this, this.options.shader);

  statsVisible = false;

  private solarEruptionIntervalId?: number;

  /**
   * Initializes the sun mesh, shader, corona layers, and optional lensflares.
   * @param scene The Three.js scene to add the sun to.
   * @param camera The active camera (used by lensflare logic).
   * @param options Optional override for default configuration.
   */
  initSun(
    scene: Scene,
    camera: PerspectiveCamera,
    options = this.options
  ): void {
    this.scene = scene;
    this.camera = camera;
    this.options = options;

    this.sunGeometry = new SphereGeometry(
      this.config.geometry.radius,
      this.config.geometry.segments,
      this.config.geometry.segments
    );
    this.sunMaterial = this.shader.sunMaterial;
    this.sunMesh = new Mesh(this.sunGeometry, this.sunMaterial);
    this.scene.add(this.sunMesh);

    for (const corona of this.options.coronas) {
      this.coronas.push(new SunCorona(this, corona));
    }

    this.light = new PointLight(0xffffff, 1, 100);
    this.sunMesh.add(this.light);
    this.startSolarEruptionLoop(this.options.solarEruptions);
  }

  startSolarEruptionLoop(options: SolarEruptionOptions): void {
    const scheduleNext = () => {
      if (document.visibilityState !== 'visible') {
        this.solarEruptionIntervalId = window.setTimeout(scheduleNext, 1000);
        return;
      }

      const count = Math.floor(
        this.randomBetween(options.min.count, options.max.count)
      );
      const interval = this.randomBetween(
        options.min.interval,
        options.max.interval
      );

      for (let i = 0; i < count; i++) {
        this.spawnFlare(options.flareOptions);
      }

      this.solarEruptionIntervalId = window.setTimeout(scheduleNext, interval);
    };

    scheduleNext();
  }

  stopSolarEruptionLoop(): void {
    if (this.solarEruptionIntervalId) {
      clearTimeout(this.solarEruptionIntervalId);
      this.solarEruptionIntervalId = undefined;
    }
  }
  addStats(htmlElement: HTMLElement) {
    htmlElement.appendChild(this.stats.dom);
    this.showStats();
  }

  showStats() {
    this.stats.dom.style.display = 'block';
    this.statsVisible = true;
  }

  hideStats() {
    this.stats.dom.style.display = 'none';
    this.statsVisible = false;
  }

  toggleStats() {
    if (this.statsVisible) {
      this.hideStats();
    } else {
      this.showStats();
    }
  }

  /**
   * Returns a random point on the sun surface in world space.
   */
  randomPointOnSurface(): Vector3 {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = this.sunMesh.geometry.boundingSphere?.radius ?? 1;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    return new Vector3(x, y, z).applyMatrix4(this.sunMesh.matrixWorld);
  }
  randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  generateRandomFlareOptions(
    flareOptions: SolarEruptionFlareOptions
  ): SolarFlareOptions {
    return {
      size: this.randomBetween(flareOptions.min.size, flareOptions.max.size),
      lifetime: this.randomBetween(
        flareOptions.min.lifetime,
        flareOptions.max.lifetime
      ),
      plasmaTrails: Math.floor(
        this.randomBetween(
          flareOptions.min.plasmaTrails,
          flareOptions.max.plasmaTrails
        )
      ),
      flareCount: Math.floor(
        this.randomBetween(
          flareOptions.min.flareCount,
          flareOptions.max.flareCount
        )
      ),
      turbulance: this.randomBetween(
        flareOptions.min.turbulance,
        flareOptions.max.turbulance
      ),
    };
  }

  /**
   * Spawns a dynamic solar flare at a random surface point.
   * Includes random size, lifetime, and animation parameters.
   */
  spawnFlare(options: SolarEruptionFlareOptions): void {
    if (!this.options.solarEruptions.active) {
      return;
    }
    const flareOptions = this.generateRandomFlareOptions(options);

    const flare = new SolarFlare(this, flareOptions, {
      baseColor: this.options.shader.baseColor,
      hotColor: this.options.shader.hotColor,
      deepColor: this.options.shader.deepColor,
      emissiveStrength: options.shader.emissiveStrength,
      opacity: options.shader.opacity,
      distortionScale: options.shader.distortionScale,
      fadeStart: options.shader.fadeStart,
      fadeEnd: options.shader.fadeEnd,
      noiseScaleX: options.shader.noiseScaleX,
      noiseScaleY: options.shader.noiseScaleY,
      speed: options.shader.speed,
    });

    flare.spawnSolarFlare();
  }

  /**
   * Rotates the sun mesh based on user-defined direction and speed.
   * @param deltaTime Frame delta time (in seconds).
   */
  private animateSunMesh(deltaTime: number): void {
    this.sunMesh.rotation.x +=
      this.options.rotation.direction.x * this.options.rotation.speed;
    this.sunMesh.rotation.y +=
      this.options.rotation.direction.y * this.options.rotation.speed;
    this.sunMesh.rotation.z +=
      this.options.rotation.direction.z * this.options.rotation.speed;
  }

  /**
   * Updates all animated elements including sun surface, corona, and flares.
   * @param deltaTime Time since last frame (in seconds).
   */
  animate(deltaTime: number): void {
    this.animateSunMesh(deltaTime);
    this.shader.update(deltaTime);
    this.coronas.forEach((corona) => corona.animate(deltaTime));
    this.solarFlares.forEach((flare) => flare.animate(deltaTime));
    this.stats.update();
  }

  /**
   * Cleans up the sun system (e.g. on scene unload).
   */
  destroy(): void {
    // Optional: Dispose geometry, materials, textures, etc.
  }

  showEditor() {
    this.editorActive = true;
  }
  hideEditor() {
    this.editorActive = false;
  }
  toggleEditor() {
    if (this.editorActive) {
      this.hideEditor();
    } else {
      this.showEditor();
    }
  }
}

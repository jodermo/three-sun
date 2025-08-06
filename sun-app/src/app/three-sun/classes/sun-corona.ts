/**
 * Sun Corona Class
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * represents a procedural corona mesh attached to a sun object.
 * Uses a shader-driven material with flare and noise-based animation.
 */

import { PlaneGeometry, Mesh, Material, Vector3, Color } from 'three';
import {
  SunCoronaOptions,
  SunCoronaService,
} from '../services/sun-corona.service';
import { ThreeSunService } from '../three-sun.service';

export class SunCorona {
  coronaService!: SunCoronaService;
  mesh!: Mesh;
  material!: Material;
  geometry!: PlaneGeometry;

  /**
   *
   * @param sun Reference to the main Three.js sun service.
   * @param size Size of the corona mesh.
   * @param speed Animation speed multiplier.
   * @param options Shader customization (flare, glow, falloff, etc).
   */
  constructor(
    private sun: ThreeSunService,
    public options: SunCoronaOptions = {
      glowColor: new Color('#ffee00'),
      flareStrength: 1.5,
      baseGlowStrength: 1.0,
      radialFalloff: 2.0,
      flareFalloff: 2.5,
      edgeFadeStart: 0.2,
      edgeFadeEnd: 0.5,
      baseGlowThreshold: 0.35,
      animationSpeed: 1.0,
      size: 4,
      speed: 1,
    }
  ) {
    this.coronaService = new SunCoronaService(sun, options);
    this.createCorona();
  }

  /**
   * Creates the corona mesh and attaches it to the sun.
   */
  createCorona(): void {
    this.material = this.coronaService.material;
    this.geometry = new PlaneGeometry(this.options.size, this.options.size);
    this.mesh = new Mesh(this.geometry, this.material);

    this.sun.sunMesh.add(this.mesh);
  }

  /**
   * Updates the corona animation and ensures it faces the camera
   * while simulating rotation along the sun's movement.
   * @param deltaTime Time since last frame (in seconds).
   */
  animate(deltaTime: number): void {
    // Sync shader values
    this.coronaService.options = this.options;
    this.coronaService.animate(deltaTime);

    // Lock to sun position
    this.mesh.position.copy(this.sun.sunMesh.position);

    // Face the camera (billboarding)
    this.mesh.lookAt(this.sun.camera.position);

    // Simulate 3D rotation on face
    const spinSpeed = deltaTime * this.options.speed; 

    // Apply spin around face (local Z axis)
    this.mesh.rotateZ(spinSpeed);
  }
}

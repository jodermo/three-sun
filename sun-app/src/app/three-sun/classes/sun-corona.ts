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

import { PlaneGeometry, Mesh, Material, Vector3, Color, Euler } from 'three';
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

  private rotationAccumulator: number = 0;
  lastCameraPosition: any;
  private lastSunRotation?: Euler;
  private reactiveRotationAccumulator = { x: 0, y: 0, z: 0 };
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
      active: true,
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
      scale: 1,
      speed: 1,
      syncWithSun: true,
      wrapRotation: true,
      enablePulsing: true,
      pulseFrequency: 0.234,
      pulseAmplitude: 1,

      enableMultiAxisReaction: true,
      rotationReactivity: 0.3,
      rotationDecay: 0.98,
      reactiveScaling: 0.05,
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

  /**
   * Updates the corona animation and ensures it faces the camera
   * while simulating rotation along the sun's movement.
   * @param deltaTime Time since last frame (in seconds).
   */
  /**
   * Updates the corona animation and ensures it faces the camera
   * while simulating rotation along the sun's movement.
   * @param deltaTime Time since last frame (in seconds).
   */
  animate_aroundaxetowardcamera(deltaTime: number): void {
    // Update corona service options and animate
    this.coronaService.options = this.options;
    this.coronaService.animate(deltaTime);

    // Update position to follow the sun
    this.mesh.position.copy(this.sun.sunMesh.position);

    // Performance optimization: only update lookAt if camera moved significantly
    const cameraMovementThreshold = 0.001; // Adjust based on your scene scale
    const currentCameraPosition = this.sun.camera.position;

    if (
      !this.lastCameraPosition ||
      this.lastCameraPosition.distanceTo(currentCameraPosition) >
        cameraMovementThreshold
    ) {
      this.mesh.lookAt(currentCameraPosition);

      // Cache camera position for next frame comparison
      if (!this.lastCameraPosition) {
        this.lastCameraPosition = currentCameraPosition.clone();
      } else {
        this.lastCameraPosition.copy(currentCameraPosition);
      }
    }

    // Calculate rotation based on options
    const spinSpeed = deltaTime * this.options.speed;

    // Choose rotation method based on configuration
    if (this.options.syncWithSun && this.sun.sunMesh.rotation) {
      // Sync rotation with sun's rotation
      this.mesh.rotation.z = this.sun.sunMesh.rotation.y * this.options.speed;
    } else {
      // Independent rotation with accumulator to prevent drift
      this.rotationAccumulator += spinSpeed;

      // Optional: wrap rotation to prevent infinite accumulation
      if (
        this.options.wrapRotation &&
        Math.abs(this.rotationAccumulator) > Math.PI * 2
      ) {
        this.rotationAccumulator = this.rotationAccumulator % -(Math.PI * 2);
      }

      this.mesh.rotation.z = this.rotationAccumulator;
    }

    // Optional: Add subtle scale pulsing for enhanced effect
    if (this.options.enablePulsing) {
      const pulseAmount =
        Math.sin(this.rotationAccumulator * this.options.pulseFrequency) *
        this.options.pulseAmplitude;
      const baseScale = this.options.scale || 1;
      this.mesh.scale.setScalar(baseScale + pulseAmount);
    }
  }

  /**
   * Updates the corona animation and ensures it faces the camera
   * while simulating rotation along the sun's movement.
   * @param deltaTime Time since last frame (in seconds).
   */
  animate(deltaTime: number): void {
    if (!this.options.active) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;

    // Update corona service options and animate
    this.coronaService.options = this.options;
    this.coronaService.animate(deltaTime);

    // Update position to follow the sun
    this.mesh.position.copy(this.sun.sunMesh.position);

    // Track sun rotation changes for corona reaction
    const currentSunRotation = this.sun.sunMesh.rotation.clone();
    let sunRotationDelta = { x: 0, y: 0, z: 0 };

    if (this.lastSunRotation) {
      sunRotationDelta = {
        x: currentSunRotation.x - this.lastSunRotation.x,
        y: currentSunRotation.y - this.lastSunRotation.y,
        z: currentSunRotation.z - this.lastSunRotation.z,
      };
    }

    // Cache sun rotation for next frame
    if (!this.lastSunRotation) {
      this.lastSunRotation = currentSunRotation.clone();
    } else {
      this.lastSunRotation.copy(currentSunRotation);
    }

    // Performance optimization: only update lookAt if camera moved significantly
    const cameraMovementThreshold = 0.001; // Adjust based on your scene scale
    const currentCameraPosition = this.sun.camera.position;

    if (
      !this.lastCameraPosition ||
      this.lastCameraPosition.distanceTo(currentCameraPosition) >
        cameraMovementThreshold
    ) {
      this.mesh.lookAt(currentCameraPosition);

      // Cache camera position for next frame comparison
      if (!this.lastCameraPosition) {
        this.lastCameraPosition = currentCameraPosition.clone();
      } else {
        this.lastCameraPosition.copy(currentCameraPosition);
      }
    }

    // Calculate base rotation speed
    const baseSpinSpeed = deltaTime * this.options.speed;

    // Add reactive rotation based on sun's rotation changes
    const rotationReactivity = this.options.rotationReactivity || 0.3;
    const reactiveRotation = {
      x: sunRotationDelta.x * rotationReactivity,
      y: sunRotationDelta.y * rotationReactivity,
      z: sunRotationDelta.z * rotationReactivity,
    };

    // Choose rotation method based on configuration
    if (this.options.syncWithSun && this.sun.sunMesh.rotation) {
      // Sync rotation with sun's rotation + reactive component
      this.mesh.rotation.z =
        this.sun.sunMesh.rotation.y * this.options.speed +
        this.reactiveRotationAccumulator.z;
    } else {
      // Independent rotation with accumulator to prevent drift
      this.rotationAccumulator += baseSpinSpeed;

      // Optional: wrap rotation to prevent infinite accumulation
      if (
        this.options.wrapRotation &&
        Math.abs(this.rotationAccumulator) > Math.PI * 2
      ) {
        this.rotationAccumulator = this.rotationAccumulator % (Math.PI * 2);
      }

      this.mesh.rotation.z =
        this.rotationAccumulator + this.reactiveRotationAccumulator.z;
    }

    // Accumulate reactive rotations for subtle ongoing effects
    this.reactiveRotationAccumulator.x += reactiveRotation.x;
    this.reactiveRotationAccumulator.y += reactiveRotation.y;
    this.reactiveRotationAccumulator.z += reactiveRotation.z;

    // Apply decay to reactive rotations to prevent infinite accumulation
    const decayRate = this.options.rotationDecay || 0.98;
    this.reactiveRotationAccumulator.x *= decayRate;
    this.reactiveRotationAccumulator.y *= decayRate;
    this.reactiveRotationAccumulator.z *= decayRate;

    // Apply additional rotational effects based on sun's X and Y rotations
    // These create subtle tilting effects that simulate corona material responding to sun rotation
    if (this.options.enableMultiAxisReaction) {
      // Create subtle offset rotations that decay over time
      const offsetX = Math.sin(this.reactiveRotationAccumulator.x * 2) * 0.1;
      const offsetY = Math.cos(this.reactiveRotationAccumulator.y * 2) * 0.1;

      // Apply these as additional Z-axis rotation components (since corona faces camera)
      this.mesh.rotation.z += offsetX + offsetY;
    }

    // Optional: Add subtle scale pulsing for enhanced effect
    if (this.options.enablePulsing) {
      const pulseAmount =
        Math.sin(this.rotationAccumulator * this.options.pulseFrequency) *
        this.options.pulseAmplitude;
      const baseScale = this.options.scale || 1;

      // Add reactive scaling based on sun rotation intensity
      const rotationIntensity = Math.sqrt(
        sunRotationDelta.x * sunRotationDelta.x +
          sunRotationDelta.y * sunRotationDelta.y +
          sunRotationDelta.z * sunRotationDelta.z
      );
      const reactiveScale =
        rotationIntensity * (this.options.reactiveScaling || 0.05);

      this.mesh.scale.setScalar(baseScale + pulseAmount + reactiveScale);
    }
  }
}

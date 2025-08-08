/**
 * Represents a procedurally animated solar flare.
 * Includes two layered flare meshes (falling back and flying away) with dynamic shader-driven effects.
 *
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 */

import {
  ShaderMaterial,
  Vector3,
  Mesh,
  CircleGeometry,
  Color,
  Euler,
  Quaternion,
} from 'three';
import { SolarFlareService } from '../services/solar-flare.service';
import { ThreeSunService } from '../three-sun.service';

export interface SolarFlareShaderOptions {
  baseColor: Color;
  hotColor: Color;
  deepColor: Color;
  emissiveStrength: number;
  opacity: number;
  distortionScale: number;
  fadeStart: number;
  fadeEnd: number;
  noiseScaleX: number;
  noiseScaleY: number;
  speed: number;
}
export interface SolarFlareOptions {
  size: number;
  lifetime: number;
  plasmaTrails: number;
  flareCount: number;
  turbulance: number;
}

export class SolarFlare {
  /** Service managing flare shader materials and animation */
  solarFlareService!: SolarFlareService;

  /** Spawn location on the sun's surface */
  spawnLocation = new Vector3();

  /** Elapsed lifetime in seconds */
  age = 0;

  /** Internal state tracking for cleanup */
  private destroyed = false;

  /** Circle geometry for both visual layers */
  fallingBackGeometry!: CircleGeometry;
  flyAwayGeometry!: CircleGeometry;

  fallingBackMeshes: Mesh[] = [];
  flyAwayMeshes: Mesh[] = [];

  /** Material for falling back flare layer */
  fallingBackMaterial!: ShaderMaterial;

  /** Material for fly-away flare layer */
  flyAwaykMaterial!: ShaderMaterial;

  /**
   *
   * @param sun Reference to the global sun service.
   * @param size Visual size of the flare in world units.
   * @param lifetime Total duration in seconds before self-destruction.
   * @param plasmaTrails Not yet used (placeholder for trail emission).
   * @param flareCount Number of flare planes.
   * @param turbulance Multiplier for shader noise animation speed.
   * @param shaderOptions Uniform-driven shader visual configuration.
   */
  constructor(
    private sun: ThreeSunService,
    public options: SolarFlareOptions = {
      size: 10,
      lifetime: 5,
      plasmaTrails: 4,
      flareCount: 3,
      turbulance: 1,
    },
    public shaderOptions: SolarFlareShaderOptions = {
      baseColor: new Color('#ffd000ff'),
      hotColor: new Color('#ffee00'),
      deepColor: new Color('#4b0000'),
      emissiveStrength: 1.2,
      opacity: 1.0,
      distortionScale: 1.0,
      fadeStart: 0.45,
      fadeEnd: 0.49,
      noiseScaleX: 4.0,
      noiseScaleY: 1.5,
      speed: 1.0,
    }
  ) {
    this.solarFlareService = new SolarFlareService(sun, this.shaderOptions);
    this.spawnLocation = sun.randomPointOnSurface();
  }

  /**
   * Initializes the solar flare and attaches it to the scene.
   * Builds both animated visual layers and aligns them outward from the sun.
   */

  spawnSolarFlare(): void {
    this.fallingBackMaterial = this.solarFlareService.fallingBackMaterial;
    this.flyAwaykMaterial = this.solarFlareService.flyAwayMaterial;

    const normal = this.spawnLocation.clone().normalize(); // surface normal (outward)
    const tangent = new Vector3(); // axis for fan spread
    const tmp = new Vector3(0, 1, 0);
    if (Math.abs(normal.dot(tmp)) > 0.99) tmp.set(1, 0, 0); // avoid near-parallel
    tangent.crossVectors(tmp, normal).normalize();

    const coneAngle = Math.PI / 0.25; // small = tighter fan

    for (let i = 0; i < this.options.flareCount; i++) {
      const angle =
        ((i - this.options.flareCount / 2) / this.options.flareCount) * coneAngle * 2;

      // Axis to rotate the normal (fan direction offset)
      const flareDir = normal
        .clone()
        .applyAxisAngle(tangent, angle)
        .normalize();
      const lookTarget = this.spawnLocation.clone().add(flareDir);

      // Create rotation quaternion to align flare mesh toward flareDir
      const quaternion = new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1),
        flareDir
      );

      // Optionally rotate to correct local orientation (e.g., keep "up" in screen space)
      const upTwist = new Quaternion().setFromAxisAngle(flareDir, 0); // if needed
      quaternion.multiply(upTwist);

      // Falling back
      const fbMesh = new Mesh(
        new CircleGeometry(this.options.size / 2, 64),
        this.fallingBackMaterial
      );
      fbMesh.position.copy(this.spawnLocation);
      fbMesh.quaternion.copy(quaternion);
      this.sun.scene.add(fbMesh);
      this.fallingBackMeshes.push(fbMesh);

      // Flying away
      const faMesh = new Mesh(
        new CircleGeometry(this.options.size / 2, 64),
        this.flyAwaykMaterial
      );
      faMesh.position.copy(this.spawnLocation);
      faMesh.quaternion.copy(quaternion);
      this.sun.scene.add(faMesh);
      this.flyAwayMeshes.push(faMesh);
    }

    this.sun.solarFlares.push(this);
  }

  /**
   * Animates shader values, lifetime-based fading, and scale for all flare meshes.
   * Applies symmetric fade-in/out based on lifetime progression and destroys the flare when expired.
   *
   * @param deltaTime Time since last frame (in seconds).
   */
  animate(deltaTime: number): void {
    if (this.destroyed) return;

    this.age += deltaTime;

    // Sync shader options and animate uniforms
    this.solarFlareService.options = this.shaderOptions;
    this.solarFlareService.animate(deltaTime);

    const normalizedAge = this.age / this.options.lifetime;
    const fade = Math.max(Math.sin(normalizedAge * Math.PI), 0); // full sine fade [0 → 1 → 0]

    // Common scale based on fade strength
    const scale = (this.options.size * fade) / 10;

    // Animate fly-away flare meshes
    this.flyAwayMeshes.forEach((mesh) => {
      if (!(mesh.material instanceof ShaderMaterial)) return;
      const mat = mesh.material;
      mat.uniforms['opacity'].value = fade * fade; // extra smooth fade
      mat.uniforms['time'].value += deltaTime * this.options.turbulance;
      mesh.scale.set(scale, scale, scale);
    });

    // Animate falling-back flare meshes
    this.fallingBackMeshes.forEach((mesh) => {
      if (!(mesh.material instanceof ShaderMaterial)) return;
      const mat = mesh.material;
      mat.uniforms['opacity'].value = fade * fade; // symmetric to flyaway
      mat.uniforms['time'].value += deltaTime * this.options.turbulance;
      mesh.scale.set(scale, scale, scale);
    });

    // Remove flare after lifespan ends
    if (this.age >= this.options.lifetime) {
      this.destroy();
    }
  }

  /**
   * Cleans up all flare meshes from the scene, disposes geometries, and
   * removes the flare instance from the update list.
   */
  destroy(): void {
    if (this.destroyed) return;

    // Remove self from sun flare tracking list
    const index = this.sun.solarFlares.indexOf(this);
    if (index !== -1) {
      this.sun.solarFlares.splice(index, 1);
    }

    // Remove and dispose all fly-away flare meshes
    this.flyAwayMeshes.forEach((mesh) => {
      this.sun.scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof ShaderMaterial) {
        // Optionally dispose material only if unique per flare
        // mesh.material.dispose();
      }
    });
    this.flyAwayMeshes = [];

    // Remove and dispose all falling-back flare meshes
    this.fallingBackMeshes.forEach((mesh) => {
      this.sun.scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof ShaderMaterial) {
        // Optionally dispose material only if not shared
        // mesh.material.dispose();
      }
    });
    this.fallingBackMeshes = [];

    // Remove any active flare reference
    if (this.solarFlareService.flareMesh) {
      this.sun.scene.remove(this.solarFlareService.flareMesh);
      this.solarFlareService.flareMesh.geometry.dispose();
      // Optionally: this.solarFlareService.flareMesh.material.dispose();
      this.solarFlareService.flareMesh = undefined;
    }

    this.destroyed = true;
  }
}

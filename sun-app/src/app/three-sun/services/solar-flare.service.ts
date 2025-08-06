/**
 * Solar Flare Service
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * Manages procedural solar flare shader materials used in the SolarFlare system.
 * Provides configurable noise-based visuals, emission glow, and radial falloff effects.
 * Includes two separate materials (falling back and flying away) for dual-layer animation.
 */

import {
  AdditiveBlending,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  Uniform,
  Vector2,
  Vector3,
  Color,
} from 'three';
import { ThreeSunService } from '../three-sun.service';

export class SolarFlareService {
  /** Optional reference to a currently active flare mesh */
  flareMesh?: Mesh;

  /** Shader material for the falling-back flare effect */
  public fallingBackMaterial: ShaderMaterial;

  /** Shader material for the outward flying flare effect */
  public flyAwayMaterial: ShaderMaterial;

  /**
   * Constructs the solar flare shader manager with configurable visual options.
   * @param sun Reference to the ThreeSunService that owns the flare.
   * @param options Shader visual parameters such as color, distortion, opacity, and timing.
   */
  constructor(
    private sun: ThreeSunService,
    public options = {
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
    this.fallingBackMaterial = this.createFlareMaterial();
    this.flyAwayMaterial = this.createFlareMaterial();
  }

  /**
   * Creates a custom flare material with radial falloff, animated noise, and emissive coloring.
   * @returns The configured ShaderMaterial instance.
   */
  private createFlareMaterial(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        time: new Uniform(0),
        resolution: new Uniform(new Vector2(1, 1)),
        baseColor: new Uniform(this.options.baseColor.clone()),
        hotColor: new Uniform(this.options.hotColor.clone()),
        deepColor: new Uniform(this.options.deepColor.clone()),
        emissiveStrength: new Uniform(this.options.emissiveStrength),
        opacity: new Uniform(this.options.opacity),
        noiseScaleX: new Uniform(this.options.noiseScaleX),
        noiseScaleY: new Uniform(this.options.noiseScaleY),
        fadeStart: new Uniform(this.options.fadeStart),
        fadeEnd: new Uniform(this.options.fadeEnd),
        distortionScale: new Uniform(this.options.distortionScale),
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vDistort;

        void main() {
          vUv = uv;
          float wave = sin(uv.y * 25.0 + time * 4.0) * 0.05;
          float ripple = cos(uv.x * 15.0 + time * 2.0) * 0.05;
          float displacement = wave + ripple;
          vDistort = displacement;
          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 hotColor;
        uniform vec3 deepColor;
        uniform float emissiveStrength;
        uniform float opacity;
        uniform float time;
        uniform float noiseScaleX;
        uniform float noiseScaleY;
        uniform float fadeStart;
        uniform float fadeEnd;
        uniform float distortionScale;

        varying vec2 vUv;
        varying float vDistort;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          vec3 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), u.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), u.x), u.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), u.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), u.x), u.y),
            u.z
          );
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          if (dist > fadeEnd) discard;

          vec3 p = vec3(uv.x * noiseScaleX, uv.y * noiseScaleY, time * 0.3);
          float n = fbm(p * distortionScale);
          n = pow(n, 1.5);
          n = clamp(n * 1.8 + 0.2, 0.0, 1.0);

          vec3 color = mix(deepColor, hotColor, n);
          float emissive = smoothstep(0.75, 1.0, n);
          color += emissive * vec3(1.5, 0.8, 0.3) * emissiveStrength;

          float alpha = pow(1.0 - dist, 3.5);
          alpha *= smoothstep(fadeStart, 0.0, dist);
          alpha *= (0.6 + 0.4 * n);

          gl_FragColor = vec4(color * baseColor, alpha * opacity);
        }
      `,
    });
  }

  /**
   * Updates both flare materials each frame by syncing uniforms and advancing animation.
   * @param deltaTime Time delta since last animation frame (in seconds).
   */
  animate(deltaTime: number): void {
    const t = deltaTime * this.options.speed;

    this.fallingBackMaterial.uniforms['time'].value += t;
    this.flyAwayMaterial.uniforms['time'].value += t;

    for (const mat of [this.fallingBackMaterial, this.flyAwayMaterial]) {
      mat.uniforms['baseColor'].value.copy(this.options.baseColor);
      mat.uniforms['hotColor'].value.copy(this.options.hotColor);
      mat.uniforms['deepColor'].value.copy(this.options.deepColor);
      mat.uniforms['emissiveStrength'].value = this.options.emissiveStrength;
      mat.uniforms['opacity'].value = this.options.opacity;
      mat.uniforms['noiseScaleX'].value = this.options.noiseScaleX;
      mat.uniforms['noiseScaleY'].value = this.options.noiseScaleY;
      mat.uniforms['fadeStart'].value = this.options.fadeStart;
      mat.uniforms['fadeEnd'].value = this.options.fadeEnd;
      mat.uniforms['distortionScale'].value = this.options.distortionScale;
    }
  }
}

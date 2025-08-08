/**
 * Sun Corona Service
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * This service generates a procedural animated corona effect around a sun mesh in Three.js.
 * It uses custom shaders with configurable parameters to simulate a glowing atmosphere
 * and randomized solar flare streaks radiating from the sun surface.
 */

import { ThreeSunService } from '../three-sun.service';
import {
  ShaderMaterial,
  Uniform,
  Vector2,
  AdditiveBlending,
  DoubleSide,
  Color,
} from 'three';

export interface SunCoronaOptions {
  active: boolean;
  size: number;
  scale: number;
  speed: number;
  glowColor: Color;
  flareStrength: number;
  baseGlowStrength: number;
  radialFalloff: number;
  flareFalloff: number;
  edgeFadeStart: number;
  edgeFadeEnd: number;
  baseGlowThreshold: number;
  animationSpeed: number;
  syncWithSun: boolean;
  wrapRotation: boolean;
  enablePulsing: boolean;
  pulseFrequency: number;
  pulseAmplitude: number;
  enableMultiAxisReaction: boolean;
  rotationReactivity: number;
  rotationDecay: number;
  reactiveScaling: number;
}

export class SunCoronaService {
  /** The ShaderMaterial instance used for rendering the corona effect */
  public material: ShaderMaterial;

  /**
   * Creates a new corona service with configurable shader options.
   * @param sun Reference to the ThreeSunService managing the sun.
   * @param options Corona shader settings for color, strength, falloff, animation, etc.
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
    this.material = this.createCoronaMaterial();
  }

  /**
   * Internal method to build and return the shader material for the corona effect.
   * Uses animated procedural noise and smooth radial falloff to simulate glow and streaks.
   */
  private createCoronaMaterial(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        time: new Uniform(0),
        resolution: new Uniform(new Vector2(1, 1)),
        glowColor: new Uniform(this.options.glowColor.clone()),
        flareStrength: new Uniform(this.options.flareStrength),
        baseGlowStrength: new Uniform(this.options.baseGlowStrength),
        radialFalloff: new Uniform(this.options.radialFalloff),
        flareFalloff: new Uniform(this.options.flareFalloff),
        edgeFadeStart: new Uniform(this.options.edgeFadeStart),
        edgeFadeEnd: new Uniform(this.options.edgeFadeEnd),
        baseGlowThreshold: new Uniform(this.options.baseGlowThreshold),
        animationSpeed: new Uniform(this.options.animationSpeed),
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;

        uniform float time;
        uniform vec3 glowColor;
        uniform float flareStrength;
        uniform float baseGlowStrength;
        uniform float radialFalloff;
        uniform float flareFalloff;
        uniform float edgeFadeStart;
        uniform float edgeFadeEnd;
        uniform float baseGlowThreshold;
        uniform float animationSpeed;

        // 1D hash-based noise
        float hash(float n) {
          return fract(sin(n) * 43758.5453);
        }

        float noise(float x) {
          float i = floor(x);
          float f = fract(x);
          float u = f * f * (3.0 - 2.0 * f);
          return mix(hash(i), hash(i + 1.0), u);
        }

        void main() {
          vec2 uv = vUv - vec2(0.5);
          float dist = length(uv);
          float angle = atan(uv.y, uv.x);
          float aNorm = (angle + 3.14159) / (2.0 * 3.14159);

          // Animated directional streaks
          float flareNoise = noise(aNorm * 40.0);
          float flareAnim = noise(aNorm * 40.0 + time * animationSpeed);
          float flare = pow(flareNoise * flareAnim, flareFalloff);
          float radialFade = pow(1.0 - dist, radialFalloff);

          // Base glow
          float baseGlow = smoothstep(baseGlowThreshold, 0.0, dist) *
                           (0.9 + 0.1 * sin(time * 0.5));

          float intensity = baseGlowStrength * baseGlow +
                            flareStrength * flare * radialFade;

          float edgeFade = smoothstep(edgeFadeStart, edgeFadeEnd, dist);
          intensity *= 1.0 - edgeFade;

          if (dist > 0.5 || intensity < 0.01) discard;

          gl_FragColor = vec4(glowColor * intensity, intensity);
        }
      `,
    });
  }

  /**
   * Updates the corona material uniforms each frame to animate glow and streaks.
   * @param deltaTime Elapsed time in seconds since the last animation frame.
   */
  animate(deltaTime: number): void {
    const uniforms = this.material.uniforms;
    uniforms['time'].value += deltaTime * this.options.animationSpeed;

    uniforms['glowColor'].value.copy(this.options.glowColor);
    uniforms['flareStrength'].value = this.options.flareStrength;
    uniforms['baseGlowStrength'].value = this.options.baseGlowStrength;
    uniforms['radialFalloff'].value = this.options.radialFalloff;
    uniforms['flareFalloff'].value = this.options.flareFalloff;
    uniforms['edgeFadeStart'].value = this.options.edgeFadeStart;
    uniforms['edgeFadeEnd'].value = this.options.edgeFadeEnd;
    uniforms['baseGlowThreshold'].value = this.options.baseGlowThreshold;
    uniforms['animationSpeed'].value = this.options.animationSpeed;
  }
}

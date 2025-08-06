/**
 * SunShaderService
 * Author: Moritz Petzka
 * Website: https://petzka.com
 * Email: info@petzka.com
 *
 * Description:
 * Core procedural shader service for the sun surface using Three.js.
 * Includes animated FBM lava-like distortion, emissive bloom control,
 * and full runtime uniform customization.
 */

import { ShaderMaterial, Vector2, Uniform, Color } from 'three';
import { ThreeSunService } from '../three-sun.service';

/**
 * Configuration options for the procedural sun surface shader.
 */
export interface SunShaderOptions {
  /**
   * Base tint applied to the final sun color output.
   */
  baseColor: Color;

  /**
   * Color used for the brightest, hottest parts of the FBM pattern.
   */
  hotColor: Color;

  /**
   * Color used for the darkest, coolest parts of the FBM pattern.
   */
  deepColor: Color;

  /**
   * Tint of the emissive glow added on top of the hot areas.
   */
  emissiveColor: Color;

  /**
   * Controls the strength of the positional distortion applied to the noise coordinates.
   */
  distortionStrength: number;

  /**
   * Scales the brightness of the emissive highlight in hot areas.
   */
  emissiveStrength: number;

  /**
   * Frequency multiplier for the FBM pattern scale on the sun's surface.
   */
  fbmFrequency: number;

  /**
   * Final brightness multiplier for the entire shader output.
   */
  brightness: number;

  /**
   * Power function applied to FBM output to enhance contrast (higher = sharper).
   */
  contrastPower: number;

  /**
   * Scaling factor applied to the FBM value before final clamping.
   */
  fbmScale: number;

  /**
   * Offset added to FBM value after scaling (shifts brightness).
   */
  fbmOffset: number;

  /**
   * Minimum FBM value required to begin emissive bloom ramp.
   */
  emissiveThresholdMin: number;

  /**
   * Maximum FBM value that reaches full emissive bloom.
   */
  emissiveThresholdMax: number;
}

export class SunShaderService {
  public sunMaterial: ShaderMaterial;

  constructor(
    private sun: ThreeSunService,
    public options: SunShaderOptions = {
      baseColor: new Color('#ffd000ff'), // Tint mask for final output
      hotColor: new Color('#ffee00'), // FBM hot layer color
      deepColor: new Color('#4b0000'), // FBM dark layer color
      distortionStrength: 0.5, // Noise-based radial surface warping
      emissiveStrength: 1.0, // Emissive glow intensity multiplier
      fbmFrequency: 3.0, // Base frequency multiplier for FBM
      brightness: 1.0, // Overall output multiplier
      contrastPower: 1.5, // Power curve to control FBM contrast
      fbmScale: 1.8, // Brightness multiplier post-contrast
      fbmOffset: 0.2, // Brightness offset post-contrast
      emissiveThresholdMin: 0.75, // Emissive ramp start
      emissiveThresholdMax: 1.0, // Emissive ramp end
      emissiveColor: new Color(1.5, 0.8, 0.3), // Emissive tint (bloom-boost color)
    }
  ) {
    this.sunMaterial = this.createLavaShader();
  }

  /**
   * Creates the custom ShaderMaterial with procedural noise-based lava shader.
   */
  private createLavaShader(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        time: new Uniform(0), // Time progression for animation
        resolution: new Uniform(new Vector2(1, 1)),

        baseColor: new Uniform(this.options.baseColor.clone()),
        hotColor: new Uniform(this.options.hotColor.clone()),
        deepColor: new Uniform(this.options.deepColor.clone()),

        distortionStrength: new Uniform(this.options.distortionStrength),
        emissiveStrength: new Uniform(this.options.emissiveStrength),
        fbmFrequency: new Uniform(this.options.fbmFrequency),
        brightness: new Uniform(this.options.brightness),

        contrastPower: new Uniform(this.options.contrastPower),
        fbmScale: new Uniform(this.options.fbmScale),
        fbmOffset: new Uniform(this.options.fbmOffset),

        emissiveThresholdMin: new Uniform(this.options.emissiveThresholdMin),
        emissiveThresholdMax: new Uniform(this.options.emissiveThresholdMax),
        emissiveColor: new Uniform(this.options.emissiveColor.clone()),
      },
      vertexShader: `
        varying vec3 vPosition;

        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;

        // Uniform parameters
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 hotColor;
        uniform vec3 deepColor;
        uniform float distortionStrength;
        uniform float emissiveStrength;
        uniform float fbmFrequency;
        uniform float brightness;
        uniform float contrastPower;
        uniform float fbmScale;
        uniform float fbmOffset;
        uniform float emissiveThresholdMin;
        uniform float emissiveThresholdMax;
        uniform vec3 emissiveColor;

        // 3D noise helpers
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
          // Animate FBM position along +X and warp it radially
          vec3 p = vPosition * fbmFrequency + vec3(time * 0.1, time * 0.07, time * 0.13);


          p += vec3(time * distortionStrength);

          float n = fbm(p);

          // Brightness shaping: contrast, scale, offset
          n = pow(n, contrastPower);
          n = clamp(n * fbmScale + fbmOffset, 0.0, 1.0);

          // Color blend between cold (deep) and hot colors
          vec3 color = mix(deepColor, hotColor, n);

          // Emissive highlight (used for bloom)
          float emissive = smoothstep(emissiveThresholdMin, emissiveThresholdMax, n) * emissiveStrength;
          color += emissive * emissiveColor;

          // Final base color mod and intensity
          color *= baseColor * brightness;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false,
    });
  }

  /**
   * Updates all shader uniforms from the dynamic runtime options.
   * Call on every frame during animation.
   */
  update(deltaTime: number): void {
    const u = this.sunMaterial.uniforms;

    u['time'].value += deltaTime;

    u['baseColor'].value.copy(this.options.baseColor);
    u['hotColor'].value.copy(this.options.hotColor);
    u['deepColor'].value.copy(this.options.deepColor);
    u['emissiveColor'].value.copy(this.options.emissiveColor);

    // Optionally animate distortionStrength over time
    u['distortionStrength'].value = this.options.distortionStrength;

    u['emissiveStrength'].value = this.options.emissiveStrength;
    u['fbmFrequency'].value = this.options.fbmFrequency;
    u['brightness'].value = this.options.brightness;

    u['contrastPower'].value = this.options.contrastPower;
    u['fbmScale'].value = this.options.fbmScale;
    u['fbmOffset'].value = this.options.fbmOffset;

    u['emissiveThresholdMin'].value = this.options.emissiveThresholdMin;
    u['emissiveThresholdMax'].value = this.options.emissiveThresholdMax;
  }
}

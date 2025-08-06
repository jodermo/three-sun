import { Color, Vector3 } from 'three';
import { ThreeSunOptions } from './three-sun.service';

/**
 * Global configuration class for the Three.js Sun system.
 * Provides default parameters for the sun's shader, rotation, and lens flares.
 */
export class ThreeSunConfig {
  baseColor = new Color('#fff9df');
  emissiveColor = new Color('#cc7a00ff');
  hotColor = new Color('#ffee00');
  deepColor = new Color('#4b0000');

  geometry = {
    radius: 2,
    segments: 64,
  };

  options: ThreeSunOptions = {
    rotation: {
      direction: new Vector3(0, 1, 0),
      speed: 0,
    },
    shader: {
      baseColor: this.baseColor,
      hotColor: this.hotColor,
      deepColor: this.deepColor,
      distortionStrength: .1,
      emissiveStrength: 2.0,
      fbmFrequency: 25,
      brightness: 1.0,
      contrastPower: 2.25,
      fbmScale: 1.8,
      fbmOffset: 0.4,
      emissiveThresholdMin: 0.2,
      emissiveThresholdMax: 1.0,
      emissiveColor: this.emissiveColor,
    },
    coronas: [
      {
        glowColor: this.emissiveColor,
        flareStrength: 1.5,
        baseGlowStrength: 1.0,
        radialFalloff: 2.0,
        flareFalloff: 2.5,
        edgeFadeStart: 0.2,
        edgeFadeEnd: 0.5,
        baseGlowThreshold: 0.35,
        animationSpeed: 1.0,
        size: 15,
        speed: 1,
      },
      {
        glowColor: this.deepColor,
        flareStrength: 1.5,
        baseGlowStrength: 1.0,
        radialFalloff: 3.0,
        flareFalloff: 2.5,
        edgeFadeStart: 0.2,
        edgeFadeEnd: 0.5,
        baseGlowThreshold: 0.35,
        animationSpeed: 1.0,
        size: 12,
        speed: -1,
      },
            {
        glowColor: this.baseColor,
        flareStrength: 1.5,
        baseGlowStrength: 1.0,
        radialFalloff: 3.0,
        flareFalloff: 2.5,
        edgeFadeStart: 0.2,
        edgeFadeEnd: 0.5,
        baseGlowThreshold: 0.35,
        animationSpeed: 1.0,
        size: 12,
        speed: -1,
      },
      {
        glowColor: this.hotColor,
        flareStrength: 1.5,
        baseGlowStrength: 1.0,
        radialFalloff: 1.0,
        flareFalloff: 2.5,
        edgeFadeStart: 0.2,
        edgeFadeEnd: 0.5,
        baseGlowThreshold: 0.35,
        animationSpeed: 1.0,
        size: 10,
        speed: 0.5,
      },
            {
        glowColor: this.hotColor,
        flareStrength: 1.5,
        baseGlowStrength: 1.0,
        radialFalloff: 1.0,
        flareFalloff: 2.5,
        edgeFadeStart: 0.2,
        edgeFadeEnd: 0.5,
        baseGlowThreshold: 0.35,
        animationSpeed: 1.0,
        size: 10,
        speed: -0.5,
      },
    ],
    lensFLares: {
      active: false,
      elements: [
        {
          src: 'assets/lensflare0.png',
          size: 700,
          distance: 0,
          color: this.hotColor,
        },
        {
          src: 'assets/lensflare3.png',
          size: 60,
          distance: 0.6,
          color: this.hotColor,
        },
        {
          src: 'assets/lensflare3.png',
          size: 70,
          distance: 0.8,
          color: this.hotColor,
        },
        {
          src: 'assets/lensflare3.png',
          size: 120,
          distance: 1,
          color: this.hotColor,
        },
      ],
    },
  };
}

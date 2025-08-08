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
      distortionStrength: 0.1,
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
        active: true,
        depthTest: true,
        zIndex: 1,
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
        scale: 1,
        speed: 0.1,
        syncWithSun: true,
        wrapRotation: true,
        enablePulsing: false,
        pulseFrequency: 0.234,
        pulseAmplitude: 1,
        enableMultiAxisReaction: true,
        rotationReactivity: 0.3,
        rotationDecay: 0.98,
        reactiveScaling: 0.05,
      },
    ],
    solarEruptions: {
      active: true,
      min: {
        count: 1,
        interval: 500,
      },
      max: {
        count: 10,
        interval: 5000,
      },
      flareOptions: {
        min: {
          size: 2,
          lifetime: 3,
          plasmaTrails: 1,
          flareCount: 2,
          turbulance: 0,
        },
        max: {
          size: 4,
          lifetime: 8,
          plasmaTrails: 5,
          flareCount: 6,
          turbulance: 1,
        },
        shader: {
          emissiveStrength: 1.2,
          opacity: 1.0,
          distortionScale: 1.0,
          fadeStart: 0.45,
          fadeEnd: 0.49,
          noiseScaleX: 4.0,
          noiseScaleY: 1.5,
          speed: 1.0,
        },
      },
    },
  };
}

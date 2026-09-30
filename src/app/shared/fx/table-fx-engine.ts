/**
 * WebGL presentation layer for the card table.
 *
 * This module is the only place that imports three.js and is loaded lazily by
 * TableFxService, so the renderer never lands in the initial bundle. It knows
 * nothing about game rules: the director component translates presentation
 * signals into the purely visual verbs exposed here (sparks, shockwaves, ember
 * trails, table mood). Every effect is decorative and may be dropped at any
 * time (context loss, reduced motion, hidden tab) without changing gameplay.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ColorManagement,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  LinearSRGBColorSpace,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Quaternion,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
  type Blending,
} from 'three';

export interface FxPoint {
  readonly x: number;
  readonly y: number;
}

export type FxTier = 'high' | 'low';
export type FxMotion = 'full' | 'static';
export type FxOutcome = 'victory' | 'defeat' | 'tie' | null;

export interface TableFxEngineOptions {
  readonly tier: FxTier;
  readonly motion: FxMotion;
  readonly onContextLost?: () => void;
}

export interface SparkOptions {
  readonly color: string;
  readonly secondary?: string;
  /** Preferred travel direction; sparks fan around it. Zero vector = radial. */
  readonly direction?: FxPoint;
  readonly count?: number;
  readonly speed?: number;
  readonly spread?: number;
}

export interface RingOptions {
  readonly color: string;
  readonly radius: number;
  readonly duration?: number;
  readonly thickness?: number;
  readonly delay?: number;
}

export interface TrailOptions {
  readonly color: string;
  readonly duration: number;
  readonly delay?: number;
  /** Positive arcs upward on screen. */
  readonly arc?: number;
  readonly arrivalPuff?: boolean;
}

// Hex colours below are authored for the screen, and the shaders write them directly.
// Disabling three's linear workflow keeps CSS and WebGL colours identical.
ColorManagement.enabled = false;

const OVERLAY_CAPACITY: Record<FxTier, number> = { high: 6000, low: 2200 };
const SMOKE_CAPACITY: Record<FxTier, number> = { high: 1400, low: 600 };
const CONFETTI_CAPACITY: Record<FxTier, number> = { high: 260, low: 110 };
const EMBER_COUNT: Record<FxTier, number> = { high: 420, low: 160 };
const RING_POOL = 10;

const KIND_SPARK = 0;
const KIND_GLOW = 1;
const KIND_SMOKE = 2;
const KIND_ASH = 3;

/* ------------------------------------------------------------------------ */
/* Shaders                                                                   */
/* ------------------------------------------------------------------------ */

const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FELT_FRAGMENT = /* glsl */ `
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uTension;
  uniform float uPulse;
  uniform vec2 uPulsePos;
  uniform vec3 uFelt;
  uniform vec3 uLamp;
  uniform vec3 uHeat;
  uniform float uOutcome;
  uniform vec2 uShake;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(17.1, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 frag = gl_FragCoord.xy + uShake;
    vec2 p = frag / uRes.y;
    vec2 center = vec2(uRes.x / uRes.y * 0.5, 0.5);

    // Woven baize: fine fibre grain over slow, cloudy dye mottling.
    float grain = noise(frag * 0.85) * 0.55 + noise(frag * 0.31) * 0.45;
    float mottling = fbm(p * 3.1 + vec2(uTime * 0.006, -uTime * 0.004));
    float weave = sin(frag.x * 1.21) * sin(frag.y * 1.17) * 0.5 + 0.5;
    vec3 felt = uFelt * (0.74 + 0.36 * mottling);
    felt = mix(felt, felt * vec3(1.22, 0.92, 0.78), uTension * 0.55);
    felt += (grain - 0.5) * 0.04 + (weave - 0.5) * 0.014;

    // Hanging lamp: soft pool of light with an oil-lamp flicker.
    float flicker = 0.95 + 0.03 * sin(uTime * 7.3) + 0.02 * sin(uTime * 13.1 + 1.7)
      + 0.025 * (noise(vec2(uTime * 2.7, 3.1)) - 0.5) * (1.0 + uTension * 2.0);
    vec2 lampDelta = (p - center) * vec2(0.78, 1.0);
    float pool = exp(-dot(lampDelta, lampDelta) * 3.4) * flicker;
    vec3 lamp = mix(uLamp, uHeat, clamp(uTension * 0.75, 0.0, 1.0));
    vec3 col = felt * (0.34 + 1.0 * pool) + lamp * pool * (0.05 + 0.11 * uTension);

    // Impact bloom where the last clash landed.
    vec2 pp = uPulsePos / uRes.y;
    float pd = length(p - pp);
    col += lamp * uPulse * (exp(-pd * pd * 22.0) * 0.6 + exp(-pd * pd * 4.0) * 0.12);

    // Edges darken like a real table under a single lamp; war heat bleeds in.
    vec2 q = (vUv - 0.5) * vec2(1.0, 1.12);
    float edge = smoothstep(0.28, 0.78, length(q));
    col = mix(col, col * vec3(1.25, 0.55, 0.42) + uHeat * 0.035, edge * uTension * 0.55);
    // Firelight licking in from the rails as a Battle deepens.
    float lick = 0.75 + 0.25 * sin(uTime * 5.1 + p.x * 9.0) * sin(uTime * 3.7 - p.x * 5.0);
    col += uHeat * smoothstep(0.35, 0.95, length(q)) * uTension * 0.22 * lick;

    // Result grade: warm gilt for victory, cold and drained for defeat.
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum) * vec3(0.82, 0.9, 1.05), max(-uOutcome, 0.0) * 0.6);
    col += vec3(0.95, 0.72, 0.32) * max(uOutcome, 0.0) * pool * 0.12;

    col *= 1.0 - edge * 0.6;
    col += (hash(frag + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const EMBER_VERTEX = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uTension;
  uniform float uDensity;
  uniform float uDpr;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float speed = mix(0.012, 0.045, aSeed.y) * (1.0 + uTension * 2.2);
    float life = fract(aSeed.x + uTime * speed);
    float sway = sin(uTime * (0.35 + aSeed.w * 0.6) + aSeed.x * 40.0) * (0.03 + 0.03 * aSeed.y);
    float x = aSeed.z * 2.2 - 1.1 + sway;
    float y = -1.08 + life * 2.2;
    float visible = step(aSeed.w, uDensity);
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.5 + aSeed.y * 5.0) + aSeed.z * 30.0);
    vAlpha = visible * smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.65, 1.0, life)) * twinkle;
    vHeat = aSeed.y;
    gl_Position = vec4(x, y, 0.0, 1.0);
    gl_PointSize = (1.6 + aSeed.w * 3.0) * (1.0 + uTension * 0.9) * uDpr;
  }
`;

const EMBER_FRAGMENT = /* glsl */ `
  uniform float uTension;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = pow(max(1.0 - r, 0.0), 1.4);
    vec3 dust = vec3(1.0, 0.9, 0.72);
    vec3 ember = mix(vec3(1.0, 0.62, 0.22), vec3(1.0, 0.28, 0.1), vHeat);
    vec3 col = mix(dust, ember, clamp(uTension * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vAlpha * (0.3 + 0.7 * uTension));
  }
`;

const PARTICLE_VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute vec2 aVelocity;
  attribute vec4 aParams;
  attribute vec4 aColor;
  uniform float uTime;
  uniform float uDpr;
  varying vec4 vColor;
  varying float vT;

  void main() {
    float age = uTime - aStart.z;
    float life = aParams.x;
    float t = age / life;
    if (age < 0.0 || t > 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vColor = vec4(0.0);
      vT = 1.0;
      return;
    }
    float drag = aParams.w;
    float travel = drag > 0.0 ? (1.0 - exp(-drag * age)) / drag : age;
    vec2 pos = aStart.xy + aVelocity * travel + vec2(0.0, 0.5 * aParams.z * age * age);
    vT = t;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
    float kind = aColor.a;
    float grow = kind > 2.5 ? 1.0 : kind > 1.5 ? (0.6 + t * 2.2) : (kind > 0.5 ? 1.0 + t * 0.4 : 1.0 - t * 0.55);
    gl_PointSize = aParams.y * grow * uDpr;
  }
`;

const PARTICLE_FRAGMENT = /* glsl */ `
  varying vec4 vColor;
  varying float vT;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    float kind = vColor.a;
    float fade = 1.0 - vT;
    vec3 col = vColor.rgb;
    float a;
    if (kind < 0.5) {
      a = pow(1.0 - r, 1.5) * fade;
      col = mix(vec3(1.0, 0.97, 0.9), col, clamp(vT * 2.4, 0.0, 1.0));
    } else if (kind < 1.5) {
      a = exp(-r * r * 3.5) * fade * fade;
    } else if (kind < 2.5) {
      a = (1.0 - smoothstep(0.15, 1.0, r)) * fade * 0.36 * smoothstep(0.0, 0.12, vT);
    } else {
      a = (1.0 - smoothstep(0.35, 1.0, r)) * min(1.0, fade * 4.0) * smoothstep(0.0, 0.08, vT) * 0.85;
    }
    gl_FragColor = vec4(col, a);
  }
`;

const RING_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAGMENT = /* glsl */ `
  uniform float uProgress;
  uniform float uThickness;
  uniform float uMode;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float r = length(vUv);
    float fade = 1.0 - uProgress;
    float a;
    if (uMode < 0.5) {
      float radius = 1.0 - pow(1.0 - uProgress, 3.0);
      float band = uThickness * (1.0 - uProgress * 0.6);
      a = exp(-pow((r - radius) / max(band, 0.001), 2.0)) * fade;
      a += exp(-pow((r - radius * 0.86) / max(band * 2.4, 0.001), 2.0)) * fade * 0.25;
    } else {
      a = exp(-r * r * 5.0) * fade * fade;
    }
    gl_FragColor = vec4(uColor, a);
  }
`;

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

function nowSeconds(): number {
  return performance.now() / 1000;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function colorOf(value: string): Color {
  return new Color(value);
}

function createRenderer(
  canvas: HTMLCanvasElement,
  transparent: boolean,
  onLost: () => void,
): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      alpha: transparent,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'default',
      preserveDrawingBuffer: false,
    });
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    canvas.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        onLost();
      },
      { once: true },
    );
    return renderer;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------------ */
/* GPU particle field: positions are integrated analytically in the shader. */
/* ------------------------------------------------------------------------ */

class ParticleField {
  readonly points: Points;
  private readonly geometry = new BufferGeometry();
  private readonly start: BufferAttribute;
  private readonly velocity: BufferAttribute;
  private readonly params: BufferAttribute;
  private readonly color: BufferAttribute;
  private readonly material: ShaderMaterial;
  private cursor = 0;
  private dirty = false;
  private lastDeath = 0;

  constructor(private readonly capacity: number, blending: Blending) {
    this.start = new BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(DynamicDrawUsage);
    this.velocity = new BufferAttribute(new Float32Array(capacity * 2), 2).setUsage(DynamicDrawUsage);
    this.params = new BufferAttribute(new Float32Array(capacity * 4), 4).setUsage(DynamicDrawUsage);
    this.color = new BufferAttribute(new Float32Array(capacity * 4), 4).setUsage(DynamicDrawUsage);
    // Park every slot far in the past so nothing renders until emitted.
    for (let i = 0; i < capacity; i++) {
      this.start.setZ(i, -1e6);
      this.params.setX(i, 0.001);
    }
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(capacity * 3), 3));
    this.geometry.setAttribute('aStart', this.start);
    this.geometry.setAttribute('aVelocity', this.velocity);
    this.geometry.setAttribute('aParams', this.params);
    this.geometry.setAttribute('aColor', this.color);
    this.material = new ShaderMaterial({
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending,
    });
    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
  }

  emit(
    x: number,
    y: number,
    birth: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    gravity: number,
    drag: number,
    color: Color,
    kind: number,
  ): void {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.capacity;
    this.start.setXYZ(i, x, y, birth);
    this.velocity.setXY(i, vx, vy);
    this.params.setXYZW(i, life, size, gravity, drag);
    this.color.setXYZW(i, color.r, color.g, color.b, kind);
    this.lastDeath = Math.max(this.lastDeath, birth + life);
    this.dirty = true;
  }

  update(time: number, dpr: number): void {
    this.material.uniforms['uTime'].value = time;
    this.material.uniforms['uDpr'].value = dpr;
    if (this.dirty) {
      this.start.needsUpdate = true;
      this.velocity.needsUpdate = true;
      this.params.needsUpdate = true;
      this.color.needsUpdate = true;
      this.dirty = false;
    }
  }

  alive(time: number): boolean {
    return time < this.lastDeath;
  }

  clear(): void {
    for (let i = 0; i < this.capacity; i++) this.start.setZ(i, -1e6);
    this.lastDeath = 0;
    this.dirty = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

interface RingInstance {
  mesh: Mesh;
  material: ShaderMaterial;
  start: number;
  duration: number;
  active: boolean;
}

interface Trail {
  from: FxPoint;
  control: FxPoint;
  to: FxPoint;
  start: number;
  duration: number;
  color: Color;
  last: FxPoint;
  arrivalPuff: boolean;
}

interface ConfettiPiece {
  position: Vector3;
  velocity: Vector3;
  rotation: Euler;
  spin: Vector3;
  size: number;
  phase: number;
  born: number;
  life: number;
}

interface Scheduled {
  at: number;
  run: () => void;
}

/* ------------------------------------------------------------------------ */
/* Engine                                                                    */
/* ------------------------------------------------------------------------ */

export class TableFxEngine {
  private motion: FxMotion;
  private readonly tier: FxTier;
  private clockAnchor = nowSeconds();
  private clockBase = 0;
  private timeScale = 1;
  private disposed = false;
  private hidden = false;

  // Backdrop
  private backdropRenderer: WebGLRenderer | null = null;
  private backdropScene: Scene | null = null;
  private backdropCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private feltMaterial: ShaderMaterial | null = null;
  private emberMaterial: ShaderMaterial | null = null;
  private backdropSize = { width: 1, height: 1, dpr: 1 };
  private backdropFrame = 0;
  private backdropLastRender = 0;
  private tension = 0;
  private tensionTarget = 0;
  private outcome = 0;
  private outcomeTarget = 0;
  private pulse = 0;
  private shakeEnergy = 0;

  // Overlay
  private overlayRenderer: WebGLRenderer | null = null;
  private overlayScene: Scene | null = null;
  private overlayCamera = new OrthographicCamera(0, 1, 0, 1, -10, 10);
  private overlaySize = { width: 1, height: 1, dpr: 1 };
  private additive: ParticleField | null = null;
  private smoke: ParticleField | null = null;
  private rings: RingInstance[] = [];
  private trails: Trail[] = [];
  private confetti: ConfettiPiece[] = [];
  private confettiMesh: InstancedMesh | null = null;
  private scheduled: Scheduled[] = [];
  private overlayFrame = 0;

  private readonly scratchMatrix = new Matrix4();
  private readonly scratchQuat = new Quaternion();
  private readonly scratchScale = new Vector3();
  private readonly onVisibility = () => {
    this.hidden = document.visibilityState === 'hidden';
    if (!this.hidden) {
      this.requestBackdropLoop();
      this.requestOverlayLoop();
    }
  };

  constructor(private readonly options: TableFxEngineOptions) {
    this.tier = options.tier;
    this.motion = options.motion;
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  get time(): number {
    return this.clockBase + (nowSeconds() - this.clockAnchor) * this.timeScale;
  }

  /** Slow motion for tuning (1 = real time). Effects already in flight re-time smoothly. */
  setTimeScale(scale: number): void {
    this.clockBase = this.time;
    this.clockAnchor = nowSeconds();
    this.timeScale = Math.max(0, scale);
  }

  /* ------------------------------ lifecycle ----------------------------- */

  attachBackdrop(canvas: HTMLCanvasElement): boolean {
    this.detachBackdrop();
    const renderer = createRenderer(canvas, false, () => this.handleContextLost());
    if (!renderer) return false;
    this.backdropRenderer = renderer;

    const scene = new Scene();
    const triangle = new BufferGeometry();
    triangle.setAttribute(
      'position',
      new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    );
    this.feltMaterial = new ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: FELT_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uTension: { value: 0 },
        uPulse: { value: 0 },
        uPulsePos: { value: [0, 0] },
        uFelt: { value: colorOf('#17473a') },
        uLamp: { value: colorOf('#ffd9a0') },
        uHeat: { value: colorOf('#ff5a2a') },
        uOutcome: { value: 0 },
        uShake: { value: [0, 0] },
      },
    });
    const felt = new Mesh(triangle, this.feltMaterial);
    felt.frustumCulled = false;
    scene.add(felt);

    const emberCount = EMBER_COUNT[this.tier];
    const emberGeometry = new BufferGeometry();
    const seeds = new Float32Array(emberCount * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    emberGeometry.setAttribute('position', new BufferAttribute(new Float32Array(emberCount * 3), 3));
    emberGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 4));
    this.emberMaterial = new ShaderMaterial({
      vertexShader: EMBER_VERTEX,
      fragmentShader: EMBER_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTension: { value: 0 },
        uDensity: { value: 0.3 },
        uDpr: { value: 1 },
      },
    });
    const embers = new Points(emberGeometry, this.emberMaterial);
    embers.frustumCulled = false;
    scene.add(embers);

    this.backdropScene = scene;
    this.renderBackdrop(true);
    this.requestBackdropLoop();
    return true;
  }

  detachBackdrop(): void {
    cancelAnimationFrame(this.backdropFrame);
    this.backdropFrame = 0;
    this.backdropScene?.traverse((node) => {
      const mesh = node as Mesh;
      mesh.geometry?.dispose();
      (mesh.material as ShaderMaterial | undefined)?.dispose?.();
    });
    this.backdropRenderer?.dispose();
    this.backdropRenderer = null;
    this.backdropScene = null;
    this.feltMaterial = null;
    this.emberMaterial = null;
  }

  attachOverlay(canvas: HTMLCanvasElement): boolean {
    this.detachOverlay();
    const renderer = createRenderer(canvas, true, () => this.handleContextLost());
    if (!renderer) return false;
    this.overlayRenderer = renderer;
    const scene = new Scene();

    this.smoke = new ParticleField(SMOKE_CAPACITY[this.tier], NormalBlending);
    this.additive = new ParticleField(OVERLAY_CAPACITY[this.tier], AdditiveBlending);
    scene.add(this.smoke.points);

    const confettiMaterial = new MeshBasicMaterial({
      side: DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.confettiMesh = new InstancedMesh(
      new PlaneGeometry(1, 0.62),
      confettiMaterial,
      CONFETTI_CAPACITY[this.tier],
    );
    this.confettiMesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.confettiMesh.count = 0;
    this.confettiMesh.frustumCulled = false;
    const palette = ['#f5c451', '#ffe7a3', '#d9a03a', '#fff6dc', '#c8374a', '#f08a4b'].map(colorOf);
    for (let i = 0; i < CONFETTI_CAPACITY[this.tier]; i++) {
      this.confettiMesh.setColorAt(i, palette[i % palette.length]);
    }
    scene.add(this.confettiMesh);
    scene.add(this.additive.points);

    const ringGeometry = new PlaneGeometry(1, 1);
    for (let i = 0; i < RING_POOL; i++) {
      const material = new ShaderMaterial({
        vertexShader: RING_VERTEX,
        fragmentShader: RING_FRAGMENT,
        side: DoubleSide,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uThickness: { value: 0.06 },
          uMode: { value: 0 },
          uColor: { value: new Color('#ffffff') },
        },
      });
      const mesh = new Mesh(ringGeometry, material);
      mesh.visible = false;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.rings.push({ mesh, material, start: 0, duration: 1, active: false });
    }

    this.overlayScene = scene;
    return true;
  }

  detachOverlay(): void {
    cancelAnimationFrame(this.overlayFrame);
    this.overlayFrame = 0;
    this.additive?.dispose();
    this.smoke?.dispose();
    this.rings.forEach((ring) => ring.material.dispose());
    this.rings[0]?.mesh.geometry.dispose();
    this.confettiMesh?.geometry.dispose();
    (this.confettiMesh?.material as MeshBasicMaterial | undefined)?.dispose();
    this.confettiMesh?.dispose();
    this.overlayRenderer?.dispose();
    this.overlayRenderer = null;
    this.overlayScene = null;
    this.additive = null;
    this.smoke = null;
    this.rings = [];
    this.trails = [];
    this.confetti = [];
    this.confettiMesh = null;
    this.scheduled = [];
  }

  dispose(): void {
    this.disposed = true;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.detachBackdrop();
    this.detachOverlay();
  }

  resizeBackdrop(width: number, height: number, dpr: number): void {
    if (!this.backdropRenderer || width < 1 || height < 1) return;
    const cappedDpr = Math.min(dpr, this.tier === 'high' ? 1.5 : 1);
    this.backdropSize = { width, height, dpr: cappedDpr };
    this.backdropRenderer.setPixelRatio(cappedDpr);
    this.backdropRenderer.setSize(width, height, false);
    if (this.feltMaterial) {
      this.feltMaterial.uniforms['uRes'].value = [width * cappedDpr, height * cappedDpr];
    }
    this.renderBackdrop(true);
  }

  resizeOverlay(width: number, height: number, dpr: number): void {
    if (!this.overlayRenderer || width < 1 || height < 1) return;
    const cappedDpr = Math.min(dpr, this.tier === 'high' ? 2 : 1.25);
    this.overlaySize = { width, height, dpr: cappedDpr };
    this.overlayRenderer.setPixelRatio(cappedDpr);
    this.overlayRenderer.setSize(width, height, false);
    // CSS-pixel space with y growing downward, matching getBoundingClientRect.
    this.overlayCamera.left = 0;
    this.overlayCamera.right = width;
    this.overlayCamera.top = 0;
    this.overlayCamera.bottom = height;
    this.overlayCamera.updateProjectionMatrix();
    this.overlayRenderer.clear();
  }

  setMotion(motion: FxMotion): void {
    if (this.motion === motion) return;
    this.motion = motion;
    if (motion === 'static') {
      this.additive?.clear();
      this.smoke?.clear();
      this.trails = [];
      this.confetti = [];
      this.scheduled = [];
      this.rings.forEach((ring) => {
        ring.active = false;
        ring.mesh.visible = false;
      });
      this.overlayRenderer?.clear();
      this.tension = this.tensionTarget;
      this.outcome = this.outcomeTarget;
      this.pulse = 0;
      this.shakeEnergy = 0;
    }
    this.renderBackdrop(true);
    this.requestBackdropLoop();
  }

  /* -------------------------------- mood -------------------------------- */

  /** 0 = quiet table, 1 = deep recursive Battle. */
  setTension(value: number): void {
    this.tensionTarget = Math.max(0, Math.min(1, value));
    if (this.motion === 'static') {
      this.tension = this.tensionTarget;
      this.renderBackdrop(true);
    }
    this.requestBackdropLoop();
  }

  setOutcome(outcome: FxOutcome): void {
    this.outcomeTarget = outcome === 'victory' ? 1 : outcome === 'defeat' ? -1 : 0;
    if (this.motion === 'static') {
      this.outcome = this.outcomeTarget;
      this.renderBackdrop(true);
    }
    this.requestBackdropLoop();
  }

  /** Blooms the lamp light at a backdrop-local CSS pixel position. */
  pulseBackdrop(at: FxPoint, strength = 1): void {
    if (this.motion === 'static' || !this.feltMaterial) return;
    const { height, dpr } = this.backdropSize;
    this.feltMaterial.uniforms['uPulsePos'].value = [at.x * dpr, (height - at.y) * dpr];
    this.pulse = Math.min(1.6, this.pulse + strength);
    this.requestBackdropLoop();
  }

  shake(strength: number): void {
    if (this.motion === 'static') return;
    this.shakeEnergy = Math.min(14, this.shakeEnergy + strength);
    this.requestBackdropLoop();
  }

  /* ------------------------------ overlay verbs ------------------------- */

  after(delayMs: number, run: () => void): void {
    if (this.motion === 'static' || !this.overlayScene) return;
    this.scheduled.push({ at: this.time + Math.max(0, delayMs) / 1000, run });
    this.requestOverlayLoop();
  }

  sparks(at: FxPoint, options: SparkOptions): void {
    if (!this.canPlay() || !this.additive) return;
    const scale = this.tier === 'high' ? 1 : 0.5;
    const count = Math.round((options.count ?? 60) * scale);
    const primary = colorOf(options.color);
    const secondary = colorOf(options.secondary ?? options.color);
    const primaryHalo = primary.clone().multiplyScalar(0.3);
    const secondaryHalo = secondary.clone().multiplyScalar(0.3);
    const dir = options.direction ?? { x: 0, y: 0 };
    const hasDirection = Math.abs(dir.x) + Math.abs(dir.y) > 0.01;
    const baseAngle = Math.atan2(dir.y, dir.x);
    const spread = options.spread ?? (hasDirection ? 1.1 : Math.PI);
    const speed = options.speed ?? 520;
    const t = this.time;

    for (let i = 0; i < count; i++) {
      const angle = hasDirection ? baseAngle + rand(-spread, spread) : rand(0, Math.PI * 2);
      const v = speed * rand(0.35, 1.15);
      const vx = Math.cos(angle) * v;
      const vy = Math.sin(angle) * v;
      const color = Math.random() < 0.7 ? primary : secondary;
      const life = rand(0.4, 0.95);
      const size = rand(3.2, 6.4);
      // Stacked particles on one trajectory read as a motion-blurred streak.
      for (let s = 0; s < 4; s++) {
        this.additive.emit(at.x, at.y, t + s * 0.012, vx, vy, life, size * (1 - s * 0.2), 900, 2.6, color, KIND_SPARK);
      }
      // A dim, wide halo riding the same path fakes bloom without a post pass.
      this.additive.emit(at.x, at.y, t, vx, vy, life * 0.7, size * 5, 900, 2.6, color === primary ? primaryHalo : secondaryHalo, KIND_GLOW);
    }
    // Hot core.
    this.additive.emit(at.x, at.y, t, 0, 0, 0.32, 70, 0, 0, primary, KIND_GLOW);
    this.additive.emit(at.x, at.y, t, 0, 0, 0.18, 36, 0, 0, colorOf('#fff7e0'), KIND_GLOW);
    this.requestOverlayLoop();
  }

  embers(at: FxPoint, options: { color: string; count?: number; rise?: number; width?: number }): void {
    if (!this.canPlay() || !this.additive) return;
    const count = Math.round((options.count ?? 40) * (this.tier === 'high' ? 1 : 0.5));
    const color = colorOf(options.color);
    const width = options.width ?? 40;
    const t = this.time;
    for (let i = 0; i < count; i++) {
      this.additive.emit(
        at.x + rand(-width, width),
        at.y + rand(-8, 8),
        t + rand(0, 0.25),
        rand(-40, 40),
        -rand(60, options.rise ?? 220),
        rand(0.8, 1.6),
        rand(2, 4.5),
        -40,
        1.2,
        color,
        KIND_GLOW,
      );
    }
    this.requestOverlayLoop();
  }

  dust(at: FxPoint, options: { color?: string; count?: number; spread?: number; width?: number } = {}): void {
    if (!this.canPlay() || !this.smoke) return;
    const count = Math.round((options.count ?? 18) * (this.tier === 'high' ? 1 : 0.6));
    const color = colorOf(options.color ?? '#b9ad8f');
    const spread = options.spread ?? 120;
    const width = options.width ?? 30;
    const t = this.time;
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      this.smoke.emit(
        at.x + rand(-width, width),
        at.y + rand(-6, 6),
        t + rand(0, 0.06),
        Math.cos(angle) * spread * rand(0.3, 1),
        Math.sin(angle) * spread * rand(0.15, 0.55) - 12,
        rand(0.55, 1.1),
        rand(11, 22),
        -18,
        3.2,
        color,
        KIND_SMOKE,
      );
    }
    this.requestOverlayLoop();
  }

  ring(at: FxPoint, options: RingOptions): void {
    if (!this.canPlay()) return;
    const run = () => this.spawnRing(at, options.radius, options.color, options.duration ?? 0.6, options.thickness ?? 0.06, 0);
    if (options.delay) this.after(options.delay, run);
    else run();
  }

  flash(at: FxPoint, radius: number, color: string, duration = 0.28): void {
    if (!this.canPlay()) return;
    this.spawnRing(at, radius, color, duration, 0, 1);
  }

  trail(from: FxPoint, to: FxPoint, options: TrailOptions): void {
    if (!this.canPlay()) return;
    const run = () => {
      const arc = options.arc ?? 60;
      const control = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - arc };
      this.trails.push({
        from,
        control,
        to,
        start: this.time,
        duration: Math.max(0.15, options.duration),
        color: colorOf(options.color),
        last: from,
        arrivalPuff: options.arrivalPuff ?? true,
      });
      this.requestOverlayLoop();
    };
    if (options.delay) this.after(options.delay, run);
    else run();
  }

  confettiBurst(origin: FxPoint, count: number, options: { fromBelow?: boolean } = {}): void {
    if (!this.canPlay() || !this.confettiMesh) return;
    const capacity = CONFETTI_CAPACITY[this.tier];
    const budget = Math.min(Math.round(count * (this.tier === 'high' ? 1 : 0.45)), capacity - this.confetti.length);
    const t = this.time;
    for (let i = 0; i < budget; i++) {
      const angle = options.fromBelow ? rand(-Math.PI * 0.78, -Math.PI * 0.22) : rand(0, Math.PI * 2);
      const speed = options.fromBelow ? rand(950, 1550) : rand(220, 620);
      this.confetti.push({
        position: new Vector3(origin.x + rand(-20, 20), origin.y + rand(-10, 10), 0),
        velocity: new Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0),
        rotation: new Euler(rand(0, 6), rand(0, 6), rand(0, 6)),
        spin: new Vector3(rand(-9, 9), rand(-9, 9), rand(-4, 4)),
        size: rand(7, 13),
        phase: rand(0, 10),
        born: t,
        life: rand(2.6, 4.2),
      });
    }
    this.requestOverlayLoop();
  }

  ashfall(width: number, count: number): void {
    if (!this.canPlay() || !this.smoke || !this.additive) return;
    const scaled = Math.round(count * (this.tier === 'high' ? 1 : 0.5));
    const t = this.time;
    const ash = colorOf('#8d9290');
    const cinder = colorOf('#ff7a3d');
    for (let i = 0; i < scaled; i++) {
      const birth = t + rand(0, 2.2);
      const x = rand(0, width);
      this.smoke.emit(x, rand(-40, -10), birth, rand(-25, 25), rand(70, 130), rand(5, 7.5), rand(3, 6.5), 4, 0.15, ash, KIND_ASH);
      if (i % 5 === 0) {
        this.additive.emit(x, rand(-30, 0), birth, rand(-20, 20), rand(50, 110), rand(2.5, 4), rand(2, 3), 0, 0.1, cinder, KIND_GLOW);
      }
    }
    this.requestOverlayLoop();
  }

  starburst(at: FxPoint, color: string, secondary = '#fff3c4'): void {
    if (!this.canPlay()) return;
    this.flash(at, 150, color, 0.4);
    this.ring(at, { color, radius: 120, duration: 0.7, thickness: 0.05 });
    this.sparks(at, { color, secondary, count: 90, speed: 420 });
    this.embers(at, { color, count: 26, width: 18, rise: 160 });
  }

  /* ------------------------------ internals ----------------------------- */

  private canPlay(): boolean {
    return !this.disposed && this.motion === 'full' && !!this.overlayScene;
  }

  private spawnRing(at: FxPoint, radius: number, color: string, duration: number, thickness: number, mode: number): void {
    const ring = this.rings.find((candidate) => !candidate.active) ?? this.rings[0];
    if (!ring) return;
    ring.active = true;
    ring.start = this.time;
    ring.duration = duration;
    ring.mesh.visible = true;
    ring.mesh.position.set(at.x, at.y, 0);
    ring.mesh.scale.set(radius * 2, radius * 2, 1);
    ring.material.uniforms['uColor'].value = colorOf(color);
    ring.material.uniforms['uThickness'].value = thickness;
    ring.material.uniforms['uMode'].value = mode;
    ring.material.uniforms['uProgress'].value = 0;
    this.requestOverlayLoop();
  }

  private handleContextLost(): void {
    this.options.onContextLost?.();
  }

  private requestBackdropLoop(): void {
    if (this.disposed || this.hidden || !this.backdropRenderer || this.backdropFrame) return;
    this.backdropFrame = requestAnimationFrame(this.backdropTick);
  }

  private readonly backdropTick = (): void => {
    this.backdropFrame = 0;
    if (this.disposed || this.hidden || !this.backdropRenderer) return;
    if (this.motion === 'static') {
      this.renderBackdrop(true);
      return;
    }
    // Ambient motion is slow; 30fps on modest hardware saves battery without visible cost.
    const minInterval = this.tier === 'high' ? 1 / 60 : 1 / 30;
    const now = this.time;
    if (now - this.backdropLastRender >= minInterval - 0.002) {
      this.renderBackdrop(false);
    }
    this.backdropFrame = requestAnimationFrame(this.backdropTick);
  };

  private renderBackdrop(immediate: boolean): void {
    if (!this.backdropRenderer || !this.backdropScene || !this.feltMaterial || !this.emberMaterial) return;
    const now = this.time;
    const dt = immediate ? 0 : Math.min(0.1, now - this.backdropLastRender);
    this.backdropLastRender = now;

    const ease = 1 - Math.exp(-dt * 1.6);
    this.tension += (this.tensionTarget - this.tension) * (immediate && this.motion === 'static' ? 1 : ease);
    this.outcome += (this.outcomeTarget - this.outcome) * (immediate && this.motion === 'static' ? 1 : 1 - Math.exp(-dt * 0.9));
    this.pulse *= Math.exp(-dt * 3.2);
    this.shakeEnergy *= Math.exp(-dt * 7);
    const shake = this.shakeEnergy > 0.05
      ? [Math.sin(now * 91) * this.shakeEnergy, Math.cos(now * 77) * this.shakeEnergy * 0.7]
      : [0, 0];

    const staticTime = this.motion === 'static' ? 12.5 : now;
    const felt = this.feltMaterial.uniforms;
    felt['uTime'].value = staticTime;
    felt['uTension'].value = this.tension;
    felt['uPulse'].value = this.pulse;
    felt['uOutcome'].value = this.outcome;
    felt['uShake'].value = shake;
    const ember = this.emberMaterial.uniforms;
    ember['uTime'].value = staticTime;
    ember['uTension'].value = this.tension;
    ember['uDensity'].value = this.motion === 'static' ? 0 : 0.28 + this.tension * 0.72;
    ember['uDpr'].value = this.backdropSize.dpr;
    this.backdropRenderer.render(this.backdropScene, this.backdropCamera);
  }

  private requestOverlayLoop(): void {
    if (this.disposed || this.hidden || !this.overlayRenderer || this.overlayFrame) return;
    this.overlayFrame = requestAnimationFrame(this.overlayTick);
  }

  private lastOverlayTime = 0;

  private readonly overlayTick = (): void => {
    this.overlayFrame = 0;
    if (this.disposed || !this.overlayRenderer || !this.overlayScene) return;
    const now = this.time;
    const dt = this.lastOverlayTime ? Math.min(0.05, now - this.lastOverlayTime) : 1 / 60;
    this.lastOverlayTime = now;

    this.runScheduled(now);
    this.updateTrails(now);
    const ringsActive = this.updateRings(now);
    const confettiActive = this.updateConfetti(now, dt);
    const { dpr } = this.overlaySize;
    this.additive?.update(now, dpr);
    this.smoke?.update(now, dpr);

    this.overlayRenderer.render(this.overlayScene, this.overlayCamera);

    const busy =
      ringsActive ||
      confettiActive ||
      this.trails.length > 0 ||
      this.scheduled.length > 0 ||
      !!this.additive?.alive(now) ||
      !!this.smoke?.alive(now);
    if (busy && !this.hidden) {
      this.overlayFrame = requestAnimationFrame(this.overlayTick);
    } else {
      this.lastOverlayTime = 0;
      if (!busy) this.overlayRenderer.clear();
    }
  };

  private runScheduled(now: number): void {
    if (!this.scheduled.length) return;
    const due = this.scheduled.filter((item) => item.at <= now);
    if (!due.length) return;
    this.scheduled = this.scheduled.filter((item) => item.at > now);
    for (const item of due) item.run();
  }

  private updateTrails(now: number): void {
    if (!this.trails.length || !this.additive) return;
    const remaining: Trail[] = [];
    for (const trail of this.trails) {
      const progress = Math.min(1, (now - trail.start) / trail.duration);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const inv = 1 - eased;
      const head = {
        x: inv * inv * trail.from.x + 2 * inv * eased * trail.control.x + eased * eased * trail.to.x,
        y: inv * inv * trail.from.y + 2 * inv * eased * trail.control.y + eased * eased * trail.to.y,
      };
      const steps = this.tier === 'high' ? 4 : 2;
      for (let s = 0; s < steps; s++) {
        const f = s / steps;
        const x = trail.last.x + (head.x - trail.last.x) * f;
        const y = trail.last.y + (head.y - trail.last.y) * f;
        this.additive.emit(x, y, now, rand(-18, 18), rand(-30, 6), rand(0.35, 0.7), rand(5, 9), -30, 2, trail.color, KIND_GLOW);
        if (Math.random() < 0.45) {
          this.additive.emit(x, y, now, rand(-60, 60), rand(-60, 30), rand(0.3, 0.55), rand(1.8, 3), 380, 2, trail.color, KIND_SPARK);
        }
      }
      trail.last = head;
      if (progress >= 1) {
        if (trail.arrivalPuff) {
          this.dust(trail.to, { color: '#6d6353', count: 8, spread: 60, width: 10 });
          this.additive.emit(trail.to.x, trail.to.y, now, 0, 0, 0.35, 44, 0, 0, trail.color, KIND_GLOW);
        }
      } else {
        remaining.push(trail);
      }
    }
    this.trails = remaining;
  }

  private updateRings(now: number): boolean {
    let active = false;
    for (const ring of this.rings) {
      if (!ring.active) continue;
      const progress = (now - ring.start) / ring.duration;
      if (progress >= 1) {
        ring.active = false;
        ring.mesh.visible = false;
        continue;
      }
      ring.material.uniforms['uProgress'].value = progress;
      active = true;
    }
    return active;
  }

  private updateConfetti(now: number, dt: number): boolean {
    const mesh = this.confettiMesh;
    if (!mesh) return false;
    if (!this.confetti.length) {
      mesh.count = 0;
      return false;
    }
    const height = this.overlaySize.height;
    const alive: ConfettiPiece[] = [];
    for (const piece of this.confetti) {
      const age = now - piece.born;
      if (age > piece.life || piece.position.y > height + 40) continue;
      // Paper physics: strong air drag, gentle gravity and a side-to-side flutter.
      piece.velocity.x += Math.sin(now * 3 + piece.phase) * 180 * dt;
      piece.velocity.y += 420 * dt;
      piece.velocity.multiplyScalar(Math.exp(-1.7 * dt));
      piece.position.addScaledVector(piece.velocity, dt);
      piece.rotation.x += piece.spin.x * dt;
      piece.rotation.y += piece.spin.y * dt;
      piece.rotation.z += piece.spin.z * dt;
      alive.push(piece);
    }
    this.confetti = alive;
    mesh.count = alive.length;
    alive.forEach((piece, index) => {
      const fade = Math.min(1, (piece.life - (now - piece.born)) / 0.6);
      this.scratchQuat.setFromEuler(piece.rotation);
      this.scratchScale.set(piece.size * fade, piece.size * fade, 1);
      this.scratchMatrix.compose(piece.position, this.scratchQuat, this.scratchScale);
      mesh.setMatrixAt(index, this.scratchMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    return alive.length > 0;
  }
}

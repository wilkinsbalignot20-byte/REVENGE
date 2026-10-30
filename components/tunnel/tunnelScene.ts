import * as THREE from "three";
import { Text } from "troika-three-text";

export type TunnelOptions = {
  /** Buong URL ng mga larawan (galing sa Cloudinary) */
  imageUrls: string[];
  title: string;
  message: string;
  buttonLabel: string;
  onButtonClick: () => void;
};

type CardData = {
  path: string;
  side: "left" | "right";
  zOffset: number;
  yOffset: number;
  scaleX: number;
  scaleY: number;
};

const CAMERA_Z = 8;
const CAMERA_FOV = 55;
const FAR_Z = -100;
const NEAR_Z = 12;
const TOTAL_DEPTH = NEAR_Z - FAR_Z;
const WALL_DISTANCE = 4.5;
const SCROLL_SPEED = 0.4;
const AUTO_FORWARD_SPEED = 0.02;
const MOUSE_SMOOTHING = 0.08;
const CENTER_VOID_START_Z = -24;
const CENTER_VOID_FADE_DEPTH = 10;
const SCENE_TEXT_Z = -30;
const PAPER_GLOSS_IDLE = 0.18;
const PAPER_GLOSS_NARROW = 0.08;
const DEFAULT_IMAGE_ASPECT = 0.75;
const BASE_VISIBLE_CARDS = 40;
const TOTAL_CARDS = 84;
const CARD_SPACING = TOTAL_DEPTH / (BASE_VISIBLE_CARDS / 2);
const TUNNEL_LOOP_DEPTH = CARD_SPACING * (TOTAL_CARDS / 2);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const wrap01 = (value: number) => ((value % 1) + 1) % 1;

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getShuffledImages = (images: string[], seed: number) => {
  const random = createSeededRandom(seed);
  const shuffled = [...images];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[nextIndex];
    shuffled[nextIndex] = current;
  }
  return shuffled;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uGlossEnergy;
  uniform float uNarrowGloss;
  uniform float uGlossShift;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec2 sampleUv = clamp(vUv, vec2(0.001), vec2(0.999));
    vec4 color = texture2D(uTexture, sampleUv);
    float glossEnergy = clamp(uGlossEnergy, 0.0, 1.0);
    float narrowEnergy = clamp(uNarrowGloss, 0.0, 1.0);
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(vViewDirection);
    float facing = clamp(abs(dot(normal, viewDirection)), 0.0, 1.0);
    float grazing = pow(1.0 - facing, 1.75);
    float laminate = pow(facing, 0.45);
    float baseSheenAxis = sampleUv.x + sampleUv.y * 0.18;
    float baseCenter = 0.5 + (uGlossShift - 0.5) * 0.26;
    float baseGloss = exp(-pow((baseSheenAxis - baseCenter) / 0.28, 2.0)) * glossEnergy * (0.08 + laminate * 0.08 + grazing * 0.04);
    float narrowSheenAxis = sampleUv.x + sampleUv.y * 0.34;
    float narrowSheenCenter = 0.42 + (uGlossShift - 0.5) * 0.3;
    float narrowGloss = exp(-pow((narrowSheenAxis - narrowSheenCenter) / 0.13, 2.0)) * narrowEnergy * (0.04 + grazing * 0.1);
    float topReflection = smoothstep(0.64, 1.0, sampleUv.y) * smoothstep(0.05, 0.55, sampleUv.x) * glossEnergy * grazing * 0.05;
    float centerMask = smoothstep(0.0, 0.18, sampleUv.x) * (1.0 - smoothstep(0.82, 1.0, sampleUv.x));
    float edgeShadow = (1.0 - centerMask) * glossEnergy * 0.04;
    float edgeVignette = smoothstep(0.0, 0.1, min(min(sampleUv.x, 1.0 - sampleUv.x), min(sampleUv.y, 1.0 - sampleUv.y)));

    color.rgb *= 1.0 + glossEnergy * 0.03;
    color.rgb *= 1.0 - edgeShadow;
    color.rgb *= mix(0.96, 1.0, edgeVignette);
    color.rgb += vec3(1.0) * (baseGloss + narrowGloss + topReflection);
    color.a *= uOpacity;

    if (color.a <= 0.002) {
      discard;
    }

    gl_FragColor = color;

    #include <colorspace_fragment>
  }
`;

/**
 * Binubuo ang 3D photo tunnel sa loob ng canvas.
 * Ibinabalik ang cleanup function na dapat tawagin kapag na-unmount ang component.
 */
export function createTunnel(canvas: HTMLCanvasElement, options: TunnelOptions) {
  let disposed = false;

  const tunnelImages = getShuffledImages(options.imageUrls, 1404).slice(0, TOTAL_CARDS);

  const createCardsData = (): CardData[] => {
    const random = createSeededRandom(404);
    const cards: CardData[] = [];
    for (let index = 0; index < TOTAL_CARDS; index += 1) {
      const side = index % 2 === 0 ? "left" : "right";
      const pairIndex = Math.floor(index / 2);
      const zOffset = pairIndex * CARD_SPACING + (random() - 0.5) * CARD_SPACING * 0.4;
      const cardHeight = lerp(2.2, 4.0, random());
      const yOffset = (random() - 0.5) * 1.5;
      cards.push({
        // Walang larawan = walang path, gray placeholder lang ang ipapakita
        path: tunnelImages.length ? tunnelImages[index % tunnelImages.length] : "",
        side,
        zOffset,
        yOffset,
        scaleX: cardHeight * DEFAULT_IMAGE_ASPECT,
        scaleY: cardHeight,
      });
    }
    return cards;
  };

  const makePlaceholderTexture = () => {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 2;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#dcdcdc";
      ctx.fillRect(0, 0, 2, 2);
    }
    return new THREE.CanvasTexture(c);
  };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0xf2f2f2, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, CAMERA_Z);

  const placeholderTexture = makePlaceholderTexture();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin("anonymous");
  const cardGeometry = new THREE.PlaneGeometry(1, 1);
  const loadedTextures: THREE.Texture[] = [];

  const cards = createCardsData().map((data, index) => {
    const uniforms = {
      uTexture: { value: placeholderTexture as THREE.Texture },
      uOpacity: { value: 1 },
      uGlossEnergy: { value: PAPER_GLOSS_IDLE },
      uNarrowGloss: { value: PAPER_GLOSS_NARROW },
      uGlossShift: { value: 0.5 },
    };
    const material = new THREE.ShaderMaterial({
      transparent: true,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(cardGeometry, material);
    mesh.visible = false;
    scene.add(mesh);

    if (data.path) {
      textureLoader.load(
        data.path,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = maxAnisotropy;
          loadedTextures.push(texture);
          uniforms.uTexture.value = texture;
        },
        undefined,
        // Kapag pumalya ang isang larawan, mananatiling gray placeholder lang ito.
        () => console.warn("Tunnel image failed to load:", data.path)
      );
    }

    return { data, index, mesh, material, uniforms };
  });

  const overlay = new THREE.Group();
  overlay.position.set(0, 0.1, SCENE_TEXT_Z);
  scene.add(overlay);

  const textMeshes: Text[] = [];
  const addText = (
    parent: THREE.Object3D,
    text: string,
    properties: Record<string, unknown>,
    position: [number, number, number],
    renderOrder: number
  ) => {
    const mesh = new Text();
    Object.assign(mesh, {
      text,
      anchorX: "center",
      anchorY: "middle",
      sdfGlyphSize: 64,
      ...properties,
    });
    mesh.position.set(...position);
    mesh.renderOrder = renderOrder;
    parent.add(mesh);
    mesh.sync();
    textMeshes.push(mesh);
    return mesh;
  };

  addText(
    overlay,
    options.title,
    { color: "#070912", fontSize: 2.52, fontWeight: 500, letterSpacing: -0.02 },
    [0, 2.05, 0],
    20
  );
  addText(
    overlay,
    options.message,
    {
      color: "#070912",
      fillOpacity: 0.6,
      fontSize: 0.48,
      lineHeight: 1.25,
      maxWidth: 7.2,
      textAlign: "center",
    },
    [0, 0.1, 0],
    20
  );

  // Rounded 3D button
  const radius = 0.625;
  const epsilon = 0.00001;
  const buttonShape = new THREE.Shape();
  buttonShape.absarc(epsilon, epsilon, epsilon, -Math.PI / 2, -Math.PI, true);
  buttonShape.absarc(epsilon, 1.25 - (radius - epsilon) * 2, epsilon, Math.PI, Math.PI / 2, true);
  buttonShape.absarc(
    4.1 - (radius - epsilon) * 2,
    1.25 - (radius - epsilon) * 2,
    epsilon,
    Math.PI / 2,
    0,
    true
  );
  buttonShape.absarc(4.1 - (radius - epsilon) * 2, epsilon, epsilon, 0, -Math.PI / 2, true);
  const buttonGeometry = new THREE.ExtrudeGeometry(buttonShape, {
    depth: 0.12 - radius * 2,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize: radius - epsilon,
    bevelThickness: radius,
    curveSegments: 24,
  });
  buttonGeometry.center();
  const buttonGroup = new THREE.Group();
  buttonGroup.position.set(0, -1.8, 0);
  overlay.add(buttonGroup);
  const buttonMaterial = new THREE.MeshBasicMaterial({ color: "#16161f", toneMapped: false });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
  buttonGroup.add(button);
  addText(
    buttonGroup,
    options.buttonLabel,
    { color: "#ffffff", fontSize: 0.38, fontWeight: 700, letterSpacing: 0.12 },
    [0, 0, 0.08],
    21
  );

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  let buttonHovered = false;
  let lastTouchY: number | null = null;

  const state = {
    scrollOffset: 0,
    velocity: 0,
    speedMultiplier: 1,
    targetSpeedMultiplier: 1,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
  };

  const tmpVector = new THREE.Vector3();
  const tmpQuaternion = new THREE.Quaternion();
  const tmpEuler = new THREE.Euler();

  const updateHover = (clientX: number, clientY: number) => {
    pointerNdc.set(
      (clientX / window.innerWidth) * 2 - 1,
      -((clientY / window.innerHeight) * 2 - 1)
    );
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObject(button, false).length > 0;
    if (hit !== buttonHovered) {
      buttonHovered = hit;
      canvas.style.cursor = hit ? "pointer" : "";
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    state.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    state.mouse.targetY = -((event.clientY / window.innerHeight) * 2 - 1);
    updateHover(event.clientX, event.clientY);

    // Touch: i-drag pataas/pababa para mag-scroll sa tunnel
    if (event.pointerType === "touch" && lastTouchY !== null) {
      state.velocity += (lastTouchY - event.clientY) * SCROLL_SPEED * 4;
      lastTouchY = event.clientY;
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    updateHover(event.clientX, event.clientY);
    if (event.pointerType === "touch") lastTouchY = event.clientY;
  };

  const handlePointerUp = () => {
    lastTouchY = null;
  };

  const resetPointer = () => {
    state.mouse.targetX = 0;
    state.mouse.targetY = 0;
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    state.velocity += event.deltaY * SCROLL_SPEED;
  };

  const handleClick = () => {
    if (buttonHovered) options.onButtonClick();
  };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerdown", handlePointerDown, { passive: true });
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);
  window.addEventListener("blur", resetPointer);
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("resize", handleResize);
  document.documentElement.addEventListener("pointerleave", resetPointer);
  canvas.addEventListener("click", handleClick);

  let frame = 0;
  const tick = () => {
    state.velocity *= 0.92;
    state.speedMultiplier += (state.targetSpeedMultiplier - state.speedMultiplier) * 0.1;
    state.scrollOffset += (state.velocity * 0.02 + AUTO_FORWARD_SPEED) * state.speedMultiplier;

    const mouse = state.mouse;
    mouse.x = lerp(mouse.x, mouse.targetX, MOUSE_SMOOTHING);
    mouse.y = lerp(mouse.y, mouse.targetY, MOUSE_SMOOTHING);

    const lookX = Math.sign(mouse.x) * Math.pow(Math.abs(mouse.x), 1.5);
    const targetRotY = -lookX * (Math.PI * 0.4);
    const targetPosX = -lookX * (WALL_DISTANCE * 0.55);
    const targetPosZ = CAMERA_Z + Math.abs(lookX) * 1.5;

    camera.position.lerp(tmpVector.set(targetPosX, 0, targetPosZ), 0.08);
    tmpQuaternion.setFromEuler(tmpEuler.set(0, targetRotY, 0));
    camera.quaternion.slerp(tmpQuaternion, 0.08);

    state.targetSpeedMultiplier = 1 - Math.pow(Math.abs(mouse.x), 1.5) * 0.98;

    const camZ = camera.position.z;
    for (const card of cards) {
      const data = card.data;
      const currentZOffset =
        (((data.zOffset + state.scrollOffset) % TUNNEL_LOOP_DEPTH) + TUNNEL_LOOP_DEPTH) %
        TUNNEL_LOOP_DEPTH;
      const z = FAR_Z + currentZOffset;

      const fadeNear = clamp01(1 - (z - camZ) / 3);
      const fadeFar = clamp01((z - FAR_Z) / 15);
      const fadeCenterVoid = clamp01((z - CENTER_VOID_START_Z) / CENTER_VOID_FADE_DEPTH);
      const opacity = Math.min(fadeNear, fadeFar, fadeCenterVoid);
      const visible = z < camZ + 3 && z > FAR_Z && opacity > 0.01;

      card.mesh.visible = visible;

      if (visible) {
        card.mesh.position.set(
          data.side === "left" ? -WALL_DISTANCE : WALL_DISTANCE,
          data.yOffset,
          z
        );
        card.mesh.rotation.set(0, data.side === "left" ? Math.PI / 2 : -Math.PI / 2, 0);
        card.mesh.scale.set(data.scaleX, data.scaleY, 1);

        const depthGloss = clamp01(1 - Math.abs(z - SCENE_TEXT_Z) / 34);
        const uniforms = card.uniforms;
        uniforms.uOpacity.value = opacity;
        uniforms.uGlossEnergy.value = PAPER_GLOSS_IDLE + depthGloss * 0.08;
        uniforms.uNarrowGloss.value = PAPER_GLOSS_NARROW + depthGloss * 0.05;
        uniforms.uGlossShift.value = wrap01(z * 0.015 + card.index * 0.17);
      }
    }

    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  // ---- Cleanup ----
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    window.removeEventListener("blur", resetPointer);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("resize", handleResize);
    document.documentElement.removeEventListener("pointerleave", resetPointer);
    canvas.removeEventListener("click", handleClick);
    canvas.style.cursor = "";

    cards.forEach((card) => card.material.dispose());
    loadedTextures.forEach((texture) => texture.dispose());
    placeholderTexture.dispose();
    cardGeometry.dispose();
    buttonGeometry.dispose();
    buttonMaterial.dispose();
    textMeshes.forEach((mesh) => mesh.dispose());
    renderer.dispose();
  };
}
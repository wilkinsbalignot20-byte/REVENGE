 import * as THREE from "three";

export type SceneOptions = {
  /** Buong URL ng mga larawan (Cloudinary o /public). Kapag walang laman, gray placeholder. */
  images?: string[];
  /** Tinatawagan bawat frame: 0 (simula) hanggang 1 (dulo ng scroll) */
  onProgress?: (progress: number) => void;
};

// Sukat ng bawat box (portrait). Flat plane ito kaya tuwid ang bawat box, walang wave o tabingi.
const PLANE_W = 1.3;
const PLANE_H = 1.8;
const PLANE_ASPECT = PLANE_W / PLANE_H;

// Gaano kalayo ang kayang i-scroll (world units). Dito nagtatapos ang gallery.
const MAX_SCROLL = 13;

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const layoutPositions = [
  { x: -2.6, y: 1.4, z: 0.0 },
  { x: 1.2, y: 0.2, z: 0.3 },
  { x: 3.1, y: -1.4, z: -0.2 },
  { x: -3.2, y: -2.6, z: 0.2 },
  { x: 0.2, y: -3.8, z: 0.4 },
  { x: -1.8, y: -6.2, z: -0.1 },
  { x: 2.6, y: -7.0, z: 0.2 },
  { x: -3.0, y: -8.8, z: 0.3 },
  { x: 0.8, y: -10.2, z: -0.2 },
  { x: 3.0, y: -11.6, z: 0.1 },
  { x: -1.6, y: -12.8, z: 0.3 },
  { x: 1.6, y: -14.2, z: 0.0 },
];

export function createProjectsScene(
  canvas: HTMLCanvasElement,
  options: SceneOptions = {}
) {
  const { images = [], onProgress } = options;
  let disposed = false;

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0xffffff, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // --- Scene at camera ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 6;

  // Ang group ang gumagalaw pataas kapag nag-scroll (parang normal na page scroll)
  const group = new THREE.Group();
  scene.add(group);

  // --- Mga box ---
  const geometry = new THREE.PlaneGeometry(PLANE_W, PLANE_H);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin("anonymous");
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  const placeholderCanvas = document.createElement("canvas");
  placeholderCanvas.width = 2;
  placeholderCanvas.height = 2;
  const placeholderCtx = placeholderCanvas.getContext("2d");
  if (placeholderCtx) {
    placeholderCtx.fillStyle = "#e5e5e5";
    placeholderCtx.fillRect(0, 0, 2, 2);
  }
  const placeholder = new THREE.CanvasTexture(placeholderCanvas);

  const loadedTextures: THREE.Texture[] = [];

  // I-crop ang larawan na parang "object-fit: cover" para hindi ma-stretch
  const applyCover = (tex: THREE.Texture) => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    if (!img?.width || !img?.height) return;
    const imgAspect = img.width / img.height;
    if (imgAspect > PLANE_ASPECT) {
      tex.repeat.set(PLANE_ASPECT / imgAspect, 1);
      tex.offset.set((1 - tex.repeat.x) / 2, 0);
    } else {
      tex.repeat.set(1, imgAspect / PLANE_ASPECT);
      tex.offset.set(0, (1 - tex.repeat.y) / 2);
    }
  };

  const items = layoutPositions.map((pos, i) => {
    const material = new THREE.MeshBasicMaterial({
      map: placeholder,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const url = images.length ? images[i % images.length] : "";
    if (url) {
      textureLoader.load(
        url,
        (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = maxAnisotropy;
          applyCover(tex);
          loadedTextures.push(tex);
          material.map = tex;
          material.needsUpdate = true;
        },
        undefined,
        () => console.warn("Hindi na-load ang image:", url)
      );
    }

    return { mesh, material, baseX: pos.x, baseY: pos.y, baseZ: pos.z };
  });

  // Sa maliit na screen (phone), paliitin ang layout para kasya
  const applyLayout = () => {
    const aspect = window.innerWidth / window.innerHeight;
    const xFactor = clamp(aspect / 1.6, 0.4, 1);
    const size = clamp(aspect / 1.2, 0.65, 1);
    items.forEach((item, i) => {
      item.baseX = layoutPositions[i].x * xFactor;
      item.mesh.scale.setScalar(size);
    });
  };
  applyLayout();

  // --- Scroll controls ---
  let current = 0;
  let target = 0;
  let lastTouchY: number | null = null;
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const setTarget = (value: number) => {
    target = clamp(value, 0, MAX_SCROLL);
  };

  const handleWheel = (event: WheelEvent) => {
    setTarget(target + event.deltaY * 0.008);
  };

  const handlePointerMove = (event: PointerEvent) => {
    mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    if (event.pointerType === "touch" && lastTouchY !== null) {
      setTarget(target + (lastTouchY - event.clientY) * 0.012);
      lastTouchY = event.clientY;
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") lastTouchY = event.clientY;
  };

  const handlePointerUp = () => {
    lastTouchY = null;
  };

  const handleKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      setTarget(target + 1.5);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      setTarget(target - 1.5);
    }
  };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    applyLayout();
  };

  window.addEventListener("wheel", handleWheel, { passive: true });
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerdown", handlePointerDown, { passive: true });
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);
  window.addEventListener("keydown", handleKey);
  window.addEventListener("resize", handleResize);

  // --- Animation loop ---
  let frameId = 0;
  const start = performance.now();

  const tick = () => {
    if (disposed) return;
    const time = (performance.now() - start) / 1000;

    current += (target - current) * 0.08;
    group.position.y = current;

    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;
    // Paggalaw lang ng camera (walang ikot), kaya tuwid pa rin ang mga box
    camera.position.x = mouse.x * 0.15;
    camera.position.y = mouse.y * 0.1;

    items.forEach((item, i) => {
      // Banayad na pag-float pataas-pababa, kinukuwenta mula sa orihinal na pwesto (hindi naiipon)
      item.mesh.position.set(
        item.baseX,
        item.baseY + Math.sin(time * 0.8 + i) * 0.03,
        item.baseZ
      );
    });

    onProgress?.(clamp(current / MAX_SCROLL));
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);

  // --- Cleanup ---
  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    window.removeEventListener("keydown", handleKey);
    window.removeEventListener("resize", handleResize);

    geometry.dispose();
    placeholder.dispose();
    loadedTextures.forEach((tex) => tex.dispose());
    items.forEach((item) => item.material.dispose());
    renderer.dispose();
  };
}
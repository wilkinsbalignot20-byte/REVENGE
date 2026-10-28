import * as THREE from 'three'
import {
  CARD_SPACING,
  CENTER_VOID_FADE_DEPTH,
  CENTER_VOID_START_Z,
  DEFAULT_IMAGE_ASPECT,
  FAR_Z,
  PAPER_GLOSS_IDLE,
  PAPER_GLOSS_NARROW,
  SCENE_TEXT_Z,
  TOTAL_CARDS,
  TUNNEL_LOOP_DEPTH,
  WALL_DISTANCE,
} from './constants'
import { IMAGES } from './images'
import { clamp01, createSeededRandom, getShuffledImages, lerp, wrap01 } from './math'
import { fragmentShader, vertexShader } from './shaders'

export type CardData = {
  path: string
  side: 'left' | 'right'
  zOffset: number
  yOffset: number
  scaleX: number
  scaleY: number
}

type CardUniforms = {
  uTexture: { value: THREE.Texture }
  uOpacity: { value: number }
  uGlossEnergy: { value: number }
  uNarrowGloss: { value: number }
  uGlossShift: { value: number }
}

export type TunnelCard = {
  data: CardData
  index: number
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  material: THREE.ShaderMaterial
  uniforms: CardUniforms
}

const TUNNEL_CARD_IMAGES = getShuffledImages(IMAGES, 1404).slice(0, TOTAL_CARDS)

export const createCardsData = (): CardData[] => {
  const random = createSeededRandom(404)
  const cards: CardData[] = []

  for (let index = 0; index < TOTAL_CARDS; index += 1) {
    const side = index % 2 === 0 ? 'left' : 'right'
    const pairIndex = Math.floor(index / 2)
    const zOffset = pairIndex * CARD_SPACING + (random() - 0.5) * CARD_SPACING * 0.4
    const cardHeight = lerp(2.2, 4.0, random())
    const yOffset = (random() - 0.5) * 1.5

    cards.push({
      path: TUNNEL_CARD_IMAGES[index % TUNNEL_CARD_IMAGES.length],
      side,
      zOffset,
      yOffset,
      scaleX: cardHeight * DEFAULT_IMAGE_ASPECT,
      scaleY: cardHeight,
    })
  }

  return cards
}

const makePlaceholderTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#dcdcdc'
    ctx.fillRect(0, 0, 2, 2)
  }
  return new THREE.CanvasTexture(canvas)
}

/** Gumagawa ng lahat ng card meshes at nilo-load ang mga texture nila. */
export const createCards = (scene: THREE.Scene, renderer: THREE.WebGLRenderer) => {
  const placeholderTexture = makePlaceholderTexture()
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
  const textureLoader = new THREE.TextureLoader()
  const cardGeometry = new THREE.PlaneGeometry(1, 1)
  let disposed = false

  const cards: TunnelCard[] = createCardsData().map((data, index) => {
    const uniforms: CardUniforms = {
      uTexture: { value: placeholderTexture },
      uOpacity: { value: 1 },
      uGlossEnergy: { value: PAPER_GLOSS_IDLE },
      uNarrowGloss: { value: PAPER_GLOSS_NARROW },
      uGlossShift: { value: 0.5 },
    }
    const material = new THREE.ShaderMaterial({
      transparent: true,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
      uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
      vertexShader,
      fragmentShader,
    })
    const mesh = new THREE.Mesh(cardGeometry, material)
    mesh.visible = false
    scene.add(mesh)

    textureLoader.load(data.path, (texture) => {
      if (disposed) {
        texture.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = maxAnisotropy
      uniforms.uTexture.value = texture
    })

    return { data, index, mesh, material, uniforms }
  })

  const dispose = () => {
    disposed = true
    for (const card of cards) {
      const texture = card.uniforms.uTexture.value
      if (texture !== placeholderTexture) texture.dispose()
      card.material.dispose()
      scene.remove(card.mesh)
    }
    cardGeometry.dispose()
    placeholderTexture.dispose()
  }

  return { cards, dispose }
}

/** Per-frame update ng posisyon, opacity at gloss ng bawat card. */
export const updateCards = (cards: TunnelCard[], scrollOffset: number, camZ: number) => {
  for (const card of cards) {
    const { data } = card
    const currentZOffset =
      (((data.zOffset + scrollOffset) % TUNNEL_LOOP_DEPTH) + TUNNEL_LOOP_DEPTH) % TUNNEL_LOOP_DEPTH
    const z = FAR_Z + currentZOffset

    const fadeNear = clamp01(1 - (z - camZ) / 3)
    const fadeFar = clamp01((z - FAR_Z) / 15)
    const fadeCenterVoid = clamp01((z - CENTER_VOID_START_Z) / CENTER_VOID_FADE_DEPTH)
    const opacity = Math.min(fadeNear, fadeFar, fadeCenterVoid)
    const visible = z < camZ + 3 && z > FAR_Z && opacity > 0.01

    card.mesh.visible = visible
    if (!visible) continue

    card.mesh.position.set(data.side === 'left' ? -WALL_DISTANCE : WALL_DISTANCE, data.yOffset, z)
    card.mesh.rotation.set(0, data.side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0)
    card.mesh.scale.set(data.scaleX, data.scaleY, 1)

    const depthGloss = clamp01(1 - Math.abs(z - SCENE_TEXT_Z) / 34)
    const { uniforms } = card
    uniforms.uOpacity.value = opacity
    uniforms.uGlossEnergy.value = PAPER_GLOSS_IDLE + depthGloss * 0.08
    uniforms.uNarrowGloss.value = PAPER_GLOSS_NARROW + depthGloss * 0.05
    uniforms.uGlossShift.value = wrap01(z * 0.015 + card.index * 0.17)
  }
}

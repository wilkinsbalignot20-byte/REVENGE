 import * as THREE from 'three'
import {
  AUTO_FORWARD_SPEED,
  BACKGROUND_COLOR,
  CAMERA_FOV,
  CAMERA_Z,
  MOUSE_SMOOTHING,
  SCROLL_SPEED,
  WALL_DISTANCE,
  HOME_URL, // Isinama natin ang HOME_URL galing sa constants
} from './constants'
import { createCards, updateCards } from './cards'
import { lerp } from './math'
import { createOverlay } from './overlay'

/**
 * WebGL Tunnel Scene setup.
 * Ang "GO HOME" button ay direktang nakaturo na ngayon sa iyong itinakdang HOME_URL!
 */
export const createTunnelScene = (canvas: HTMLCanvasElement, onHomeClick: () => void) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  
  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(BACKGROUND_COLOR, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.set(0, 0, CAMERA_Z)

  const { cards, dispose: disposeCards } = createCards(scene, renderer)
  const { button, dispose: disposeOverlay } = createOverlay(scene)

  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  let buttonHovered = false

  const state = {
    scrollOffset: 0,
    velocity: 0,
    speedMultiplier: 1,
    targetSpeedMultiplier: 1,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
  }

  const tmpVector = new THREE.Vector3()
  const tmpQuaternion = new THREE.Quaternion()
  const tmpEuler = new THREE.Euler()

  const handlePointerMove = (event: PointerEvent) => {
    state.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1
    state.mouse.targetY = -((event.clientY / window.innerHeight) * 2 - 1)

    pointerNdc.set(state.mouse.targetX, state.mouse.targetY)
    raycaster.setFromCamera(pointerNdc, camera)
    const hit = raycaster.intersectObject(button, false).length > 0
    if (hit !== buttonHovered) {
      buttonHovered = hit
      canvas.style.cursor = hit ? 'pointer' : ''
    }
  }

  const resetPointer = () => {
    state.mouse.targetX = 0
    state.mouse.targetY = 0
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    state.velocity += event.deltaY * SCROLL_SPEED
  }

  const handleClick = () => {
    // Kung ang link ay panlabas (external URL), gagamit ng window.location.href.
    // Kung ito naman ay lokal, gagamitin ang Next.js handler para sa mabilis na transition.
    if (buttonHovered) {
      if (HOME_URL.startsWith('http://') || HOME_URL.startsWith('https://')) {
        window.location.href = HOME_URL
      } else if (onHomeClick) {
        onHomeClick()
      }
    }
  }

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', resetPointer)
  window.addEventListener('blur', resetPointer)
  canvas.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('resize', handleResize)
  canvas.addEventListener('click', handleClick)

  let frameId = 0

  const tick = () => {
    state.velocity *= 0.92
    state.speedMultiplier += (state.targetSpeedMultiplier - state.speedMultiplier) * 0.1
    state.scrollOffset += (state.velocity * 0.02 + AUTO_FORWARD_SPEED) * state.speedMultiplier

    const { mouse } = state
    mouse.x = lerp(mouse.x, mouse.targetX, MOUSE_SMOOTHING)
    mouse.y = lerp(mouse.y, mouse.targetY, MOUSE_SMOOTHING)

    const lookX = Math.sign(mouse.x) * Math.pow(Math.abs(mouse.x), 1.5)
    const targetRotY = -lookX * (Math.PI * 0.4)
    const targetPosX = -lookX * (WALL_DISTANCE * 0.55)
    const targetPosZ = CAMERA_Z + Math.abs(lookX) * 1.5

    camera.position.lerp(tmpVector.set(targetPosX, 0, targetPosZ), 0.08)
    tmpQuaternion.setFromEuler(tmpEuler.set(0, targetRotY, 0))
    camera.quaternion.slerp(tmpQuaternion, 0.08)

    state.targetSpeedMultiplier = 1 - Math.pow(Math.abs(mouse.x), 1.5) * 0.98

    updateCards(cards, state.scrollOffset, camera.position.z)

    renderer.render(scene, camera)
    frameId = requestAnimationFrame(tick)
  }

  frameId = requestAnimationFrame(tick)

  return function dispose() {
    cancelAnimationFrame(frameId)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerleave', resetPointer)
    window.removeEventListener('blur', resetPointer)
    canvas.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
    canvas.removeEventListener('click', handleClick)
    canvas.style.cursor = ''

    disposeCards()
    disposeOverlay()
    renderer.dispose()
  }
}

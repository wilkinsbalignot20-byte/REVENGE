import * as THREE from 'three'
import { Text } from 'troika-three-text'
import { SCENE_TEXT_Z } from './constants'

type Vec3 = [number, number, number]

const addText = (
  parent: THREE.Object3D,
  text: string,
  properties: Record<string, unknown>,
  position: Vec3,
  renderOrder: number,
) => {
  const mesh = new Text()
  Object.assign(mesh, {
    text,
    anchorX: 'center',
    anchorY: 'middle',
    sdfGlyphSize: 64,
    ...properties,
  })
  mesh.position.set(...position)
  mesh.renderOrder = renderOrder
  parent.add(mesh)
  mesh.sync()
  return mesh
}

/** Rounded "pill" na hugis ng GO HOME button. */
const createButtonGeometry = () => {
  const radius = 0.625
  const epsilon = 0.00001
  const shape = new THREE.Shape()
  shape.absarc(epsilon, epsilon, epsilon, -Math.PI / 2, -Math.PI, true)
  shape.absarc(epsilon, 1.25 - (radius - epsilon) * 2, epsilon, Math.PI, Math.PI / 2, true)
  shape.absarc(4.1 - (radius - epsilon) * 2, 1.25 - (radius - epsilon) * 2, epsilon, Math.PI / 2, 0, true)
  shape.absarc(4.1 - (radius - epsilon) * 2, epsilon, epsilon, 0, -Math.PI / 2, true)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12 - radius * 2,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize: radius - epsilon,
    bevelThickness: radius,
    curveSegments: 24,
  })
  geometry.center()
  return geometry
}

/** "404" + mensahe + GO HOME button sa gitna ng tunnel. */
export const createOverlay = (scene: THREE.Scene) => {
  const overlay = new THREE.Group()
  overlay.position.set(0, 0.1, SCENE_TEXT_Z)
  scene.add(overlay)

  const texts = [
    addText(
      overlay,
      '404',
      { color: '#070912', fontSize: 2.52, fontWeight: 500, letterSpacing: -0.02 },
      [0, 2.05, 0],
      20,
    ),
    addText(
      overlay,
      'This page no longer exists\nor has been moved',
      {
        color: '#070912',
        fillOpacity: 0.6,
        fontSize: 0.48,
        lineHeight: 1.25,
        maxWidth: 7.2,
        textAlign: 'center',
      },
      [0, 0.1, 0],
      20,
    ),
  ]

  const buttonGroup = new THREE.Group()
  buttonGroup.position.set(0, -1.8, 0)
  overlay.add(buttonGroup)

  const buttonGeometry = createButtonGeometry()
  const buttonMaterial = new THREE.MeshBasicMaterial({ color: '#16161f', toneMapped: false })
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
  buttonGroup.add(button)

  texts.push(
    addText(
      buttonGroup,
      'GO HOME',
      { color: '#ffffff', fontSize: 0.38, fontWeight: 700, letterSpacing: 0.12 },
      [0, 0, 0.08],
      21,
    ),
  )

  const dispose = () => {
    texts.forEach((text) => text.dispose())
    buttonGeometry.dispose()
    buttonMaterial.dispose()
    scene.remove(overlay)
  }

  return { button, dispose }
}

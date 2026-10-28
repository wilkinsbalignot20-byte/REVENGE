// Walang opisyal na TypeScript types ang `troika-three-text`,
// kaya ito ang minimal na declaration para sa mga property na ginagamit natin.
declare module 'troika-three-text' {
  import type { Color, Mesh } from 'three'

  export class Text extends Mesh {
    text: string
    anchorX: number | string
    anchorY: number | string
    color: Color | string | number | null
    fillOpacity: number
    fontSize: number
    fontWeight: number | string
    font: string | null
    letterSpacing: number
    lineHeight: number | string
    maxWidth: number
    textAlign: 'left' | 'right' | 'center' | 'justify'
    sdfGlyphSize: number
    sync(callback?: () => void): void
    dispose(): void
  }
}

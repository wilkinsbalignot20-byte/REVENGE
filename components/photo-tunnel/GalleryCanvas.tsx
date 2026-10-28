 'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './PhotoTunnel.module.css'

/**
 * Client-only. Dynamic import ang three.js scene para hindi ito
 * ma-load (o ma-render) sa server.
 * Inayos na rin ang Router integration para sa swabeng pag-click sa "Go Home".
 */
export function GalleryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter() // Gagamitin natin para sa mabilis na paglipat ng page nang walang reload

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let dispose: (() => void) | undefined

    import('@/lib/photo-tunnel/createTunnelScene')
      .then(({ createTunnelScene }) => {
        if (cancelled) return
        
        // Ipinasa natin ang `() => router.push('/')` bilang pangalawang argument para mawala ang error
        dispose = createTunnelScene(canvas, () => router.push('/'))
      })
      .catch((error) => console.error('Gallery failed to load:', error))

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [router]) // Isinama ang router sa dependency array para sa tamang Next.js structure

  return (
    <canvas
      ref={canvasRef}
      className={styles.gallery}
      role="img"
      aria-label="404. This page no longer exists or has been moved."
    />
  )
}

 import type { Metadata } from 'next'
import { PhotoTunnel404 } from '@/components/photo-tunnel/PhotoTunnel404'

export const metadata: Metadata = {
  title: 'Manipu — 404 Photo Tunnel',
}

export default function Page() {
  return <PhotoTunnel404 />
}

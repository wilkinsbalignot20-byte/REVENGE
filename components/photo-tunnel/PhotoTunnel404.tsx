import { GalleryCanvas } from './GalleryCanvas'
import { HomeLink } from './HomeLink'
import styles from './PhotoTunnel.module.css'
import { TunnelHeader } from './TunnelHeader'

export function PhotoTunnel404() {
  return (
    <main className={styles.page} aria-label="Page not found">
      <GalleryCanvas />
      <TunnelHeader />
      <HomeLink />
    </main>
  )
}

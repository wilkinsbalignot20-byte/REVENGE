import { SITE_LINKS } from '@/lib/photo-tunnel/constants'
import styles from './PhotoTunnel.module.css'

/** Hidden hanggang ma-focus gamit ang keyboard — accessible na alternatibo sa 3D GO HOME button. */
export function HomeLink() {
  return (
    <a className={styles.homeLink} href={SITE_LINKS.home}>
      Go home
    </a>
  )
}

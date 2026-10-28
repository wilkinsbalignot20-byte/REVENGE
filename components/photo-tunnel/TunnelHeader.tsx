 import { SITE_LINKS } from '@/lib/photo-tunnel/constants'
import styles from './PhotoTunnel.module.css'
import { ScrambleLink } from './ScrambleLink'

export function TunnelHeader() {
  return (
    <header className={styles.workMenu}>
      <nav aria-label="Main navigation">
        {/* Pinalitan ang kredito para sa iyong bagong brand name */}
        <ScrambleLink label="Made by Manipu" href={SITE_LINKS.madeBy} />
        
        {/* Ang iyong custom MANIPU/ logo gamit ang HTML/CSS styling */}
        <a className={styles.brandLink} href={SITE_LINKS.home} aria-label="Manipu Home">
          <span style={{ 
            fontFamily: 'sans-serif', 
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '16px'
          }}>
            {/* Itim o Bold na parte ng logo */}
            <strong style={{ color: '#000000', fontWeight: 900 }}>MANI</strong>
            
            {/* Puti o Manipis na parte ng logo kabilang ang slash */}
            <span style={{ color: '#ffffff', fontWeight: 300 }}>IPU/</span>
          </span>
        </a>
        
        <ScrambleLink label="Project details" href={SITE_LINKS.project} />
      </nav>
    </header>
  )
}

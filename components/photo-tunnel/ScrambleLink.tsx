'use client'

import type { CSSProperties } from 'react'
import styles from './PhotoTunnel.module.css'
import { useLetterScramble } from './useLetterScramble'

type ScrambleLinkProps = {
  label: string
  href: string
}

export function ScrambleLink({ label, href }: ScrambleLinkProps) {
  const { letters, swaps, start, restore } = useLetterScramble(label)

  return (
    <a
      className={styles.navLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={start}
      onMouseLeave={restore}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          className={styles.navLetter}
          style={{ '--letter-index': index } as CSSProperties}
          aria-hidden="true"
        >
          <span style={{ visibility: swaps[index] ? 'hidden' : undefined }}>
            {letter === ' ' ? '\u00a0' : letter}
          </span>
          <span className={styles.navLetterScramble}>{swaps[index]}</span>
        </span>
      ))}
    </a>
  )
}

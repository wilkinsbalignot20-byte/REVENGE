import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const CYCLES = 3
const CYCLE_MS = 40
const STAGGER_MS = 30

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '+-.@_/'

const getPool = (letter: string) => {
  if (/[a-z]/i.test(letter)) return letter === letter.toUpperCase() ? UPPER : LOWER
  return /\d/.test(letter) ? DIGITS : SYMBOLS
}

/**
 * Hover "scramble" effect: bawat letra ay mabilis na nagpapalit-palit
 * ng random na character bago bumalik sa original.
 */
export function useLetterScramble(label: string) {
  const letters = useMemo(() => [...label], [label])
  const [swaps, setSwaps] = useState<Record<number, string>>({})
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const restore = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer))
    timers.current.clear()
    setSwaps({})
  }, [])

  const start = useCallback(() => {
    restore()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    letters.forEach((letter, index) => {
      if (letter === ' ') return
      const pool = getPool(letter)
      let cycles = 0

      const runCycle = () => {
        cycles += 1
        if (cycles === CYCLES) {
          timers.current.delete(index)
          setSwaps((prev) => {
            const { [index]: _removed, ...rest } = prev
            return rest
          })
          return
        }

        let next: string
        do {
          next = pool[Math.floor(Math.random() * pool.length)]
        } while (next === letter)

        setSwaps((prev) => ({ ...prev, [index]: next }))
        timers.current.set(index, setTimeout(runCycle, CYCLE_MS))
      }

      timers.current.set(index, setTimeout(runCycle, index * STAGGER_MS))
    })
  }, [letters, restore])

  useEffect(() => {
    const activeTimers = timers.current
    window.addEventListener('blur', restore)
    return () => {
      window.removeEventListener('blur', restore)
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [restore])

  return { letters, swaps, start, restore }
}

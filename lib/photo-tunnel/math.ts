export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
export const wrap01 = (value: number) => ((value % 1) + 1) % 1

/** Deterministic random — pareho palagi ang lalabas sa bawat load. */
export const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const getShuffledImages = (images: string[], seed: number) => {
  const random = createSeededRandom(seed)
  const shuffled = [...images]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[nextIndex]
    shuffled[nextIndex] = current
  }
  return shuffled
}

 // Lahat ng tunable na numero at link ng 404 photo tunnel — isang lugar lang.
// Inayos para sa brand na MANIPU/ at handa para sa iyong sariling portfolio link.

export const SITE_LINKS = {
  home: '/',                    // Itinuro sa root ng iyong kasalukuyang Next.js project
  madeBy: 'https://github.com', // Pwede mong palitan ng link ng iyong sariling GitHub o LinkedIn account
  project: '#',                 // Placeholder para sa mga detalye ng project mo
  logo: '',                     // Bakante na ito dahil gumagamit ka na ng purong HTML/CSS text logo!
} as const

export const HOME_URL = SITE_LINKS.home

// Camera Settings
export const CAMERA_Z = 8
export const CAMERA_FOV = 55
export const BACKGROUND_COLOR = 0xf2f2f2

// Tunnel depth configuration
export const FAR_Z = -100
export const NEAR_Z = 12
export const TOTAL_DEPTH = NEAR_Z - FAR_Z
export const WALL_DISTANCE = 4.5
export const CENTER_VOID_START_Z = -24
export const CENTER_VOID_FADE_DEPTH = 10
export const SCENE_TEXT_Z = -30

// Motion & Smoothing variables
export const SCROLL_SPEED = 0.4
export const AUTO_FORWARD_SPEED = 0.02
export const MOUSE_SMOOTHING = 0.08

// Glossy paper shader settings
export const PAPER_GLOSS_IDLE = 0.18
export const PAPER_GLOSS_NARROW = 0.08

// Cards arrangement parameters
export const DEFAULT_IMAGE_ASPECT = 0.75
export const BASE_VISIBLE_CARDS = 40
export const TOTAL_CARDS = 84
export const CARD_SPACING = TOTAL_DEPTH / (BASE_VISIBLE_CARDS / 2)
export const TUNNEL_LOOP_DEPTH = CARD_SPACING * (TOTAL_CARDS / 2)

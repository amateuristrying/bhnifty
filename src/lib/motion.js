import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Settle, don't bounce — ease-out, no overshoot on structural content */
export const SETTLE = 'power3.out'

/* Reveal on scroll: trigger when ~15% of the section is visible, once */
export const REVEAL_START = 'top 85%'

/*
 * All motion is opt-in via this media condition. `?nomotion` forces the
 * reduced-motion path (handy for testing and screenshots) — reveals become
 * instant, tickers stop, line-draws are skipped. Nothing essential depends
 * on animation.
 */
const noMotionParam =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('nomotion')

export const MOTION_QUERY = noMotionParam
  ? '(prefers-reduced-motion: reduce) and (prefers-reduced-motion: no-preference)' // never matches
  : '(prefers-reduced-motion: no-preference)'

export function motionOK() {
  return !noMotionParam && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* Dev hook: lets tooling drive the ticker when rAF is unavailable */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__gsap = gsap
  window.__ScrollTrigger = ScrollTrigger
}

export { gsap, ScrollTrigger }

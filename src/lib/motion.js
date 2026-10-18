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

/* Kinetic line & heading reveal on scroll with perspective */
export function revealHeadline(elements, options = {}) {
  if (!motionOK()) return
  const elArray = Array.isArray(elements) ? elements : [elements]
  if (!elArray.length || !elArray[0]) return
  return gsap.from(elArray, {
    y: options.y ?? 38,
    opacity: options.opacity ?? 0,
    rotateX: options.rotateX ?? 10,
    transformOrigin: 'top center',
    duration: options.duration ?? 0.8,
    ease: options.ease ?? SETTLE,
    stagger: options.stagger ?? 0.08,
    scrollTrigger: options.scrollTrigger ?? {
      trigger: elArray[0],
      start: options.start ?? REVEAL_START,
      once: true,
    },
    ...options.extra,
  })
}

/* Soft blur-and-rise for paragraphs and body descriptions */
export function revealParagraph(elements, options = {}) {
  if (!motionOK()) return
  const elArray = Array.isArray(elements) ? elements : [elements]
  if (!elArray.length || !elArray[0]) return
  return gsap.from(elArray, {
    y: options.y ?? 22,
    opacity: options.opacity ?? 0,
    filter: 'blur(6px)',
    duration: options.duration ?? 0.75,
    ease: options.ease ?? SETTLE,
    stagger: options.stagger ?? 0.06,
    scrollTrigger: options.scrollTrigger ?? {
      trigger: elArray[0],
      start: options.start ?? 'top 88%',
      once: true,
    },
    ...options.extra,
  })
}

/* Scroll-scrubbed text reveal: words gradually illuminate as you scroll past */
export function scrubWords(container, wordSelector = '[data-scrub-word]') {
  if (!motionOK() || !container) return
  const words = container.querySelectorAll(wordSelector)
  if (!words.length) return
  return gsap.fromTo(
    words,
    { opacity: 0.18, y: 4 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.06,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.8,
      },
    }
  )
}

export { gsap, ScrollTrigger }


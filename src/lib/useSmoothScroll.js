import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, motionOK } from './motion'

const NAV_OFFSET = -80 // sticky header height
const SETTLE_EASE = (t) => 1 - Math.pow(2, -10 * t) // same family as the settle bezier

/*
 * Inertial smooth scrolling wired into GSAP, so every ScrollTrigger reveal,
 * scrub and parallax renders on the eased scroll position. Optionally
 * "directed": when the glide comes to rest near a screen's top edge, it
 * settles onto it. Disabled entirely under reduced motion / ?nomotion —
 * native scrolling takes over and reveals are instant.
 */
export default function useSmoothScroll({ snapSelector } = {}) {
  useEffect(() => {
    if (!motionOK()) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: SETTLE_EASE,
      smoothWheel: true,
    })
    if (import.meta.env.DEV) window.__lenis = lenis

    /* animations render as the site is scrolled — on the smoothed position */
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    /* directed settle: glide onto the nearest screen edge once motion rests */
    let snapTimer = null
    let snapping = false
    function trySnap() {
      if (snapping || !snapSelector) return
      const y = window.scrollY
      const vh = window.innerHeight
      const max = ScrollTrigger.maxScroll(window)
      if (y < 2 || y > max - 2) return
      let best = null
      document.querySelectorAll(snapSelector).forEach((el) => {
        const target = Math.min(max, Math.max(0, el.getBoundingClientRect().top + y + NAV_OFFSET))
        const d = target - y
        if (Math.abs(d) > 2 && Math.abs(d) < vh * 0.28 && (!best || Math.abs(d) < Math.abs(best.d))) {
          best = { target, d }
        }
      })
      if (best) {
        snapping = true
        lenis.scrollTo(best.target, { duration: 0.85, easing: SETTLE_EASE })
        setTimeout(() => { snapping = false }, 950)
      }
    }
    function onScroll(e) {
      if (!snapSelector || snapping) return
      clearTimeout(snapTimer)
      if (Math.abs(e.velocity) < 0.2) snapTimer = setTimeout(trySnap, 130)
    }
    lenis.on('scroll', onScroll)

    /* same-page anchors glide instead of jumping */
    function onClick(e) {
      const a = e.target.closest('a[href]')
      if (!a) return
      const href = a.getAttribute('href')
      let hash = null
      if (href.startsWith('#') && href.length > 1) hash = href
      else if (href.startsWith('/#') && window.location.pathname === '/') hash = href.slice(1)
      if (!hash) return
      const el = document.querySelector(hash)
      if (!el) return
      e.preventDefault()
      window.history.pushState(null, '', hash)
      lenis.scrollTo(el, { offset: hash === '#hero' ? 0 : NAV_OFFSET, duration: 1.1, easing: SETTLE_EASE })
    }
    document.addEventListener('click', onClick)

    /* honor a hash present on load */
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) lenis.scrollTo(el, { offset: NAV_OFFSET, immediate: true })
    }

    return () => {
      document.removeEventListener('click', onClick)
      clearTimeout(snapTimer)
      gsap.ticker.remove(tick)
      lenis.destroy()
      if (import.meta.env.DEV && window.__lenis === lenis) delete window.__lenis
    }
  }, [snapSelector])
}

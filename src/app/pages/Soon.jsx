import { useEffect, useRef } from 'react'
import { gsap, SETTLE, MOTION_QUERY } from '../../lib/motion'
import Icon from '../../components/Icon'

/*
 * Reserved surface for the sections that arrive after the live feed. Keeps the
 * rail honest — every item navigates somewhere and says what it will hold.
 */
export default function Soon({ title, icon, blurb }) {
  const root = useRef(null)

  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(root.current.querySelectorAll('[data-rise]'), {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: SETTLE,
        stagger: 0.08,
      })
    })
    return () => mm.revert()
  }, [title])

  return (
    <div ref={root} className="px-5 md:px-8 py-14 md:py-20">
      <div className="max-w-xl mx-auto text-center">
        <span
          data-rise
          className="inline-flex items-center justify-center w-14 h-14 rounded-xl border border-rule bg-panel text-ink"
        >
          <Icon name={icon} className="w-6 h-6" />
        </span>
        <h1 data-rise className="mt-6 font-serif font-semibold text-3xl md:text-4xl tracking-tight">
          {title}
        </h1>
        <p data-rise className="mt-4 text-ink-soft leading-[1.65]">
          {blurb}
        </p>
        <p
          data-rise
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-rule bg-panel px-4 py-2 uppercase tracking-[0.24em] text-[10.5px] font-bold text-ink-faint"
        >
          <Icon name="clock" className="w-3.5 h-3.5" />
          Awaiting live feed
        </p>
      </div>
    </div>
  )
}

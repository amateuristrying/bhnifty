import { useEffect, useRef } from 'react'
import { gsap, motionOK } from '../../lib/motion'

/*
 * A number that counts to its new value instead of snapping to it. Written
 * straight to the DOM node — no per-frame React render for something that
 * changes 60 times a second.
 */
export default function Ticker({ value, format, duration = 0.6, className = '', as: Tag = 'span' }) {
  const ref = useRef(null)
  const shown = useRef(value)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (!motionOK() || shown.current === value) {
      node.textContent = format(value)
      shown.current = value
      return
    }
    const proxy = { v: shown.current }
    const tween = gsap.to(proxy, {
      v: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        node.textContent = format(proxy.v)
      },
    })
    shown.current = value
    return () => tween.kill()
  }, [value, format, duration])

  return (
    <Tag ref={ref} className={className}>
      {format(value)}
    </Tag>
  )
}

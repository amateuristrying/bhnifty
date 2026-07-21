import { useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY } from '../lib/motion'
import Icon from '../components/Icon'

function Field({ label, name, type = 'text', textarea = false, placeholder }) {
  /* underlined field — no boxes, just baselines; ink-in on focus */
  return (
    <div className="group">
      <label
        htmlFor={`f-${name}`}
        className="block text-[13px] font-bold text-ink-soft group-focus-within:text-ink transition-colors mb-1"
      >
        {label}
      </label>
      <div className="relative border-b border-rule">
        {textarea ? (
          <textarea
            id={`f-${name}`}
            name={name}
            required
            rows="3"
            placeholder={placeholder}
            className="w-full bg-transparent py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none resize-none"
          />
        ) : (
          <input
            id={`f-${name}`}
            name={name}
            type={type}
            required
            placeholder={placeholder}
            className="w-full bg-transparent py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        )}
        <span className="field-line" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function Contact() {
  const root = useRef(null)
  const [state, setState] = useState('idle') // idle | working | sent

  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(q('[data-head] > *, [data-form]'), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: SETTLE,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      })
    })
    return () => mm.revert()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    setState('working')
    /* submit shows working state, then a quiet success line replaces the form */
    setTimeout(() => setState('sent'), 900)
  }

  return (
    <section id="contact" ref={root}>
      <div className="mx-auto max-w-[640px] px-6 md:px-10 py-24 md:py-32">
        <div data-head className="text-center">
          <span className="inline-block uppercase tracking-[0.3em] text-[10.5px] font-bold text-ink-soft border border-rule rounded-full px-4 py-2">
            Get in Touch
          </span>
          <h2 className="mt-6 font-serif font-semibold text-4xl md:text-6xl tracking-tight">
            Have Questions or Feedback?
          </h2>
          <p className="mt-5 text-ink-soft leading-[1.7]">
            Our engineering team is always improving BHnifty.
            <br className="hidden md:block" /> Drop us a line if you have feature requests or
            integration feedback.
          </p>
        </div>

        <div data-form className="mt-12">
          {state === 'sent' ? (
            <p className="text-center py-10 text-ink font-semibold animate-[fadeIn_0.35s_ease-out]">
              Thank you — your message is on its way. We&rsquo;ll get back to you shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <Field label="Name" name="name" placeholder="Your name" />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" />
              <Field label="Message" name="message" textarea placeholder="How can we help?" />
              <button
                type="submit"
                disabled={state === 'working'}
                className="btn-lift w-full inline-flex items-center justify-center gap-3 bg-ink text-paper uppercase tracking-[0.28em] text-[11px] font-bold h-13 rounded-lg disabled:opacity-60 disabled:pointer-events-none"
              >
                {state === 'working' ? 'Sending…' : 'Send Message'}
                <Icon name="arrow-up-right" data-arrow className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

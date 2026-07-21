import useSmoothScroll from '../lib/useSmoothScroll'
import Navbar from '../components/Navbar'
import Hero from '../sections/Hero'
import Features from '../sections/Features'
import Preview from '../sections/Preview'
import Why from '../sections/Why'
import About from '../sections/About'
import Faq from '../sections/Faq'
import Contact from '../sections/Contact'
import Footer from '../sections/Footer'

export default function Landing({ isDark, onToggleTheme }) {
  /* inertial scroll, directed onto each screen's top edge */
  useSmoothScroll({ snapSelector: 'main > section, footer' })

  return (
    <div className="min-h-screen bg-paper text-ink font-sans transition-colors duration-300">
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />
      <main>
        <Hero isDark={isDark} />
        <Features />
        <Preview />
        <Why />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

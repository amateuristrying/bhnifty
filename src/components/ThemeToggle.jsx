import Icon from './Icon'

/* Day/night toggle — sits top-right on every screen */
export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="btn-lift inline-flex items-center justify-center w-11 h-11 rounded-lg border border-rule bg-panel text-ink cursor-pointer"
    >
      <Icon name={isDark ? 'sun' : 'moon'} className="w-4.5 h-4.5" />
    </button>
  )
}

export default function AppFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="shrink-0 border-t border-rule px-5 md:px-8 py-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12.5px] text-ink-faint">
        <span>© {year} BHnifty. Intelligent Financial Insights.</span>
        <span className="flex items-center gap-2">
          System Status:
          <span className="inline-flex items-center gap-1.5 font-semibold text-up">
            <span className="pulse-dot w-[7px] h-[7px] rounded-full bg-up" />
            Active
          </span>
        </span>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { NEWS, timeAgo } from '../../../lib/market/news'
import Icon from '../../../components/Icon'

export default function NewsFeed({ limit = 3 }) {
  return (
    <section data-card className="rounded-2xl border border-rule bg-panel p-5 md:p-6 flex flex-col">
      <header className="flex items-center gap-2.5 pb-4 border-b border-rule">
        <Icon name="file-text" className="w-[18px] h-[18px] text-ink" />
        <h3 className="font-serif font-semibold text-[19px] tracking-tight">
          Regulatory News Feed
        </h3>
      </header>

      <ul className="flex-1">
        {NEWS.slice(0, limit).map((item) => (
          <li key={item.id} className="py-4 border-b border-rule">
            <h4 className="font-serif font-semibold text-[15.5px] leading-snug tracking-tight text-ink">
              {item.headline}
            </h4>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span className="inline-block rounded bg-paper border border-rule px-2 py-1 text-[11px] text-ink-soft truncate">
                {item.source}
              </span>
              <span className="shrink-0 text-[11.5px] text-ink-faint tabular-nums">
                {timeAgo(item.agoMinutes)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <Link
        to="/app/news"
        className="btn-lift mt-4 self-start inline-flex items-center gap-2 text-[13px] font-bold text-ink"
      >
        View all news
        <Icon name="arrow-right" data-arrow className="w-4 h-4" />
      </Link>
    </section>
  )
}

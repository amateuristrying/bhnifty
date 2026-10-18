/*
 * Exchange clock. NSE trades 09:15–15:30 IST, Monday to Friday.
 *
 * Everything is computed on a timeline shifted by +05:30 so the UTC getters on
 * a Date read as IST wall time — no host-timezone assumptions anywhere.
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
const DAY_MS = 86400000
const OPEN_MIN = 9 * 60 + 15 // 09:15
const CLOSE_MIN = 15 * 60 + 30 // 15:30

/* A Date whose getUTC* accessors spell out Indian Standard Time */
export const istNow = (now = Date.now()) => new Date(now + IST_OFFSET_MS)

const isWeekday = (shifted) => {
  const day = new Date(shifted).getUTCDay()
  return day >= 1 && day <= 5
}

/*
 * { open, ist, label, until } — `until` counts down to the next state change,
 * so the header can say "Opens in 07h 31m 42s" or "Closes in 02h 14m 03s".
 */
export function marketState(now = Date.now()) {
  const shifted = now + IST_OFFSET_MS
  const dayStart = Math.floor(shifted / DAY_MS) * DAY_MS
  const minutes = (shifted - dayStart) / 60000
  const openAt = dayStart + OPEN_MIN * 60000
  const closeAt = dayStart + CLOSE_MIN * 60000

  const open = isWeekday(dayStart) && minutes >= OPEN_MIN && minutes < CLOSE_MIN
  if (open) {
    return { open, ist: new Date(shifted), label: 'Market Open', until: closeAt - shifted }
  }

  /* walk forward to the next session start, stepping over the weekend */
  let next = minutes < OPEN_MIN && isWeekday(dayStart) ? openAt : openAt + DAY_MS
  while (!isWeekday(next - OPEN_MIN * 60000)) next += DAY_MS

  return { open, ist: new Date(shifted), label: 'Market Closed', until: next - shifted }
}

/* Milliseconds (shifted timeline) of the most recent session's 09:15 and 15:30 */
export function lastSessionWindow(now = Date.now()) {
  const shifted = now + IST_OFFSET_MS
  let dayStart = Math.floor(shifted / DAY_MS) * DAY_MS
  const minutes = (shifted - dayStart) / 60000

  /* before the bell, or on a weekend, the "current" session is the previous one */
  if (!isWeekday(dayStart) || minutes < OPEN_MIN) dayStart -= DAY_MS
  while (!isWeekday(dayStart)) dayStart -= DAY_MS

  return { from: dayStart + OPEN_MIN * 60000, to: dayStart + CLOSE_MIN * 60000 }
}

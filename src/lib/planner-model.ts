/** No personal account, server submission or implicit storage for planner data. */
export type DateMode = 'exact' | 'month' | 'unknown'
export type PlannerMoment = { id: string; time: string; title: string; notes: string; done: boolean }
export type PlannerData = {
  eventName: string
  eventType: string
  dateMode: DateMode
  eventDate: string
  eventMonth: string
  city: string
  guestCount: string
  notes: string
  moments: PlannerMoment[]
}
export const plannerStoreKey = 'brigitta:planner:v1'
const suggestedMoments = [
  { time: '17:00', title: 'Sosirea invitaților', notes: 'Confirmă ora cu locația.' },
  { time: '19:00', title: 'Moment muzical live', notes: 'Programul se confirmă cu artistul.' },
  { time: '20:00', title: 'Pauză și tranziție', notes: 'Coordonează cu DJ-ul / organizatorul.' },
]
export function initialPlanner(): PlannerData {
  return {
    eventName: '', eventType: 'nunta', dateMode: 'unknown',
    eventDate: '', eventMonth: '', city: '', guestCount: '', notes: '',
    moments: suggestedMoments.map((item, i) => ({ id: 'example-' + i, ...item, done: false })),
  }
}
const bounded = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''
export function normalizePlanner(value: unknown): PlannerData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  if (!Array.isArray(raw.moments) || raw.moments.length > 40 ||
      !['exact', 'month', 'unknown'].includes(String(raw.dateMode))) return null
  const moments: PlannerMoment[] = []
  for (const entry of raw.moments) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null
    const item = entry as Record<string, unknown>
    const time = bounded(item.time, 5)
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null
    moments.push({
      id: bounded(item.id, 80) || String(moments.length),
      time, title: bounded(item.title, 120),
      notes: bounded(item.notes, 300), done: item.done === true,
    })
  }
  return {
    eventName: bounded(raw.eventName, 120), eventType: bounded(raw.eventType, 70),
    dateMode: raw.dateMode as DateMode,
    eventDate: bounded(raw.eventDate, 10), eventMonth: bounded(raw.eventMonth, 7),
    city: bounded(raw.city, 120), guestCount: bounded(raw.guestCount, 6),
    notes: bounded(raw.notes, 2000), moments,
  }
}
export function plannedDate(data: PlannerData, locale: 'ro' | 'en') {
  if (data.dateMode === 'exact' && /^\d{4}-\d{2}-\d{2}$/.test(data.eventDate))
    return data.eventDate
  if (data.dateMode === 'month' && /^\d{4}-(0[1-9]|1[0-2])$/.test(data.eventMonth))
    return data.eventMonth
  return locale === 'ro' ? 'De stabilit' : 'To be confirmed'
}

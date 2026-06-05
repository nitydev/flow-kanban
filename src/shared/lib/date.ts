import { differenceInCalendarDays, format } from 'date-fns'

import type { CardTone, TaskStatus } from '@/entities/flow/types'

export function todayIsoDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function addDaysIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return format(date, 'yyyy-MM-dd')
}

export function nowIso() {
  return new Date().toISOString()
}

export function getCardTone(status: TaskStatus, dueDate: string): CardTone {
  if (status === 'done') {
    return 'complete'
  }

  const days = differenceInCalendarDays(dueDate, todayIsoDate())

  if (days < 0) {
    return 'overdue'
  }

  if (days === 0) {
    return 'dueToday'
  }

  if (days <= 3) {
    return 'soon'
  }

  return 'normal'
}

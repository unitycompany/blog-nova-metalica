import type { Article } from '@/lib/supabase'
import { Archive, CheckCircle, Clock } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

type Status = Article['status']

const LABELS: Record<Status, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado'
}

const VARIANTS: Record<Status, string> = {
  draft: 'warning',
  published: 'success',
  archived: 'muted'
}

const ICONS: Record<Status, ReactNode> = {
  draft: <Clock size={14} weight="bold" aria-hidden="true" />,
  published: <CheckCircle size={14} weight="bold" aria-hidden="true" />,
  archived: <Archive size={14} weight="bold" aria-hidden="true" />
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`admin-badge admin-badge--${VARIANTS[status]}`}>
      {ICONS[status]}
      {LABELS[status]}
    </span>
  )
}

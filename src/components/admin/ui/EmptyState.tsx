import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="admin-empty" role="status">
      <span className="admin-empty__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="admin-empty__title">{title}</h3>
      <p className="admin-empty__description">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="admin-button admin-button--primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

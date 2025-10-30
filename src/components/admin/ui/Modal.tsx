import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

export function Modal({
  title,
  description,
  children,
  onClose
}: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__dialog">
        <header className="admin-modal__header">
          <div>
            <h2 className="admin-modal__title">{title}</h2>
            {description ? <p className="admin-modal__subtitle">{description}</p> : null}
          </div>
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </header>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  )
}

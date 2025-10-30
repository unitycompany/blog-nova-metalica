import type { ReactNode } from 'react'

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  children
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="admin-field" htmlFor={htmlFor}>
      <span className="admin-field__label">
        <span className="admin-field__label-text">
          {label}
          {required ? <span className="admin-field__required">*</span> : null}
        </span>
        {hint ? (
          <span
            className="admin-field__hint-icon"
            role="tooltip"
            tabIndex={0}
            aria-label={hint}
            title={hint}
          >
            !
          </span>
        ) : null}
      </span>
      {children}
    </label>
  )
}

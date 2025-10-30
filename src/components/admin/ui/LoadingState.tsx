export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="admin-loading" role="status" aria-live="polite">
      <span className="admin-loading__spinner" aria-hidden="true" />
      <span>{label ?? 'Carregando...'}</span>
    </div>
  )
}

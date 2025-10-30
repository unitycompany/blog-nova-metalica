import { Global, css } from '@emotion/react'

export function AdminStyles() {
  return (
    <Global
      styles={css`
        :root {
          --admin-bg: #f8fafc;
          --admin-surface: #ffffff;
          --admin-border: #e2e8f0;
          --admin-border-strong: #cbd5f5;
          --admin-muted: #64748b;
          --admin-muted-strong: #475569;
          --admin-primary: #2563eb;
          --admin-primary-soft: rgba(37, 99, 235, 0.12);
          --admin-primary-border: rgba(37, 99, 235, 0.35);
          --admin-success: #16a34a;
          --admin-warning: #f59e0b;
          --admin-danger: #dc2626;
          --admin-radius-sm: 8px;
          --admin-radius-md: 12px;
          --admin-radius-lg: 16px;
          --admin-shadow: 0 16px 45px rgba(15, 23, 42, 0.08);
          --admin-shadow-soft: 0 10px 25px rgba(15, 23, 42, 0.06);
          --admin-shadow-overlay: 0 25px 60px rgba(15, 23, 42, 0.25);
        }
        .admin-section__subtitle {
          margin: 0.35rem 0 0;
          color: var(--admin-muted);
          font-size: 0.9rem;
          max-width: 38rem;
          line-height: 1.5;
        }

        .admin-toolbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .admin-toolbar__group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .admin-search {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.85rem;
          border-radius: var(--admin-radius-md);
          border: 1px solid var(--admin-border);
          background: var(--admin-bg);
          min-width: 220px;
        }

        .admin-search:focus-within {
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14);
        }

        .admin-search__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-muted);
        }

        .admin-search__icon svg {
          width: 1rem;
          height: 1rem;
        }

        .admin-search__input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
        }

        .admin-select,
        .admin-input,
        .admin-textarea {
          width: 100%;
          border-radius: var(--admin-radius-md);
          border: 1px solid var(--admin-border);
          padding: 0.6rem 0.75rem;
          font-size: 0.9rem;
          color: #0f172a;
          background: var(--admin-surface);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-select:focus,
        .admin-input:focus,
        .admin-textarea:focus {
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
          outline: none;
        }

        .admin-textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .admin-textarea--code {
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
        }

        .admin-multiselect {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding: 0.35rem 0;
        }

        .admin-multiselect__option {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #0f172a;
        }

        .admin-multiselect__option span {
          flex: 1;
        }

        .admin-multiselect__checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid var(--admin-border);
          cursor: pointer;
        }

        .admin-multiselect__checkbox:focus-visible {
          outline: 2px solid rgba(37, 99, 235, 0.35);
          outline-offset: 2px;
        }

        .admin-editor {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .admin-editor__toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .admin-editor__status {
          font-size: 0.82rem;
          color: var(--admin-muted-strong);
        }

        .admin-editor__status--error {
          color: var(--admin-danger);
        }

        .admin-editor__container {
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
          overflow: hidden;
          min-height: 320px;
          background: var(--admin-surface);
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .admin-editor[data-ready='false'] textarea {
          opacity: 0.5;
        }

        .admin-editor__error {
          padding: 1rem;
          border-radius: var(--admin-radius-md);
          border: 1px solid rgba(220, 38, 38, 0.45);
          background: rgba(254, 226, 226, 0.6);
          color: #b91c1c;
          font-size: 0.9rem;
        }

        .admin-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          border-radius: var(--admin-radius-md);
          padding: 0.55rem 0.9rem;
          font-size: 0.88rem;
          font-weight: 600;
          border: 1px solid transparent;
          background: var(--admin-bg);
          color: var(--admin-muted-strong);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .admin-button svg {
          width: 1rem;
          height: 1rem;
        }

        .admin-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
        }

        .admin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .admin-button--primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border-color: transparent;
        }

        .admin-button--primary:hover:not(:disabled) {
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.35);
        }

        .admin-button--ghost {
          background: transparent;
          border-color: var(--admin-border);
          color: var(--admin-muted-strong);
        }

        .admin-button--danger {
          background: rgba(220, 38, 38, 0.08);
          color: var(--admin-danger);
          border-color: rgba(220, 38, 38, 0.25);
        }

        .admin-button--danger:hover:not(:disabled) {
          box-shadow: 0 12px 26px rgba(220, 38, 38, 0.25);
        }

        .admin-section__body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .admin-table__wrapper {
          width: 100%;
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          box-shadow: var(--admin-shadow);
          overflow: hidden;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .admin-table thead {
          background: rgba(15, 23, 42, 0.04);
        }

        .admin-table th,
        .admin-table td {
          text-align: left;
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid var(--admin-border);
          color: #0f172a;
        }

        .admin-table th {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--admin-muted);
          font-weight: 600;
        }

        .admin-table tbody tr:hover {
          background: rgba(37, 99, 235, 0.05);
        }

        .admin-table__title {
          font-weight: 600;
          margin-bottom: 0.15rem;
        }

        .admin-table__subtitle {
          font-size: 0.78rem;
          color: var(--admin-muted);
        }

        .admin-table__actions {
          text-align: right;
        }

        .admin-table__buttons {
          display: inline-flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .admin-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0.28rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(15, 23, 42, 0.05);
          color: var(--admin-muted-strong);
        }

        .admin-chip--warning {
          background: rgba(245, 158, 11, 0.15);
          color: #b45309;
        }

        .admin-chip--success {
          background: rgba(34, 197, 94, 0.16);
          color: #166534;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.28rem 0.65rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .admin-badge svg {
          width: 0.85rem;
          height: 0.85rem;
        }

        .admin-badge--success {
          background: rgba(34, 197, 94, 0.18);
          color: #15803d;
        }

        .admin-badge--warning {
          background: rgba(245, 158, 11, 0.18);
          color: #b45309;
        }

        .admin-badge--muted {
          background: rgba(100, 116, 139, 0.18);
          color: var(--admin-muted-strong);
        }

        .admin-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          box-shadow: var(--admin-shadow-soft);
          gap: 0.85rem;
          text-align: center;
        }

        .admin-empty__icon {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: var(--admin-radius-md);
          background: var(--admin-primary-soft);
          color: var(--admin-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .admin-empty__icon svg {
          width: 1.4rem;
          height: 1.4rem;
        }

        .admin-empty__title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
        }

        .admin-empty__description {
          margin: 0;
          color: var(--admin-muted);
          font-size: 0.9rem;
          max-width: 24rem;
        }

        .admin-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }

        .admin-grid--list {
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
        }

        .admin-card {
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          padding: 1.25rem;
          box-shadow: var(--admin-shadow-soft);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .admin-card--list {
          padding: 1.25rem 1.5rem;
        }

        .admin-card__header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
        }

        .admin-card__title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
        }

        .admin-card__subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.8rem;
          color: var(--admin-muted);
        }

        .admin-card__description {
          margin: 0;
          color: var(--admin-muted);
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .admin-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          font-size: 0.78rem;
          color: var(--admin-muted);
        }

        .admin-meta {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.5rem;
          border-radius: var(--admin-radius-sm);
          background: rgba(15, 23, 42, 0.05);
        }

        .admin-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .admin-tag {
          padding: 0.18rem 0.45rem;
          font-size: 0.75rem;
          background: rgba(37, 99, 235, 0.08);
          color: var(--admin-primary);
          border-radius: var(--admin-radius-sm);
        }

        .admin-card__actions {
          margin-top: 0.25rem;
          display: inline-flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .admin-author {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .admin-author__avatar {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: rgba(37, 99, 235, 0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .admin-author__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-author__avatar svg {
          width: 1.75rem;
          height: 1.75rem;
          color: var(--admin-primary);
        }

        .admin-author__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .admin-author__header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
        }

        .admin-author__links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .admin-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--admin-primary);
          text-decoration: none;
        }

        .admin-link svg {
          width: 0.9rem;
          height: 0.9rem;
        }

        .admin-loading {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 1.25rem 1.5rem;
          background: rgba(15, 23, 42, 0.035);
          border-radius: var(--admin-radius-lg);
          color: var(--admin-muted-strong);
        }

        @keyframes admin-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .admin-loading__spinner {
          width: 1.15rem;
          height: 1.15rem;
          border-radius: 999px;
          border: 2px solid rgba(37, 99, 235, 0.15);
          border-top-color: var(--admin-primary);
          animation: admin-spin 0.8s linear infinite;
        }

        .admin-modal {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          z-index: 1000;
        }

        .admin-modal__dialog {
          width: min(960px, 90vw);
          background: var(--admin-surface);
          border-radius: 20px;
          box-shadow: var(--admin-shadow-overlay);
          border: 1px solid rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .admin-modal__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem 1.75rem 1.1rem;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .admin-modal__title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 600;
        }

        .admin-modal__subtitle {
          margin: 0.3rem 0 0;
          font-size: 0.92rem;
          color: var(--admin-muted);
        }

        .admin-modal__body {
          padding: 1.5rem 1.75rem 1.75rem;
          overflow-y: auto;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .admin-form__section {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          padding: 1.4rem;
          background: rgba(248, 250, 252, 0.65);
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .admin-form__toggle {
          display: flex;
          justify-content: flex-start;
          margin-top: -0.5rem;
        }

        .admin-form__section-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--admin-muted-strong);
        }

        .admin-form__grid {
          display: grid;
          gap: 1rem;
        }

        .admin-form__grid--two {
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }

        .admin-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.88rem;
          color: var(--admin-muted-strong);
        }

        .admin-field__label {
          font-weight: 600;
          display: inline-flex;
          gap: 0.4rem;
          align-items: center;
        }

        .admin-field__label-text {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .admin-field__required {
          color: var(--admin-danger);
        }

        .admin-field__hint-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.08);
          color: var(--admin-primary);
          font-weight: 700;
          font-size: 0.78rem;
          cursor: help;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .admin-field__hint-icon:focus-visible {
          outline: 2px solid rgba(37, 99, 235, 0.28);
          outline-offset: 2px;
        }

        .admin-field__stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-meta-preview-grid {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
        }

        .admin-meta-preview {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 0.85rem 1rem;
          border-radius: var(--admin-radius-md);
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.02);
        }

        .admin-meta-preview__label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--admin-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .admin-meta-preview__value {
          font-size: 0.9rem;
          color: var(--admin-muted-strong);
          word-break: break-word;
        }

        .admin-json-control {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          border: 1px dashed rgba(15, 23, 42, 0.18);
          border-radius: var(--admin-radius-md);
          background: rgba(241, 245, 249, 0.7);
        }

        .admin-json-control__summary ul {
          margin: 0;
          padding-left: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: var(--admin-muted-strong);
          font-size: 0.85rem;
        }

        .admin-json-control__summary li::marker {
          color: var(--admin-primary);
        }

        .admin-json-control__empty {
          font-size: 0.85rem;
          color: var(--admin-muted);
        }

        .admin-json-control__actions {
          display: flex;
          gap: 0.5rem;
        }

        .admin-json-control__input {
          display: none;
        }

        .admin-json-editor-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2010;
        }

        .admin-json-editor-overlay__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
        }

        .admin-json-editor-overlay__dialog {
          position: relative;
          z-index: 1;
          width: min(640px, 92vw);
          max-height: 80vh;
          border-radius: var(--admin-radius-lg);
          border: 1px solid rgba(148, 163, 184, 0.45);
          background: var(--admin-surface);
          box-shadow: var(--admin-shadow-overlay);
          display: flex;
          flex-direction: column;
        }

        .admin-json-editor-overlay__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--admin-border);
        }

        .admin-json-editor-overlay__title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--admin-muted-strong);
        }

        .admin-json-editor-overlay__body {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .admin-json-editor-item {
          border: 1px solid rgba(148, 163, 184, 0.4);
          border-radius: var(--admin-radius-md);
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(248, 250, 252, 0.85);
        }

        .admin-json-editor-item__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          font-weight: 600;
          color: var(--admin-muted-strong);
        }

        .admin-json-editor-item__fields {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .admin-json-editor-item__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .admin-json-editor-item__field label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--admin-muted);
        }

        .admin-json-editor-overlay__footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--admin-border);
          background: rgba(248, 250, 252, 0.88);
        }

        .admin-chip-input {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .admin-chip-input__list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .admin-chip-input__tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(37, 99, 235, 0.25);
          background: rgba(37, 99, 235, 0.12);
          color: var(--admin-primary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }

        .admin-chip-input__tag:hover {
          background: rgba(37, 99, 235, 0.18);
        }

        .admin-chip-input__tag-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1rem;
          height: 1rem;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.22);
          color: #ffffff;
          font-size: 0.65rem;
          line-height: 1;
        }

        .admin-input-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .admin-input-group .admin-input {
          flex: 1;
        }

        .admin-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--admin-radius-md);
          border: 1px solid var(--admin-border);
          background: var(--admin-surface);
        }

        .admin-checkbox__input {
          width: 1rem;
          height: 1rem;
          accent-color: var(--admin-primary);
        }

        .admin-checkbox__input:focus-visible {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }

        .admin-checkbox__label {
          font-size: 0.85rem;
          color: var(--admin-muted-strong);
        }

        .admin-uploader {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 0.9rem;
          border-radius: 14px;
          border: 1px dashed rgba(148, 163, 184, 0.6);
          background: rgba(248, 250, 252, 0.8);
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-uploader[data-state='filled'] {
          border-style: solid;
          border-color: rgba(37, 99, 235, 0.25);
          background: var(--admin-surface);
          box-shadow: var(--admin-shadow-soft);
        }

        .admin-uploader__dropzone {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
          border-radius: 12px;
          border: 1px dashed rgba(148, 163, 184, 0.5);
          background: rgba(15, 23, 42, 0.035);
          cursor: pointer;
        }

        .admin-uploader__dropzone:hover {
          border-color: var(--admin-primary);
          background: rgba(37, 99, 235, 0.08);
        }

        .admin-uploader__dropzone:focus-visible {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }

        .admin-uploader__preview {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .admin-uploader__preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-uploader__placeholder {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--admin-muted);
          font-size: 0.85rem;
          padding: 1.1rem;
        }

        .admin-uploader__actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .admin-uploader__manual .admin-input {
          width: 100%;
        }

        .admin-uploader__status {
          font-size: 0.82rem;
          color: var(--admin-muted-strong);
        }

        .admin-uploader__status--success {
          color: var(--admin-success);
        }

        .admin-uploader__status--error {
          color: var(--admin-danger);
        }

        .admin-modal__footer {
          padding: 1.25rem 1.75rem;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

          .admin-login {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(148, 163, 184, 0.25) 100%);
            padding: 2rem;
          }

          .admin-login__card {
            width: min(420px, 100%);
            background: #ffffff;
            border-radius: 16px;
            padding: 2.4rem;
            box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .admin-login__title {
            margin: 0;
            font-size: 1.6rem;
            font-weight: 700;
          }

          .admin-login__subtitle {
            margin: 0;
            color: var(--admin-muted-strong);
            font-size: 0.95rem;
          }

          .admin-login__form {
            display: flex;
            flex-direction: column;
            gap: 1.1rem;
          }

          .admin-login__submit {
            width: 100%;
            justify-content: center;
            margin-top: 0.25rem;
          }

          .admin-login__error {
            margin: 0;
            padding: 0.75rem 1rem;
            background: rgba(239, 68, 68, 0.12);
            color: var(--admin-danger);
            border-radius: 10px;
            font-size: 0.9rem;
          }

        @media (max-width: 768px) {
          .admin-section__header {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-toolbar {
            width: 100%;
          }

          .admin-grid--list {
            grid-template-columns: 1fr;
          }

          .admin-modal {
            padding: 1.25rem;
          }

          .admin-modal__dialog {
            width: 100%;
          }
        }
      `}
    />
  )
}

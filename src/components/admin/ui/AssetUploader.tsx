import { ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { PaperPlaneTilt, Trash, UploadSimple } from '@phosphor-icons/react'

type AssetUploaderProps = {
  id: string
  value?: string | null
  onChange: (nextValue: string) => void
  accept?: string
  allowManualInput?: boolean
  disabled?: boolean
  placeholder?: string
}

export function AssetUploader({
  id,
  value,
  onChange,
  accept = 'image/*',
  allowManualInput = true,
  disabled = false,
  placeholder = 'Arraste e solte ou clique para enviar'
}: AssetUploaderProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error' | 'success'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const resetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  function scheduleReset() {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = window.setTimeout(() => {
      setStatus('idle')
      resetTimerRef.current = null
    }, 3000)
  }

  async function uploadFile(file: File) {
    setErrorMessage(null)

    if (file.size > 5 * 1024 * 1024) {
      setStatus('error')
      setErrorMessage('O arquivo deve ter no máximo 5 MB.')
      scheduleReset()
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setStatus('uploading')
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Falha ao enviar o arquivo. Tente novamente.')
      }

      const data = (await response.json()) as { url: string }
      onChange(data.url)
      setStatus('success')
    } catch (error) {
      console.error('Upload error:', error)
      setStatus('error')
      setErrorMessage('Não foi possível enviar o arquivo. Verifique a conexão e tente novamente.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      scheduleReset()
    }
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    void uploadFile(file)
  }

  function handleOpenDialog() {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  function handleClear() {
    onChange('')
    setStatus('idle')
    setErrorMessage(null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (disabled || status === 'uploading') {
      return
    }

    const file = event.dataTransfer.files?.[0]

    if (file) {
      void uploadFile(file)
    }
  }

  return (
    <div className="admin-uploader" data-state={value ? 'filled' : 'empty'}>
      <div
        className="admin-uploader__dropzone"
        role="button"
        tabIndex={0}
        onClick={handleOpenDialog}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleOpenDialog()
          }
        }}
        aria-label="Enviar imagem"
      >
        {value ? (
          <div className="admin-uploader__preview">
            <img src={value} alt="Pré-visualização do arquivo" />
          </div>
        ) : (
          <div className="admin-uploader__placeholder">
            <UploadSimple size={24} weight="bold" aria-hidden="true" />
            <span>{placeholder}</span>
          </div>
        )}
      </div>

      <div className="admin-uploader__actions">
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={handleOpenDialog}
          disabled={disabled || status === 'uploading'}
        >
          <PaperPlaneTilt size={16} weight="bold" aria-hidden="true" />
          {status === 'uploading' ? 'Enviando...' : 'Selecionar arquivo'}
        </button>

        {value ? (
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={handleClear}
            disabled={disabled}
          >
            <Trash size={16} weight="bold" aria-hidden="true" />
            Remover
          </button>
        ) : null}
      </div>

      {allowManualInput ? (
        <div className="admin-uploader__manual">
          <input
            id={id}
            className="admin-input"
            type="text"
            value={value ?? ''}
            placeholder="/assets/uploads/..."
            onChange={(event) => {
              setStatus('idle')
              setErrorMessage(null)
              onChange(event.target.value)
            }}
            disabled={disabled}
            inputMode="url"
          />
        </div>
      ) : (
        <input id={id} type="file" ref={fileInputRef} className="admin-uploader__input" hidden accept={accept} onChange={handleFileUpload} disabled={disabled} />
      )}

      {allowManualInput ? (
        <input
          type="file"
          ref={fileInputRef}
          className="admin-uploader__input"
          hidden
          accept={accept}
          onChange={handleFileUpload}
          disabled={disabled}
        />
      ) : null}

      {status === 'uploading' ? (
        <p className="admin-uploader__status">Processando o upload...</p>
      ) : null}

      {status === 'success' ? <p className="admin-uploader__status admin-uploader__status--success">Upload concluído!</p> : null}

      {status === 'error' || errorMessage ? (
        <p className="admin-uploader__status admin-uploader__status--error">{errorMessage ?? 'Não foi possível concluir o upload.'}</p>
      ) : null}
    </div>
  )
}

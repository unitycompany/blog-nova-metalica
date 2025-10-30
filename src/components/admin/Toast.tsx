import { useEffect, useState, type ReactNode } from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

const TOAST_STYLES: Record<ToastType, { background: string; border: string; icon: ReactNode }> = {
  success: {
    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    border: 'rgba(34, 197, 94, 0.45)',
    icon: <CheckCircle size={20} weight="fill" aria-hidden="true" />
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    border: 'rgba(239, 68, 68, 0.45)',
    icon: <WarningCircle size={20} weight="fill" aria-hidden="true" />
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    border: 'rgba(59, 130, 246, 0.45)',
    icon: <Info size={20} weight="fill" aria-hidden="true" />
  }
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const tone = TOAST_STYLES[type]

  return (
    <ToastContainer role="status" tone={type}>
      <IconWrapper>{tone.icon}</IconWrapper>
      <Message>{message}</Message>
      <CloseButton
        type="button"
        aria-label="Fechar notificação"
        onClick={() => {
          setVisible(false)
          onClose?.()
        }}
      >
        <X size={16} weight="bold" aria-hidden="true" />
      </CloseButton>
    </ToastContainer>
  )
}

// Hook para usar toast facilmente
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}

const enter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const ToastContainer = styled.div<{ tone: ToastType }>`
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 14px;
  background: ${({ tone }) => TOAST_STYLES[tone].background};
  color: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.2);
  border: 1px solid ${({ tone }) => TOAST_STYLES[tone].border};
  z-index: 1200;
  min-width: 260px;
  max-width: 420px;
  animation: ${enter} 0.22s ease-out;
`

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Message = styled.span`
  font-size: 0.92rem;
  line-height: 1.4;
  flex: 1;
`

const CloseButton = styled.button`
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`

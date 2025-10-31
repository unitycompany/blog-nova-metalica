'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { rgba } from 'polished';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  contextData?: Record<string, string>;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(3, 6, 15, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1600;
  padding: 24px;
`;

const Dialog = styled.div`
  width: min(480px, 100%);
  background: linear-gradient(180deg, rgba(9, 15, 30, 0.92) 0%, rgba(9, 15, 30, 0.88) 100%);
  border: 1px solid ${(props) => rgba(props.theme.color.primary.main, 0.35)};
  box-shadow: 0 28px 70px rgba(3, 6, 15, 0.6);
  border-radius: 18px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: ${(props) => props.theme.color.gray[500]};
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: ${(props) => props.theme.font.size.md};
  margin: 0;
  color: ${(props) => props.theme.color.gray[500]};
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: ${(props) => props.theme.font.size.extra_sm};
  color: ${(props) => rgba(props.theme.color.gray[500], 0.85)};
`;

const CloseButton = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  color: ${(props) => props.theme.color.gray[500]};
  cursor: pointer;
  font-size: ${(props) => props.theme.font.size.md};
  line-height: 1;
  padding: 4px;
  border-radius: 8px;
  transition: background-color 0.25s ease, color 0.25s ease;

  &:hover {
    background: ${(props) => rgba(props.theme.color.primary.main, 0.16)};
    color: ${(props) => props.theme.color.gray[100]};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: ${(props) => props.theme.font.size.extra_sm};
  color: ${(props) => rgba(props.theme.color.gray[500], 0.85)};
`;

const TextInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${(props) => rgba(props.theme.color.gray[500], 0.2)};
  background: rgba(255, 255, 255, 0.02);
  color: ${(props) => props.theme.color.gray[500]};
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.color.primary.main};
    box-shadow: 0 0 0 3px ${(props) => rgba(props.theme.color.primary.main, 0.15)};
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ConsentGroup = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: ${(props) => props.theme.font.size.extra_sm};
  line-height: 1.4;
  color: ${(props) => rgba(props.theme.color.gray[500], 0.85)};
`;

const Checkbox = styled.input`
  margin-top: 2px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid ${(props) => rgba(props.theme.color.gray[500], 0.4)};
  accent-color: ${(props) => props.theme.color.primary.main};
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  font-size: ${(props) => props.theme.font.size.sm};
  font-weight: ${(props) => props.theme.font.weight.semi_bold};
  cursor: pointer;
  background: linear-gradient(120deg, ${(props) => props.theme.color.primary.main} 0%, ${(props) => rgba(props.theme.color.primary.light, 0.85)} 100%);
  color: ${(props) => props.theme.color.black[0]};
  box-shadow: 0 12px 30px ${(props) => rgba(props.theme.color.primary.main, 0.35)};
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover:enabled {
    transform: translateY(-2px);
    box-shadow: 0 16px 38px ${(props) => rgba(props.theme.color.primary.main, 0.42)};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
`;

const Feedback = styled.p<{ $state: SubmitState }>`
  font-size: ${(props) => props.theme.font.size.extra_sm};
  color: ${(props) =>
    props.$state === 'error'
      ? '#ff6b6b'
      : props.$state === 'success'
        ? '#1dd1a1'
        : rgba(props.theme.color.gray[500], 0.75)};
  margin: 0;
`;

const PRIVACY_POLICY_URL = 'https://www.novametalica.com.br/politica-de-privacidade';

function validateEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

function sanitizePhone(value: string) {
  return value.replace(/[^0-9+]/g, '');
}

function validatePhone(value: string) {
  const sanitized = sanitizePhone(value);
  return sanitized.length >= 8;
}

export function ContactModal({ isOpen, onClose, defaultData, contextData }: ContactModalProps) {
  const [form, setForm] = useState<FormState>({
    name: defaultData?.name ?? '',
    email: defaultData?.email ?? '',
    phone: defaultData?.phone ?? '',
    consent: false,
  });
  const [status, setStatus] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        name: defaultData?.name ?? prev.name ?? '',
        email: defaultData?.email ?? prev.email ?? '',
        phone: defaultData?.phone ?? prev.phone ?? '',
        consent: false,
      }));
      setStatus('idle');
      setErrorMessage('');
      requestAnimationFrame(() => {
        firstFieldRef.current?.focus();
      });
    }
  }, [isOpen, defaultData?.name, defaultData?.email, defaultData?.phone]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const canSubmit = useMemo(() => {
    if (!form.consent) {
      return false;
    }

    const nameValid = form.name.trim().length >= 2;
    const emailValid = validateEmail(form.email);
    const phoneValid = validatePhone(form.phone);

    return nameValid && emailValid && phoneValid;
  }, [form]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'consent' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || status === 'submitting') {
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const sanitizedPhone = sanitizePhone(form.phone);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: sanitizedPhone,
        rawPhone: form.phone.trim(),
        consent: form.consent,
        submittedAt: new Date().toISOString(),
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        utm: contextData && Object.keys(contextData).length > 0 ? contextData : undefined,
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const apiMessage = errorJson?.error as string | undefined;
        throw new Error(apiMessage ?? `Falha ao enviar dados (${response.status})`);
      }

      setStatus('success');
      setTimeout(onClose, 1200);
    } catch (error) {
      console.error('Falha ao enviar formulário de contato:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível enviar seus dados.');
      setStatus('error');
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && status !== 'submitting') {
      onClose();
    }
  };

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <Dialog>
        <Header>
          <div>
            <Title>Podemos ajudar sua obra?</Title>
            <Subtitle>Deixe seus dados e nossa equipe entra em contato rapidamente.</Subtitle>
          </div>
          <CloseButton type="button" aria-label="Fechar" onClick={onClose}>
            ×
          </CloseButton>
        </Header>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            Nome completo
            <TextInput
              ref={firstFieldRef}
              name="name"
              placeholder="Seu nome"
              value={form.name}
              onChange={handleChange('name')}
              autoComplete="name"
              required
              minLength={2}
            />
          </InputGroup>
          <InputGroup>
            E-mail corporativo
            <TextInput
              name="email"
              type="email"
              placeholder="seuemail@empresa.com"
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
              required
            />
          </InputGroup>
          <InputGroup>
            Telefone / WhatsApp
            <TextInput
              name="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={handleChange('phone')}
              autoComplete="tel"
              required
            />
          </InputGroup>
          <ConsentGroup>
            <Checkbox
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange('consent')}
              required
            />
            <span>
              Concordo com a{' '}
              <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
                política de privacidade
              </a>
              .
            </span>
          </ConsentGroup>
          {status !== 'idle' ? (
            <Feedback $state={status}>
              {status === 'success'
                ? 'Recebemos seus dados! Em instantes nossa equipe entra em contato.'
                : status === 'error'
                  ? `Erro: ${errorMessage}`
                  : 'Enviando informações…'}
            </Feedback>
          ) : null}
          <SubmitButton type="submit" disabled={!canSubmit || status === 'submitting'}>
            {status === 'submitting' ? 'Enviando…' : 'Enviar contato'}
          </SubmitButton>
        </Form>
      </Dialog>
    </Overlay>
  );
}

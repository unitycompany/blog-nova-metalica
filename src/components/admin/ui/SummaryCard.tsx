import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

type SummaryCardProps = {
  value: number | string
  label: string
  tone?: 'default' | 'primary'
}

export function SummaryCard({ value, label, tone = 'default' }: SummaryCardProps) {
  return (
    <Card data-tone={tone}>
      <CardValue>{value}</CardValue>
      <CardLabel>{label}</CardLabel>
    </Card>
  )
}

export function SummarySkeleton() {
  return (
    <Card data-tone="skeleton" aria-hidden="true">
      <SkeletonBlock />
      <SkeletonLine />
    </Card>
  )
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &[data-tone='primary'] {
    background: linear-gradient(150deg, #2563eb 0%, #7c3aed 100%);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 16px 40px rgba(37, 99, 235, 0.28);
  }

  &[data-tone='skeleton'] {
    background: rgba(148, 163, 184, 0.12);
    border-style: dashed;
    box-shadow: none;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);


  &[data-tone='skeleton']:hover {
    transform: none;
    box-shadow: none;
  }
    &[data-tone='skeleton'] {
      transform: none;
      box-shadow: none;
    }
  }
`

const CardValue = styled.span`
  font-size: 1.75rem;
  font-weight: 700;
`

const CardLabel = styled.span`
  font-size: 0.85rem;
  color: inherit;
  opacity: 0.75;
`

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

const SkeletonBlock = styled.span`
  display: block;
  height: 2.2rem;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.18), rgba(203, 213, 225, 0.4), rgba(148, 163, 184, 0.18));
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease infinite;
`

const SkeletonLine = styled(SkeletonBlock)`
  height: 0.9rem;
  width: 60%;
`

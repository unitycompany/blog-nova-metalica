import Image from 'next/image'
import type { ComponentType, ReactNode } from 'react'
import styled from '@emotion/styled'
import type { IconProps } from '@phosphor-icons/react'
import { SummaryCard, SummarySkeleton } from '../ui/SummaryCard'
import { SignOut } from '@phosphor-icons/react'

export type TabSummary = {
  total: number
  primaryLabel: string
  meta?: Array<{ label: string; value: string }>
}

export type TabDefinition<T extends string> = {
  id: T
  label: string
  description: string
  icon?: ComponentType<IconProps>
}

type AdminShellProps<T extends string> = {
  tabs: Array<TabDefinition<T>>
  activeTab: T
  onTabChange: (tab: T) => void
  summaryData: TabSummary | null
  summaryLoading?: boolean
  children: ReactNode
  userEmail?: string
  onLogout?: () => void
}

export function AdminShell<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  summaryData,
  summaryLoading = false,
  children,
  userEmail,
  onLogout
}: AdminShellProps<T>) {
  const currentTab = tabs.find((tab) => tab.id === activeTab)

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Logo aria-hidden="true">
            <Image
              src="https://www.novametalica.com.br/avatar.ico"
              alt="Logotipo Nova Metálica"
              width={32}
              height={32}
              className="admin-shell__logo"
            />
          </Logo>
          <BrandTitle>Nova Metálica</BrandTitle>
        </Brand>

        <Nav aria-label="Seções do painel">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <NavButton
                key={tab.id}
                type="button"
                data-active={tab.id === activeTab}
                onClick={() => onTabChange(tab.id)}
              >
                {Icon ? (
                  <NavIcon aria-hidden="true">
                    <Icon size={18} weight="duotone" />
                  </NavIcon>
                ) : null}
                <NavLabel>{tab.label}</NavLabel>
              </NavButton>
            )
          })}
        </Nav>

        {(userEmail || onLogout) ? (
          <SidebarFooter>
            {userEmail ? (
              <SidebarUser title={userEmail}>
                <SidebarUserAvatar aria-hidden="true">{userEmail.slice(0, 2).toUpperCase()}</SidebarUserAvatar>
                <SidebarUserLabel>{userEmail}</SidebarUserLabel>
              </SidebarUser>
            ) : null}

            {onLogout ? (
              <SidebarLogout type="button" onClick={onLogout}>
                <SignOut size={16} weight="bold" aria-hidden="true" />
                <span>Sair</span>
              </SidebarLogout>
            ) : null}
          </SidebarFooter>
        ) : null}
      </Sidebar>

      <Main>
        <Header>
          <div>
            <Breadcrumb>Painel editorial</Breadcrumb>
            <Title>{currentTab?.label ?? 'Painel'}</Title>
            <Subtitle>{currentTab?.description ?? 'Administre conteúdos, categorias e equipe.'}</Subtitle>
          </div>

          <SummaryGrid role="status" aria-live="polite">
            {summaryLoading || !summaryData ? (
              <>
                <SummarySkeleton />
                <SummarySkeleton />
                <SummarySkeleton />
              </>
            ) : (
              <>
                <SummaryCard tone="primary" value={summaryData.total} label={summaryData.primaryLabel} />
                {summaryData.meta?.map((item) => (
                  <SummaryCard key={item.label} value={item.value} label={item.label} />
                ))}
              </>
            )}
          </SummaryGrid>
        </Header>

        <Content>{children}</Content>
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  display: flex;
  width: 95%;
  max-width: 100vw;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #0f172a;
`

const Sidebar = styled.aside`
  width: 220px;
  padding: 1.75rem 1.5rem;
  background: linear-gradient(180deg, #f8fafc 0%, #e0e7ff 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 1024px) {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
  }
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const Logo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.6rem;
  background: #ffffff;
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 0.05em;
  border: 1px solid #00000020;

  & .admin-shell__logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const BrandTitle = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
`

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 1024px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }
`

const SidebarFooter = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(148, 163, 184, 0.35);

  @media (max-width: 1024px) {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`

const SidebarUser = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
`

const SidebarUserAvatar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.6rem;
  background: rgba(37, 99, 235, 0.18);
  color: rgba(37, 99, 235, 0.95);
  font-weight: 700;
  font-size: 0.85rem;
`

const SidebarUserLabel = styled.span`
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1024px) {
    max-width: none;
  }
`

const SidebarLogout = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  font-weight: 600;
  padding: 0.55rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const NavButton = styled.button`
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  text-align: left;
  display: flex;
  gap: 0.65rem;
  align-items: center;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  color: inherit;
  width: 100%;

  &[data-active='true'] {
    background: rgba(37, 99, 235, 0.12);
    border-color: rgba(37, 99, 235, 0.35);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  &:hover {
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.25);
    transform: translateX(4px);
  }

  @media (max-width: 1024px) {
    flex: 1 1 220px;
  }
`

const NavIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #2563eb;
`

const NavLabel = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  min-width: 0;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  gap: 2rem;

  @media (max-width: 1280px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem;
  }
`

const Breadcrumb = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`

const Subtitle = styled.p`
  margin-top: 0.45rem;
  color: #64748b;
  max-width: 36rem;
  line-height: 1.6;
`

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  min-width: 22rem;
  width: 100%;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Content = styled.div`
  padding: 1.75rem 2rem 2.25rem;
  background: #f8fafc;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`

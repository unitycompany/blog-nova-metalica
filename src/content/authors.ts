export type Author = {
  slug: string
  name: string
  bio: string
  avatar_url?: string
  email?: string
  twitter?: string
  linkedin?: string
  website?: string
  credentials?: string
}

export const authors: Readonly<Author[]> = [
  {
    slug: 'admin',
    name: 'Administrador',
    bio: 'Equipe editorial do Blog Nova Metálica',
    avatar_url: '',
    email: 'contato@novametalica.com.br',
    credentials: 'Especialista em construção civil'
  }
]

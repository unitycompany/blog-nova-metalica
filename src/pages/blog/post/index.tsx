import type { GetServerSideProps } from 'next'

export default function PostIndexRedirect() {
  return null
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/blog',
    permanent: false,
  },
})

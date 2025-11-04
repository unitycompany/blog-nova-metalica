import type { NextConfig } from "next";
import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import { withContentlayer } from 'next-contentlayer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const storageCdnUrl = process.env.SUPABASE_STORAGE_PUBLIC_URL

const remotePatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'www.novametalica.com.br',
    pathname: '/**'
  }
]

function appendRemotePattern(url: string | undefined) {
  if (!url) {
    return
  }

  try {
    const hostname = new URL(url).hostname
    if (!hostname) {
      return
    }

    const alreadyIncluded = remotePatterns.some((pattern) => pattern.hostname === hostname)

    if (!alreadyIncluded) {
      remotePatterns.push({
        protocol: 'https',
        hostname,
        pathname: '/storage/v1/object/public/**'
      })
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Não foi possível configurar o domínio do Supabase para imagens remotas.', error)
    }
  }
}

appendRemotePattern(storageCdnUrl)
appendRemotePattern(supabaseUrl)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns
  }
};

export default withContentlayer(nextConfig);
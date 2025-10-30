import type { AppProps } from "next/app";
import Providers from "@/app/providers";
import Layout from "@/app/layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Providers>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </>
    ) 
}

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="content-language" content="pt-BR" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta
          name="description"
          content="Blog Nova Metálica: conteúdos sobre construção a seco, steel frame e inovação na construção civil brasileira."
        />
        <meta
          name="keywords"
          content="Nova Metálica, blog, steel frame, construção a seco, construção civil, inovação, engenharia"
        />
        <meta name="author" content="Equipe Nova Metálica" />
        <meta name="creator" content="Nova Metálica" />
        <meta name="publisher" content="Nova Metálica" />
        <meta name="owner" content="Nova Metálica" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="bingbot" content="index,follow" />
        <meta name="language" content="pt-BR" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="application-name" content="Blog Nova Metálica" />
        <meta name="apple-mobile-web-app-title" content="Blog Nova Metálica" />
        <meta name="theme-color" content="#179CD7" />
        <meta name="msapplication-TileColor" content="#03060F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no,address=no,email=no" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="color-scheme" content="dark light" />
        <meta name="geo.region" content="BR-SP" />
        <meta name="geo.country" content="BR" />
        <meta name="geo.placename" content="São Paulo" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:url" content="https://blog.novametalica.com.br" />
        <meta property="og:site_name" content="Blog Nova Metálica" />
        <meta property="og:title" content="Blog Nova Metálica" />
        <meta
          property="og:description"
          content="Acompanhe notícias, insights e guias sobre steel frame, construção a seco e soluções metálicas."
        />
        <meta
          property="og:image"
          content="https://blog.novametalica.com.br/assets/logo/logotipo-nova-metalica-branca.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://blog.novametalica.com.br/assets/logo/logotipo-nova-metalica-branca.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Logotipo da Nova Metálica" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@novametalica" />
        <meta name="twitter:creator" content="@novametalica" />
        <meta name="twitter:title" content="Blog Nova Metálica" />
        <meta
          name="twitter:description"
          content="Conteúdo especializado sobre steel frame e construção a seco pela Nova Metálica."
        />
        <meta
          name="twitter:image"
          content="https://blog.novametalica.com.br/assets/logo/logotipo-nova-metalica-branca.png"
        />
        <meta name="twitter:image:alt" content="Logotipo da Nova Metálica" />
        <link rel="canonical" href="https://blog.novametalica.com.br" />
        <link rel="alternate" href="https://blog.novametalica.com.br" hrefLang="pt-BR" />
        <link rel="alternate" href="https://blog.novametalica.com.br" hrefLang="x-default" />
        <link rel="icon" href="/novametalica.ico" sizes="any" type="image/x-icon" />
        <link rel="shortcut icon" href="/novametalica.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/novametalica.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <title>Blog | Nova Metálica</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Nova Metálica',
              url: 'https://blog.novametalica.com.br',
              logo: 'https://blog.novametalica.com.br/assets/logo/logotipo-nova-metalica-branca.png',
              sameAs: [
                'https://www.facebook.com/people/Nova-Met%C3%A1lica/61564565333487/',
                'https://www.instagram.com/anovametalica/',
                'https://www.linkedin.com/in/novametalica'
              ]
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

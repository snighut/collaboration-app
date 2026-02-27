import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../components/AuthProvider'
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Nighutlabs | Prompts to System Design',
  description: 'Nighutlabs is an experimental AI-powered tool that transforms prompts into professional system design diagrams. Create architecture blueprints through natural language using cutting-edge LLM technology.',
  keywords: ['system design', 'architecture diagrams', 'AI design tool', 'prompts to diagram', 'Nighutlabs', 'visual design', 'LLM', 'software architecture'],
  authors: [{ name: 'Swapnil Nighut' }],
  openGraph: {
    title: 'Nighutlabs | Prommpts to System Design',
    description: 'Transform prompts into professional system design diagrams with AI-powered visual design technology.',
    url: 'https://nighutlabs.dev',
    siteName: 'Nighutlabs',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nighutlabs | Prompts to System Design',
    description: 'Transform prompts into professional system design diagrams with AI-powered visual design technology.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="canonical" href="https://nighutlabs.dev" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Nighutlabs',
              url: 'https://nighutlabs.dev',
              logo: 'https://nighutlabs.dev/favicon.png',
              description: 'An experimental AI-powered tool that transforms text based prompts into professional system design diagrams.',
              founder: {
                '@type': 'Person',
                name: 'Swapnil Nighut',
                jobTitle: 'Senior FullStack Software Engineer',
                email: 'sbnighut@gmail.com',
                sameAs: [
                  'https://github.com/snighut',
                  'https://linkedin.com/in/swapnilnighut'
                ]
              },
              sameAs: [
                'https://github.com/snighut'
              ],
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://nighutlabs.dev/design?id=new',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

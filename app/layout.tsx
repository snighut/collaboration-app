import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChronosCanvas',
  description: 'Collaborative timeline and canvas application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

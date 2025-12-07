import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RunbookForge - Transform Technical Procedures into Beautiful Runbooks',
  description: 'Create stunning, interactive technical runbooks in minutes. AI-powered. No coding required.',
  keywords: ['runbook', 'documentation', 'devops', 'sre', 'procedures', 'ai'],
  authors: [{ name: 'StepUpTech' }],
  openGraph: {
    title: 'RunbookForge - Transform Technical Procedures into Beautiful Runbooks',
    description: 'Create stunning, interactive technical runbooks in minutes. AI-powered. No coding required.',
    url: 'https://runbookforge.com',
    siteName: 'RunbookForge',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RunbookForge',
    description: 'Create stunning, interactive technical runbooks in minutes.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

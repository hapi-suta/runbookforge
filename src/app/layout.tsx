import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#14b8a6',
          colorBackground: '#0a0f1a',
          colorInputBackground: '#111827',
          colorInputText: '#f1f5f9',
        },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600',
          card: 'bg-slate-900 border border-slate-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-slate-400',
          socialButtonsBlockButton: 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700',
          formFieldLabel: 'text-slate-300',
          formFieldInput: 'bg-slate-800 border-slate-700 text-white',
          footerActionLink: 'text-teal-400 hover:text-teal-300',
        }
      }}
    >
      <html lang="en">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

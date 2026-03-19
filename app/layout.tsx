import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'DevZey Blog',
    template: '%s · DevZey Blog',
  },
  description: 'Developer-centric blog for DevZey.',
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="alternate" type="application/rss+xml" title="DevZey Blog RSS" href="/rss.xml" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="min-h-dvh">
          <header className="border-b border-slate-800/60">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <a href="/" className="font-semibold tracking-tight">
                DevZey
                <span className="text-slate-400"> Blog</span>
              </a>
              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <a href="/search" className="hover:text-white">
                  Search
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}


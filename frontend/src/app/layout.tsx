/**
 * Root Layout — Global provider for the EG Virtual Lab.
 *
 * Dual-font system:
 *   - Plus Jakarta Sans for headings (geometric, modern)
 *   - Inter for body text (supreme readability)
 */

import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'EG Virtual Lab — Interactive Engineering Graphics',
  description:
    'Master engineering graphics through interactive, step-by-step constructions. Curves, projections, solids — all visualized in real time.',
  keywords: ['engineering graphics', 'projections', 'solids', 'orthographic', 'virtual lab', 'interactive learning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}

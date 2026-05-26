// @ts-ignore: side-effect import for global CSS
import '../styles/globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NearHire | AI Hiring Platform',
  description: 'Multilingual hiring platform for candidates, employers, and admins.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

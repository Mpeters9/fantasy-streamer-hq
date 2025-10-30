import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fantasy Streamer HQ',
  description: 'Fantasy sports and matchup dashboard',
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; // ✅ prevents invalid object revalidate errors

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

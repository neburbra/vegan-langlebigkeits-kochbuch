import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veganes Langlebigkeits-Kochbuch',
  description: '108 wissenschaftlich fundierte vegane Rezepte für maximale Gesundheit und Langlebigkeit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BackHaul — Turn Empty Miles Into Earning Miles',
  description:
    'BackHaul is an open-source return-load logistics marketplace that helps truck owners find verified return loads and helps shippers find available trucks, using route-aware matching.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

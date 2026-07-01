import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BuyKaro - E-commerce Platform',
  description: 'Your trusted e-commerce platform for quality products',
};

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

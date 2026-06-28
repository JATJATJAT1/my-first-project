import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ShiftAI — 24/7 AI Sales Assistant',
  description: 'ShiftAI responds to every automotive lead within 60 seconds, 24/7.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import './globals.css';
import { Toaster as HotToaster } from 'react-hot-toast'; // Renamed to avoid conflict if any

export const metadata: Metadata = {
  title: 'PrepPal AI',
  description: 'Your ultimate AI companion for exam preparation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground"> {/* Added bg-background and text-foreground here */}
        {children}
        <HotToaster position="top-right" />
      </body>
    </html>
  );
}

    
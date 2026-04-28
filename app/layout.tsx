import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from './_components/AuthProvider';
import Navbar from './_components/Navbar';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Progress Visualizer | Assignment Tracker',
  description: 'A secure, macro-view dashboard to track and visualize CI/CD autograding logs directly from GitHub workflows.',
  keywords: ['GitHub Classroom', 'Autograding', 'CI/CD', 'Next.js', 'Progress Tracker'],
  authors: [{ name: 'Independent Engineer' }],
  openGraph: {
    title: 'Assignment Progress Visualizer',
    description: 'Track your GitHub Classroom assignment scores dynamically.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

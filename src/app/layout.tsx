import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from "sonner";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Explore 1,300+ careers through real stories from professionals. Compare careers, talk to advisors and take a self-assessment to find the right career for you.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lifepage.in"),
  title: {
    default: "LifePage – Find the Right Career",
    template: "%s | LifePage",
  },
  description,
  applicationName: "LifePage",
  openGraph: {
    type: "website",
    siteName: "LifePage",
    title: "LifePage – Find the Right Career",
    description,
  },
  twitter: {
    card: "summary",
    title: "LifePage – Find the Right Career",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
        <Toaster position="top-right" richColors />   
      </body>
    </html>
  );
}

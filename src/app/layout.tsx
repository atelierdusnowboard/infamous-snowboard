import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Infamous Snowboard | Less Noise. More Shapes.",
    template: "%s | Infamous Snowboard",
  },
  description:
    "Infamous Snowboard — handcrafted boards for riders who don't need a backstory. Less noise. More shapes.",
  keywords: ["snowboard", "snowboards", "infamous", "park", "freeride", "powder"],
  authors: [{ name: "Infamous Snowboard" }],
  creator: "Infamous Snowboard",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://infamous-snowboard.com",
    siteName: "Infamous Snowboard",
    title: "Infamous Snowboard | Less Noise. More Shapes.",
    description: "Handcrafted snowboards for riders who don't need a backstory.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Infamous Snowboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infamous Snowboard | Less Noise. More Shapes.",
    description: "Handcrafted snowboards for riders who don't need a backstory.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-black">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

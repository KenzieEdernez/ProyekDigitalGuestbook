import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  Cormorant_Garamond,
  Great_Vibes,
  Inter,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

const sloopScript = localFont({
  src: "../fonts/Sloop-ScriptThree.ttf",
  variable: "--font-sloop",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Invitation | EdernDigital",
  description:
    "Digital wedding invitation with RSVP, entry barcode ticket, and guest wishes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${greatVibes.variable} ${sloopScript.variable} min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

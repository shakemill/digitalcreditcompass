import type { Metadata } from "next";
import { Lato, DM_Mono, Syne } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-sans-app",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const syne = Syne({
  variable: "--font-heading-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono-app",
  subsets: ["latin"],
  weight: ["400"],
});

const siteName = "Digital Credit Compass";
const motto = "Clarity Before Yield";
const defaultDescription =
  "Digital Credit Compass (DCC) is an independent planning platform for Bitcoin-backed and stablecoin income. Model yield, stress-test scenarios, compare strategies, and generate reports with transparent risk—without selling your Bitcoin.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://digitalcreditcompass.com"),
  title: {
    default: `${siteName} | ${motto}`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "Digital Credit Compass",
    "DCC",
    "Bitcoin yield",
    "stablecoin income",
    "digital lending",
    "yield planning",
    "risk analysis",
    "income planning",
    "transparent risk",
    "Clarity Before Yield",
    "crypto yield",
    "yield intelligence",
    "scenario planning",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "en",
    siteName,
    title: `${siteName} | ${motto}`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${motto}`,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-surface-base">
      <body
        className={`${lato.variable} ${syne.variable} ${dmMono.variable} min-h-screen bg-surface-base font-sans text-text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { site } from "@/lib/data/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: `${site.name} - ${site.role}`,
  description: site.metaDescription,
  openGraph: {
    type: "website",
    title: `${site.name} - ${site.role}`,
    description: site.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="content-overlay">
          <div className="container">
            <Nav />
          </div>
          {children}
          <div className="container">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}

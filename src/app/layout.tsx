import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OKOUMÉ Store — High-tech au Gabon",
  description: "Smartphones, électronique et accessoires au Grand Libreville.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand/okoume-favicon.png",
    apple: "/brand/okoume-favicon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mihika's French Quest",
  description:
    "A Vercel-ready French learning game that turns Mihika's Grade 7 revision materials into spaced, memorable practice."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

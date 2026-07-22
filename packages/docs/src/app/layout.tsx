import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REID Documentation",
  description: "API documentation for REID - Reliable Email Infrastructure for Developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}

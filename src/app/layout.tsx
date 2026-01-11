import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Next.js Supabase Auth",
  description: "Authentication example with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-50">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

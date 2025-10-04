import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miami Watersports Dashboard",
  description: "Kiteboarding & wakeboarding conditions in Miami",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0D0221] text-white min-h-screen">{children}</body>
    </html>
  );
}

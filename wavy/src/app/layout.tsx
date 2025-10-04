import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WAVY Dashboard",
  description: "Live conditions for kitesurfing, wakeboarding, and surfing in Miami",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-sand text-brand-ocean min-h-screen antialiased">
        <header className="flex flex-col items-center py-6 space-y-3">
          <img src="/logo.png" alt="WAVY Logo" className="w-50 h-50" />
          <p className="text-brand-ocean/70 text-sm">
            Kiteboarding • Wakeboarding • Surf conditions
          </p>
        </header>
        <main className="max-w-6xl mx-auto px-6 pb-12">{children}</main>
      </body>
    </html>
  );
}

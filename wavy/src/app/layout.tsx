import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WAVY",
  description:
    "Live conditions for kitesurfing, wakeboarding, and surfing in Miami",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-sand text-ocean min-h-screen antialiased font-[Inter]">
        {/* The dashboard (sidebar + content) will render here */}
        {children}

        {/* Optional global footer */}
        <footer className="text-center text-xs text-ocean/60 py-4 border-t border-ocean/10">
          Built for water lovers in Miami 🌴 | Data from NOAA, NWS, Open-Meteo, SwimGuide
        </footer>
      </body>
    </html>
  );
}

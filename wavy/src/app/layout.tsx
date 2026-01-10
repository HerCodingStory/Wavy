import "./globals.css";
import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import { LocationProvider } from "@/contexts/LocationContext";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "WAVY - Miami Weather Conditions",
  description:
    "Live conditions for kitesurfing, wakeboarding, paddleboarding, and surfing in Miami",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#0D3B3B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WAVY",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-sand text-ocean min-h-screen antialiased font-[Inter]">
        <ThemeProvider>
          <ReduxProvider>
            <LocationProvider>
              {children}
            </LocationProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

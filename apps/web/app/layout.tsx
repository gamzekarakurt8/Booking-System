import type { Metadata } from "next";
import { DM_Serif_Display, Space_Grotesk } from "next/font/google";
import { ToastViewport } from "../components/ui/toast-viewport";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Booking System",
  description: "Full-stack booking app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} min-h-screen bg-dawn font-sans text-ink antialiased`}>
        <div className="page-atmosphere">
          {children}
          <ToastViewport />
        </div>
      </body>
    </html>
  );
}

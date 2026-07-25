import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CampaignHub",
  description: "Desktop email management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen overflow-hidden bg-background text-foreground antialiased`}
      >
        <ToastProvider>
          <div className="h-screen overflow-hidden">
            <Sidebar />
            <main className="h-screen overflow-y-auto pb-20 lg:pl-[18.5rem] lg:pb-0">
              <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

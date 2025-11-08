import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { UnlockNotificationProvider } from "@/components/UnlockNotificationProvider";

export const metadata: Metadata = {
  title: "Time Capsule - Preserve Your Digital Memories",
  description: "A modern platform to preserve digital memories, documents, and media in virtual capsules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className="antialiased min-h-screen">
        {/* Particle background effect */}
        <div className="particle-bg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        </div>
        
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <UnlockNotificationProvider>
          {children}
        </UnlockNotificationProvider>
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
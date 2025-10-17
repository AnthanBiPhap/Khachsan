import { Suspense } from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import ChatBubble from "@/components/ui/bubble-chat";
import AIChatBubble from "@/components/ui/ai-chat-bubble";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Miko Hotel - Đặt phòng khách sạn trực tuyến",
  description:
    "Trải nghiệm dịch vụ đẳng cấp tại Miko Hotel. Đặt phòng với giá ưu đãi, nhiều ưu đãi hấp dẫn.",
  keywords: ["khách sạn", "đặt phòng", "nghỉ dưỡng", "Miko Hotel", "du lịch"],
  authors: [{ name: "Miko Hotel Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable} min-h-screen`}
      >
        <AuthProvider>
          <Header />
          <main className="">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
          <ChatBubble />
          <AIChatBubble />

          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

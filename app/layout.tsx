// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import RealtimeProvider from "@/components/providers/RealtimeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SafeChat.AI",
  description: "AI-powered moderation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#F9FAFB] text-gray-800 flex items-center justify-center min-h-screen`}
      >
        <RealtimeProvider />
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}

// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";

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
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-[#0F172A] text-gray-100 min-h-screen flex flex-col`}
      >
        {/* === Brand Header === */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">
              S
            </div>
            <span className="text-lg font-semibold tracking-wide">
              SafeChat<span className="text-primary">.AI</span>
            </span>
          </div>
        </header>

        {/* === Page Content === */}
        <main className="flex flex-1 items-center justify-center px-6">
          {children}
        </main>

        {/* === Footer === */}
        <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-800">
          © {new Date().getFullYear()} SafeChat.AI — AI-Powered Moderation
        </footer>
      </body>
    </html>
  );
}

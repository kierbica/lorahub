import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser, isPro } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoraHub — AI Image Generation with LoRAs",
  description:
    "Generate stunning images with curated SDXL & Flux LoRAs. Free tier available, Pro unlocks premium styles.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const userIsPro = isPro(user);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
              <span className="text-accent">Lora</span>Hub
            </Link>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/generator" className="text-muted transition hover:text-foreground">
                Generator
              </Link>
              <Link href="/pricing" className="text-muted transition hover:text-foreground">
                Pricing
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-muted transition hover:text-foreground">
                    Dashboard
                  </Link>
                  {userIsPro && (
                    <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-light">
                      PRO
                    </span>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition hover:bg-accent/80"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} LoraHub. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

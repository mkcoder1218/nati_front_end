import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { TranslationProvider } from "@/lib/translation-context";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Negari - Government Service Feedback System",
  description:
    "Empowering citizens and local governments in Ethiopia through transparent communication",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <TranslationProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </TranslationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

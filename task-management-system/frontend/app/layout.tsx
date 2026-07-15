import type { Metadata } from "next";

import "./globals.css";

import ThemeProvider from "@/providers/ThemeProvider";

import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TaskPilot - Smart Task Management",

  description: "Collaborate, manage tasks and boost productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>

          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

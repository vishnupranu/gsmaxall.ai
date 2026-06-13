import type { Metadata } from "next";
import { ThemeProvider } from "@gsmaxall/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSMAXALL — AI Operating System",
  description: "One unified AI Operating System.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

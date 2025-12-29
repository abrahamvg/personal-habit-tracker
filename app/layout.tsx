import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "A minimal habit tracker with cool beige aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-beige-50 text-sand-900">
        {children}
      </body>
    </html>
  );
}

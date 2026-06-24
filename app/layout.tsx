import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "كومڤا — محادثاتك في مكان واحد",
  description: "منصة محادثات عربية بسيطة وآمنة.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}

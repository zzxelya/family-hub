import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Hub - 我们的家",
  description: "家人之间的沟通分享空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--background)] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

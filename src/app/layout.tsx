import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/assets/scss/styles.scss";
import { EnvProvider } from "@/lib/contexts/env-context";
import { ModalProvider } from "@/components/providers/modal-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Clean Starter - Clean Architecture",
  description: "Next.js starter with Clean Architecture and SOLID principles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* EnvProvider: 런타임 환경변수 로드 및 apiClient 초기화 */}
        <EnvProvider>
          {children}
          {/* Modal Provider: 전역 모달 관리 */}
          <ModalProvider />
        </EnvProvider>
      </body>
    </html>
  );
}

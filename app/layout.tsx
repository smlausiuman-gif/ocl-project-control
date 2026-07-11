import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCL 项目进度控制中心",
  description: "OCL 定型助剂自动输送系统双语项目进度、甘特图与看板。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title:"OCL 项目进度控制中心", description:"双语项目进度、甘特图与看板", images:["/og.png"] },
  twitter: { card:"summary_large_image", title:"OCL 项目进度控制中心", description:"双语项目进度、甘特图与看板", images:["/og.png"] },
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}

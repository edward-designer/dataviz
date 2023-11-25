import type { Metadata } from "next";
import { ReactNode } from "react";
import localFont from "next/font/local";

import Providers from "./providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Header from "@/components/Header";
import Toast from "@/components/Toast";

import { Advent_Pro, Roboto } from "next/font/google";

import "./globals.css";

const font = Advent_Pro({ subsets: ["latin"], variable: "--display-font" });
const font2 = Roboto({
  weight: "100",
  subsets: ["latin"],
  variable: "--digits-font",
});
const font3 = localFont({
  src: [
    {
      path: "../../public/fonts/Digital7Mono-Yz9J4.ttf",
      weight: "400",
    },
  ],
  variable: "--digital7-font",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Octoprice",
    default: "Octoprice | helping UK to select the cheapest energy tariffs",
  },
  description:
    "A free app to help Octopus Energy users to save energy bills by comparing and switching to the best tariffs.",
  keywords: [
    "Octopus Energy",
    "Tracker",
    "Agile",
    "Electricity Tariff",
    "Gas Tariffy",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title: "Octoprice | helping UK to select the cheapest energy tariffs",
    description:
      "A free app to help Octopus Energy users to save energy bills by comparing and switching to the best tariffs.",
    url: "https://octopriceuk.vercel.app/",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-preview.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#db1899" />
        <meta name="msapplication-TileColor" content="#0c2549" />
        <meta name="theme-color" content="#ffffff"></meta>
      </head>
      <html lang="en">
        <body
          className={`dark ${font.variable} ${font2.variable} ${font3.variable} bg-theme-950 text-white/80`}
        >
          <Toast>
            <ReactQueryDevtools initialIsOpen={false} />
            <div className="p-2 lg:p-0 lg:grid lg:grid-cols-[[fullwidth_start]_minmax(0,5%)_[breakout_start]_minmax(0,5%)_[content_start]_minmax(1000px,_1fr)_[content_end]_minmax(0,5%)_[breakout_end]_minmax(0,5%)_[fullwidth_end]]">
              <Header className="lg:col-[content]" />
              {children}
            </div>
          </Toast>
        </body>
      </html>
    </Providers>
  );
}

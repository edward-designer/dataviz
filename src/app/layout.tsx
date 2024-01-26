import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

import Providers from "./providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Header from "@/components/Header";
import Toast from "@/components/Toast";

import { Advent_Pro, Roboto } from "next/font/google";
import { IoMdHeart } from "react-icons/io";

import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const font = Advent_Pro({
  weight: ["100", "400", "700"],
  subsets: ["latin"],
  variable: "--display-font",
});
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

export const viewport: Viewport = {
  themeColor: "#ce2cb9",
  initialScale: 1,
  width: "device-width",
  maximumScale: 1,
};

export const metadata: Metadata = {
  applicationName: "Octoprice",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Octoprice",
    // startUpImage: [],
  },
  title: {
    template: "%s | Octoprice",
    default: "Octoprice",
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
      </head>
      <html lang="en">
        <body
          className={`dark ${font.variable} ${font2.variable} ${font3.variable} bg-theme-950 text-white/80`}
        >
          <Toast>
            <ReactQueryDevtools initialIsOpen={false} />
            <div className="min-h-screen p-4 lg:grid grid-rows-[100px_1fr_160px] lg:py-0 lg:p-0 lg:grid-cols-[[fullwidth_start]_minmax(0,5%)_[breakout_start]_minmax(0,5%)_[content_start]_minmax(1000px,_1fr)_[content_end]_minmax(0,5%)_[breakout_end]_minmax(0,5%)_[fullwidth_end]]">
              <Header className="lg:col-[content]" />
              {children}
              <Analytics />
              <GoogleAnalytics ga_id="G-NQX4NLSBPE" />
              <footer className="lg:col-[content] text-sm font-light text-white/60 mt-16">
                &copy; {new Date().getFullYear()} Octoprice. Made with{" "}
                {<IoMdHeart className="w-4 h-4 inline-block" />} by{" "}
                <a href="https://edward-designer.github.io/" target="_blank">
                  Edward
                </a>
                . This app does not collect personal information. <br />
                Your Octopus info is stored on your browser only for retrieving
                pricing and consumption data. <br />
                <span className="text-accentBlue-500">
                  <em>[ver 2024.1.26]</em> Bugs report & enquiries:{" "}
                  <a
                    href="mailto:edward.chung.dev@gmail.com"
                    className="underline"
                  >
                    edward.chung.dev@gmail.com
                  </a>
                </span>
              </footer>
            </div>
          </Toast>
        </body>
      </html>
    </Providers>
  );
}

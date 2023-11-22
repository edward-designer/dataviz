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
  title: "Octoprice",
  description:
    "A free app to help Octopus Energy users to save energy bills by comparing and switching to the best tariffs.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
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

import TrackerTariff from "@/components/octopus/TrackerTariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octopus Tracker Plan Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Tracker Plan, with graphs showing the price trends and price differences all over UK.",
  keywords: ["Octopus Energy", "Tracker", "Electricity Tariff", "Gas Tariffy"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title: "Octopus Tracker Plan Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Tracker Plan, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.vercel.app/tracker",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-tracker.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Tracker = () => {
  return <TrackerTariff />;
};

export default Tracker;

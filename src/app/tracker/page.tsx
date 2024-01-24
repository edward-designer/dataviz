import TrackerTariff from "@/components/octopus/TrackerTariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octopus Tracker Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Tracker Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: ["Octopus Energy", "Tracker", "Electricity Tariff", "Gas Tariff"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/tracker`,
  },
  openGraph: {
    title:
      "Octopus Tracker Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Tracker Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/tracker",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-tracker.jpg",
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

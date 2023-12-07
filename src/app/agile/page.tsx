import AgileTariff from "@/components/octopus/AgileTariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octopus Agile Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Agile Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: ["Octopus Energy", "Agile", "Electricity Tariff", "Gas Tariffy"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title: "Octopus Agile Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Agile Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.vercel.app/agile",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-agile.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Agile = () => {
  return <AgileTariff />;
};

export default Agile;

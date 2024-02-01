import CosyTariff from "@/components/octopus/CosyTariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octopus Cosy Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Cosy Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: ["Octopus Energy", "Cosy", "Electricity Tariff", "Gas Tariff"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/cosy`,
  },
  openGraph: {
    title: "Octopus Cosy Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Cosy Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/go",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-preview.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const Cosy = () => {
  return <CosyTariff />;
};

export default Cosy;

import IFluxTariff from "@/components/octopus/IFluxTariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Octopus Intelligent Flux Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Intelligent Flux Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: [
    "Octopus Energy",
    "Intelligent Flux",
    "Electricity Tariff",
    "Gas Tariff",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/iflux`,
  },
  openGraph: {
    title:
      "Octopus Intelligent Flux Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Intelligent Flux Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/iflux",
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

const IFlux = () => {
  return <IFluxTariff />;
};

export default IFlux;

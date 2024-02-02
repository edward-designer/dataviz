import AgileOutgoingTariff from "@/components/octopus/AgileOutgoingTariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Octopus Agile Outgoing Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Agile Outgoing Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: [
    "Octopus Energy",
    "Agile Outgoing",
    "Electricity Tariff",
    "Gas Tariff",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/agileOutgoing`,
  },
  openGraph: {
    title:
      "Octopus Agile Outgoing Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Agile Outgoing Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/agileOutgoing",
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

const AgileOutgoing = () => {
  return <AgileOutgoingTariff />;
};

export default AgileOutgoing;

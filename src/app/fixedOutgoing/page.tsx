import React from "react";

import { Metadata } from "next";
import FixedOutgoingTariff from "@/components/octopus/FixedOutgoingTariff";
import FixedOutgoingLiteTariff from "@/components/octopus/FixedOutgoingLiteTariff";

export const metadata: Metadata = {
  title:
    "Octopus Fixed Outgoing Tariff Unit Rates for Today and Tomorrow | Octoprice",
  description:
    "Get the latest unit rates for gas and electicity on the Octopus Fixed Outgoing Tariff, with graphs showing the price trends and price differences all over UK.",
  keywords: [
    "Octopus Energy",
    "Fixed Outgoing",
    "Export",
    "Electricity Tariff",
    "Gas Tariff",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/fixedOutgoing`,
  },
  openGraph: {
    title:
      "Octopus Fixed Outgoing Tariff Unit Rates for Today and Tomorrow | Octoprice",
    description:
      "Get the latest unit rates for gas and electicity on the Octopus Fixed Outgoing Tariff, with graphs showing the price trends and price differences all over UK.",
    url: "https://octopriceuk.app/fixedOutgoing",
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

const FixedOutgoing = () => {
  return (
    <div className="lg:col-[content] my-4">
      <FixedOutgoingTariff />
      <hr className="my-8 py-8 border-t-4 border-dotted border-theme-800"/>
      <FixedOutgoingLiteTariff />
    </div>
  );
};

export default FixedOutgoing;

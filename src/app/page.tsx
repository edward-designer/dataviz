import Octopus3d from "@/components/octopus/Octopus3d";

import EnergyPriceCard from "../components/octopus/EnergyPriceCard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FREE Octopus Energy Tariff Info and Tools | Octoprice",
  description:
    "Compare and select the best Octopus Energy electicity and gas tariffs (for Android and iPhone users)",
  keywords: [
    "Octopus Energy",
    "Intelligent Tariff",
    "Electricity",
    "Gas",
    "Smart Tariff",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/`,
  },
  openGraph: {
    title: "FREE Octopus Energy Tariff Info and Tools | Octoprice",
    description:
      "Compare and select the best Octopus Energy electicity and gas tariffs (for Android and iPhone users)",
    url: "https://octopriceuk.app/",
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

const Home = () => {
  return (
    <div className="lg:col-[content] my-4 flex justify-start items-center relative z-0">
      <div className="max-w-full w-full md:w-[75%] min-w-[300px] z-10 mt-20 lg:mt-0 mb-20">
        <div className="lg:pl-6 lg:translate-y-3 text-sm font-extralight mb-1">
          Help you compare and select the BEST Octopus Energy electicity, gas and export tariffs
          for both Android and iPhone users.
          <br />
          <strong className="font-bold">
            Today&apos;s Cheapest Energy Prices:
          </strong>
        </div>
        <div className="flex gap-2 lg:p-4 flex-col lg:flex-row flex-wrap">
          <EnergyPriceCard type="E" plan="agile" />
          <EnergyPriceCard type="E" plan="tracker" />
          <EnergyPriceCard type="G" plan="tracker" />
        </div>
      </div>
      <Octopus3d />
    </div>
  );
};

export default Home;

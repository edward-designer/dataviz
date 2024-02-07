import EnergyShiftSim from "@/components/octopus/EnergyShiftSim";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Advanced Energy Shift Simulator to Maximize Electricity Savings | Octoprice",
  description:
    "Play with this advanced tool to visualize how much money you can save by shifting your energy use pattern.",
  keywords: [
    "Octopus Energy",
    "Compare Tariffs",
    "Electricity",
    "Gas",
    "Cheapest",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/maxSave`,
  },
  openGraph: {
    title:
      "Advanced Energy Shift Simulator to Maximize Electricity Savings | Octoprice",
    description:
      "Play with this advanced tool to visualize how much money you can save by shifting your energy use pattern.",
    url: "https://octopriceuk.app/maxSave",
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

const MaxSave = () => {
  return (
    <div className="lg:col-[content] my-4">
      <EnergyShiftSim />
    </div>
  );
};

export default MaxSave;

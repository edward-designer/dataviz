import MissingDataTool from "@/components/octopus/MissingDataTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Missing Smart Meter Data Checker | Octoprice",
  description:
    "Smart meters are as good as they are working properly. Use this tool to monitor whether Octopus has retrieved all your meter data and whether your smart meter is working properly.",
  keywords: [
    "Octopus Energy",
    "Compare Tariffs",
    "Hop Tariffs",
    "Tariff Hopping",
    "Tool",
    "Electricity",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/missingData`,
  },
  openGraph: {
    title: "Missing Smart Meter Data Checker | Octoprice",
    description:
      "Smart meters are as good as they are working properly. Use this tool to monitor whether Octopus has retrieved all your meter data and whether your smart meter is working properly.",
    url: "https://octopriceuk.app/missingData",
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

const MissingData = () => {
  return (
    <div className="lg:col-[content] my-4">
      <MissingDataTool />
    </div>
  );
};

export default MissingData;

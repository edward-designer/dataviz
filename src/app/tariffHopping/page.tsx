import TariffHoppingTool from "@/components/octopus/TariffHoppingTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get the Best Time to Hop Octopus Smart Tariffs | Octoprice",
  description:
    "The missing tool to help you tariff hopping between various Octopus smart tariffs (in particular Flux) during the year!",
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
    canonical: `/tariffHopping`,
  },
  openGraph: {
    title: "Get the Best Time to Hop Octopus Smart Tariffs | Octoprice",
    description:
      "The missing tool to help you tariff hopping between various Octopus smart tariffs (in particular Flux) during the year!",
    url: "https://octopriceuk.app/tariffHopping",
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

const TariffHopping = () => {
  return (
    <div className="lg:col-[content] my-4">
      <TariffHoppingTool />
    </div>
  );
};

export default TariffHopping;

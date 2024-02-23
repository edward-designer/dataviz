import PriceCapContainer from "@/components/octopus/PriceCapContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Ofgem Electricity and Gas Price Cap Change | Octoprice",
  description:
    "Get the details of how your actual energy price caps change over time, not just a vague anuual figure from Ofgem.",
  keywords: [
    "Ofgem Price Cap Change",
    "Regional Price Cap Change",
    "Electricity",
    "Gas",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/priceCap`,
  },
  openGraph: {
    title: "Old vs New Tracker Prices | Octoprice",
    description:
      "Get the details of how your actual energy price caps change over time, not just a vague anuual figure from Ofgem.",
    url: "https://octopriceuk.app/priceCap",
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

const PriceCap = () => {
  return (
    <div className="lg:col-[content] my-4">
      <PriceCapContainer />
    </div>
  );
};

export default PriceCap;

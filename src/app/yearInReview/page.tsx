import YearInReviewContainer from "@/components/octopus/YearInReviewContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Energy Consumption Data Visualization Art | Octoprice",
  description: "A data visualization of energy consumption in the past year",
  keywords: ["Octopus Energy", "Energy Consumption"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/yearInReview`,
  },
  openGraph: {
    title: "My Energy Consumption Data Visualization Art | Octoprice",
    description: "A data visualization of energy consumption in the past year",
    url: "https://octopriceuk.app/yearInReview",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-yearInReview.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const YearInReivew = () => {
  return (
    <div className="lg:col-[content] my-4 flex flex-col gap-6 text-lg">
      <YearInReviewContainer />
    </div>
  );
};

export default YearInReivew;

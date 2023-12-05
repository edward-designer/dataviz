import { Metadata } from "next";
import signature from "../../../public/sign.svg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Octoprice",
  description:
    "Octoprice does not collect your personal information. All info entered remains in your browser.",
  keywords: ["Octopus Energy", "Data Privacy", "About"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title: "About | Octoprice",
    description:
      "Octoprice does not collect your personal information. All info entered remains in your browser.",
    url: "https://octopriceuk.vercel.app/about",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-about.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const About = () => {
  return (
    <div className="lg:col-[content] my-4 flex flex-col gap-6 text-lg">
      <h1 className="text-accentBlue-400 font-display text-6xl">Hello!</h1>
      <p>
        <a
          className="text-accentPink-600 hover:text-accentBlue-600"
          href="https://edward-designer.github.io/"
          target="_blank"
        >
          I am Edward - frontend web developer and designer.
        </a>{" "}
        Nice to meet you!
      </p>
      <p>
        Like you, I am an Octopus energy user. I just love the intelligent
        tariffs and the savings Octopus is bringing. I keep thinking is there
        anything I can make it any better with my skillsets.
      </p>
      <p>
        The Octoprice app is my two cents to help dear Octopus users who would
        want an easier and visually more pleasant way to get the latest unit
        rates to plan ahead for our energy uses for greater savings on energy
        costs.
      </p>
      <p>I do hope you find this app useful.</p>
      <p>
        All the data are obtained direclty from the Octopus API to allow timely
        and accurate updates. But while I have diligently checked and tested the
        app and data to be accurate and correct, all information on this website
        is for references only. By using this app, you agree to take all
        responsibility for your actions based on the information provided here.
      </p>

      <p>ENJOY!</p>
      <Image src={signature} alt="signature of Edward" className="w-60" />

      <p className="mt-10 pt-4 border-t border-t-accentPink-600 border-dotted text-xs">
        <span className="font-bold">A word about personal privacy:</span> This
        app doesn&apos;t collect any personal information as all your
        information entered are available within your browser only (with
        localstorage) and is used to directly communicate with Octopus server.
        You can browse the{" "}
        <a href="https://github.com/edward-designer/dataviz" target="_blank">
          source code
        </a>{" "}
        of this app on Github to confirm this.
      </p>
      <p className="text-xs">
        And this app has no direct association with Octopus Energy except it is
        using thg data Octopus is providing.
      </p>
    </div>
  );
};

export default About;

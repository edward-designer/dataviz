import { Metadata } from "next";
import signature from "../../../public/sign.svg";
import Image from "next/image";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { TbSunElectricity } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";
import { FiAlertTriangle } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Octopus Tariff Selector and Requirements | Octoprice",
  description:
    "All of Octopus energy tariffs at a glance - get to know which tariff is best to you!",
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
    canonical: `/tariffs`,
  },
  openGraph: {
    title: "Octopus Tariff Selector and Requirements | Octoprice",
    description:
      "All of Octopus energy tariffs at a glance - get to know which tariff is best to you!",
    url: "https://octopriceuk.app/tariffs",
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

const About = () => {
  const tick = <GrStatusGood className="w-8 h-8 text-[#85f9ad]" />;
  const cross = <RxCross2 className="w-8 h-8 text-[#f985c5]" />;

  return (
    <div className="lg:col-[content] my-4">
      <div className="flex flex-col font-extralight text-lg">
        <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
          Octopus Tariffs at a Glance
        </h1>
        <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
          - help you pick Octopus Energy tariffs giving you best value
        </h2>
        <h3 className="flex font-display text-3xl text-accentBlue-500 mb-2">
          <TbSunElectricity className="w-8 h-8 text-accentBlue-700 inline-block mr-2" />
          Electricity and Solar Generation
        </h3>
        <p className="text-base my-4">
          In addition to the standard flexible (SVT), Economy-7 and fixed
          electicity tariffs, Octopus Energy innovates a lot of smart and
          intelligent tariffs, while some are experimental in nature but most of
          these innovative tariffs provide exceptional values. The following
          table summarizes the various electricity import and export tariffs and
          their requirements.
        </p>
        <table className="my-2">
          <tbody>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16">
              <td></td>
              <td>
                <a
                  target="_blank"
                  href="/agileOutgoing"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Agile Outgoing
                </a>
              </td>
              <td>
                <a
                  target="_blank"
                  href="/flux"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Octopus Flux
                </a>
              </td>
              <td>
                <a
                  target="_blank"
                  href="/iflux"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Intelligent Octopus Flux
                </a>
              </td>
              <td>
                <a
                  target="_blank"
                  href="/fixedOutgoing"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Fixed Outgoing
                </a>
              </td>
              <td>
                <a
                  target="_blank"
                  href="/fixedOutgoing"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Fixed Outgoing Lite
                </a>
              </td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/agile"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Agile Import
                </a>
              </td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/tracker"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Tracker Import
                </a>
              </td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/variable"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Flexible Import
                </a>
              </td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/fixed"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Fixed Import
                  <span className="flex text-xs text-theme-300 gap-1 items-center">
                    <FiAlertTriangle className="w-3 h-3 min-w-3 shrink-0 text-yellow-500" />
                    NO exit fee from Feb 2024
                  </span>
                </a>
              </td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/flux"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Octopus Flux
                  <span className="flex text-xs text-theme-300 gap-1 items-center">
                    <FiAlertTriangle className="w-3 h-3 min-w-3 shrink-0 text-yellow-500" />
                    solar battery system
                  </span>
                </a>
              </td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/flux"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Intelligent Flux
                  <span className="flex text-xs text-theme-300 gap-1 items-center">
                    <FiAlertTriangle className="w-3 h-3 min-w-3 shrink-0 text-yellow-500" />
                    compatible solar + battery
                  </span>
                </a>
              </td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/go"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Octopus Go
                  <span className="flex text-xs text-theme-300 gap-1 items-center">
                    <FiAlertTriangle className="w-3 h-3 min-w-3 shrink-0 text-yellow-500" />
                    EV and charger
                  </span>
                </a>
              </td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/igo"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Intelligent Go
                  <span className="flex text-xs text-theme-300 gap-1 items-center">
                    <FiAlertTriangle className="w-3 h-3 min-w-3 shrink-0 text-yellow-500" />
                    compatible EV and charger
                  </span>
                </a>
              </td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
            </tr>
            <tr className="flex [&>td]:flex-1 [&>td]:p-1 [&>td]:py-4 [&>td]:flex [&>td]:leading-tight [&>td]:text-center [&>td]:items-center [&>td]:justify-center [&>td]:min-h-16 divide-x divide-y divide-theme-700 divide-dashed">
              <td>
                <a
                  target="_blank"
                  href="/cosy"
                  className=" text-accentPink-500 hover:text-accentBlue-500"
                >
                  Octopus Cosy{" "}
                  <span className="flex text-xs text-theme-300 gap-1 items-center">
                    <FiAlertTriangle className="w-3 h-3 min-w-3 shrink-0 text-yellow-500" />
                    heat pump
                  </span>
                </a>
              </td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
              <td>{cross}</td>
              <td className="bg-theme-900">{tick}</td>
              <td>{cross}</td>
            </tr>
          </tbody>
        </table>
        <h3 className="flex font-display text-3xl text-accentPink-500 mt-8 mb-2 pt-6 border-dotted border-t-4 border-t-accentBlue-800">
          <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
          Gas
        </h3>
        <p className="text-base my-4">
          Gas tariffs are a bit less intelligent than electricity. In addition
          to the{" "}
          <a
            target="_blank"
            href="/variable"
            className="text-xl text-accentPink-500 hover:text-accentBlue-500"
          >
            standard flexible (SVT)
          </a>{" "}
          and{" "}
          <a
            target="_blank"
            href="/fixed"
            className="text-xl text-accentPink-500 hover:text-accentBlue-500"
          >
            fixed
          </a>{" "}
          gas tariffs, Octopus Energy also offers the{" "}
          <a
            target="_blank"
            href="/tracker"
            className="text-xl text-accentPink-500 hover:text-accentBlue-500"
          >
            tracker
          </a>{" "}
          tariff which follows the rise and drop of wholesale gas price.
        </p>
      </div>
    </div>
  );
};

export default About;

import { Metadata } from "next";
import appScreen from "../../../public/images/install-octoprice.jpg";
import appShareChrome from "../../../public/images/add-share-chrome.jpg";
import appShareSafari from "../../../public/images/add-share-safari.jpg";
import appShareAddHome from "../../../public/images/add-home.jpg";
import appShareAdd from "../../../public/images/add-add.jpg";
import Image from "next/image";

import { RxShare2 } from "react-icons/rx";
import { VscDiffAdded } from "react-icons/vsc";
import Remark from "@/components/octopus/Remark";

export const metadata: Metadata = {
  title: "Install App | Octoprice",
  description:
    "Octoprice App can be installed on mobile devices. Please follow the instructions.",
  keywords: ["Octopus Energy", "App Download", "App Installation"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.vercel.app/"),
  openGraph: {
    title: "Install App | Octoprice",
    description:
      "Octoprice App can be installed on mobile devices. Please follow the instructions.",
    url: "https://octopriceuk.vercel.app/install",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.vercel.app/octoprice-install.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};
const Install = () => {
  return (
    <div className="lg:col-[content] my-4 flex flex-col gap-6 text-lg">
      <h1 className="text-accentBlue-400 font-display text-6xl">
        Install Octoprice App
      </h1>
      <p>
        Ocotoprice can also be installed as a standalone app on most mobile
        devices for best experiences. Simply follow the steps:
      </p>
      <div className="flex flex-wrap flex-col md:flex-row md:justify-between justify-center items-center md:items-start gap-4">
        <ol className="list-decimal ml-6 [&>*]:py-2">
          <li>
            Open{" "}
            <a
              href="https://octopriceuk.vercel.app"
              className="underline text-accentPink-500 hover:no-underline"
              target="_blank"
            >
              Octoprice App
            </a>{" "}
            in a mobile internet browser (e.g. Chrome, Safari)
          </li>
          <li>
            Tap{" "}
            <strong className="text-accentBlue-500">
              Share
              <RxShare2 className="inline-block px-1 w-8 h-8" />
              <Remark variant="badge">
                <div className=" max-h-[300px] overflow-y-auto m-0 p-0">
                  In Google Chrome:
                  <Image
                    src={appShareChrome}
                    alt="the share button on Google Chrome"
                    className="w-full block py-4 mb-4 border-b border-accentBlue-900"
                  />
                  In mobile Safari:
                  <Image
                    src={appShareSafari}
                    alt="the share button on mobile Safari"
                    className="w-full block py-4"
                  />
                </div>
              </Remark>
            </strong>
          </li>
          <li>
            Scroll down to tap{" "}
            <strong className="text-accentBlue-500">
              Add to Home Screen
              <VscDiffAdded className="inline-block px-1 w-8 h-8" />
              <Remark variant="badge">
                <div className=" max-h-[300px] overflow-y-auto m-0 p-0">
                  <Image
                    src={appShareAddHome}
                    alt="add to Home Screen button"
                    className="w-full block py-4 mb-4"
                  />
                </div>
              </Remark>
            </strong>
          </li>
          <li>
            Tap <strong className="text-accentBlue-500">Add</strong>
            <Remark variant="badge">
              <div className=" max-h-[300px] overflow-y-auto m-0 p-0">
                <Image
                  src={appShareAdd}
                  alt="confirm to add to Home Screen button"
                  className="w-full block py-4 mb-4"
                />
              </div>
            </Remark>{" "}
            to install Octoprice on your mobile
          </li>
        </ol>
        <Image
          src={appScreen}
          alt="adding Octoprice to mobile homescreen"
          className="w-60"
        />
      </div>
    </div>
  );
};

export default Install;

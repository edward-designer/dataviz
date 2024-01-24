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
    "Octoprice App can be installed on mobile devices for best experiences.",
  keywords: ["Octopus Energy", "App Download", "App Installation"],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  openGraph: {
    title: "Install App | Octoprice",
    description:
      "Octoprice App can be installed on mobile devices for best experiences.",
    url: "https://octopriceuk.app/install",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-install.jpg",
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
        Install Octoprice
      </h1>
      <p>
        Octoprice App can be installed as an app on most mobile devices for best
        experiences.
      </p>
      <div className="flex flex-wrap flex-col md:flex-row md:justify-between justify-center items-center md:items-start gap-4">
        <ol className="list-decimal ml-6 [&>*]:py-2">
          <li>
            Open{" "}
            <a
              href="https://octopriceuk.app"
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
              <Remark>
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
              </Remark>
            </strong>
          </li>
          <li>
            Scroll down to tap{" "}
            <strong className="text-accentBlue-500">
              Add to Home Screen
              <VscDiffAdded className="inline-block px-1 w-8 h-8" />
              <Remark>
                Add to Home Screen button:
                <Image
                  src={appShareAddHome}
                  alt="add to Home Screen button"
                  className="w-full block py-4 mb-4"
                />
              </Remark>
            </strong>
          </li>
          <li>
            Tap <strong className="text-accentBlue-500">Add</strong>
            <Remark>
              Add the App:
              <Image
                src={appShareAdd}
                alt="confirm to add to Home Screen button"
                className="w-full block py-4 mb-4"
              />
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

import { Metadata } from "next";

import LottieIcon from "@/components/octopus/LottieIcon";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "How can the FREE Octoprice App help cutting your energy bill? | Octoprice",
  description:
    "An overview of how Octopus Energy users can make use the FREE innovative tools offered by the Octoprice App to compare and switch electricity and gas tariffs to trim down on their spending.",
  keywords: [
    "Octopus Energy",
    "Octoprice App",
    "Free tools",
    "Compare tariffs",
    "Switch tariffs",
  ],
  authors: [
    { name: "Edward Chung", url: "https://edward-designer.github.io/" },
  ],
  metadataBase: new URL("https://octopriceuk.app/"),
  alternates: {
    canonical: `/whyOctoprice`,
  },
  openGraph: {
    title:
      "How can the FREE Octoprice App help cutting your energy bill? | Octoprice",
    description:
      "An overview of how Octopus Energy users can make use the FREE innovative tools offered by the Octoprice App to compare and switch electricity and gas tariffs to trim down on their spending.",
    url: "https://octopriceuk.app/whyOctoprice",
    siteName: "Octoprice App",
    images: [
      {
        url: "https://octopriceuk.app/octoprice-about.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_UK",
    type: "website",
  },
};

const WhyOctoprice = () => {
  return (
    <div className="lg:col-[content] my-4 flex flex-col gap-6 text-base font-light">
      <h1 className="text-accentBlue-400 font-display text-4xl md:text-6xl leading-tight">
        Free Innovative Tools to Help Cutting Energy Bills
        <span className="block text-xl">
          For prospective and current Octopus Energy users
        </span>
      </h1>
      <LottieIcon icon="tool" loop={true} />
      <p>
        Unlike major energy providers in the UK which provides only traditional
        energy tariffs (with so few to choose from), Ocotpus Energy offers{" "}
        <strong>a lot of</strong> smart and intelligent energy tariffs both for
        electricity and gas. In fact, currently, there are over{" "}
        <Link href="/tariffs">
          a dozen of tariffs for prospective and current Octopus Energy users
        </Link>{" "}
        to choose from!
      </p>
      <p className="text-xl italic">
        The multi-million question now is:{" "}
        <strong>which tariff is the cheapest or more beneficial to me?</strong>
      </p>
      <p>
        Unfortunately, Octopus Energy itself cannot or would not offer a
        satisfactory answer to this (maybe owing to a conflict of interest - it
        earns more when you pay more...). And that is the very reason why this
        Octoprice App comes into existence (by the way, this website can
        actually be &quot;
        <Link href="/install" target="_blank">
          installed
        </Link>
        &quot; as if it is an &quot;app&quot;, technically also known as a
        &quot;Progressive Web App&quot;, so this post from now on will refer
        this website as &quot;the App&quot;)!
      </p>
      <p>
        This Octoprice App provides a number of innovative tools that can help
        prospective and current Octopus Energy users to compare, choose and
        switch the optimal tariffs at the optimal time to save the most.
      </p>
      <h2 className="font-display text-2xl text-accentPink-500 font-semibold">
        Free Innovative Tools in the Octoprice App
      </h2>
      <p>
        Below is a list of the tools currently available on the Octoprice App
        and their short descriptions:
      </p>
      <h3 className="font-display text-xl font-semibold text-accentBlue-500">
        For Everyone
      </h3>
      <ul className="list-disc ml-4">
        <li>
          <strong className="font-extrabold">Tariff Pages</strong> - offersing
          real-time and historical tariff price data and charts for most Octopus
          Energy tariffs including electricity (import and export) and gas
          tariffs, e.g.{" "}
          <Link
            href="/tracker"
            target="_blank"
            className="underline text-accentPink-500 hover:no-underline hover:text-accentBlue-500"
          >
            Tracker prices
          </Link>
          ,{" "}
          <Link
            href="/agile"
            target="_blank"
            className="underline text-accentPink-500 hover:no-underline hover:text-accentBlue-500"
          >
            Agile prices
          </Link>
        </li>
        <li>
          <Link
            href="/tariffs"
            target="_blank"
            className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            Tariffs at a Glance
          </Link>{" "}
          - a table to instantly understand which tariffs are available and
          applicable to you
        </li>
        <li>
          <Link
            href="/priceCap"
            target="_blank"
            className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            National Ofgem Price Caps
          </Link>{" "}
          - currently and upcoming Ofgem energy price caps changes around the UK
        </li>
      </ul>
      <div className="py-6 px-2 border-t-4 border-b-4 border-dotted border-theme-800">
        <h3 className="relative mb-3 text-theme-300 font-display text-lg font-semibold pl-6 before:block before:w-2 before:h-6 before:bg-accentPink-500 before:top-1 before:left-0 before:absolute before:-skew-x-12">
          Get &pound;50 Sign Up Bonus with Our Referral Link
        </h3>
        <p>
          If you signs up through{" "}
          <a
            className="underline text-accentPink-500 hover:no-underline hover:text-accentBlue-500"
            href="https://share.octopus.energy/sky-heron-134"
            target="_blank"
          >
            our exclusive referral link
          </a>
          , you will get an extra &pound;50 Sign Up Bonus to pay for your bills!
          There is absolutely no costs or downside to you. It is just exactly as
          if you go to Octopus website and sign up there directly.
        </p>
        <p className="mt-4">
          For complete transparency, if you sign up through my refer link to
          Octopus Energy, I will also earn &pound;50 which would contribute to
          the ongoing development and regular maintenance of this website. This
          website has an annual running cost of over &pound;100 and I have
          personally spent over 600 hours of my time on the continual
          development of this website and tools.
        </p>
      </div>
      <h3 className="font-display text-xl font-semibold text-accentBlue-500">
        For Current Octopus Energy Users
      </h3>
      <p>
        <span className="text-accentBlue-700 italic">
          [Worry not if you are a prospective user researching at the moment, I
          have also included a &quot;Trial Mode&quot; for you to try and see how
          things work without the need of any info to be provided by you! Simply
          click on the links below and click on the &quot;Try it out&quot;
          button!]
        </span>
        &nbsp;You will need an API key and your Octopus account number to unlock
        the full functions of these tools.
      </p>
      <ul className="list-disc ml-4">
        <li>
          <strong className="font-extrabold">Tariff Pages</strong> - offersing
          real-time and historical tariff price data and charts for most Octopus
          Energy tariffs including electricity (import and export) and gas
          tariffs, e.g.{" "}
          <Link
            href="/tracker"
            target="_blank"
            className="underline text-accentPink-500 hover:no-underline hover:text-accentBlue-500"
          >
            Tracker prices
          </Link>
          ,{" "}
          <Link
            href="/agile"
            target="_blank"
            className="underline text-accentPink-500 hover:no-underline hover:text-accentBlue-500"
          >
            Agile prices
          </Link>
        </li>
        <li>
          <Link
            href="/tariffs"
            target="_blank"
            className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            Tariffs at a Glance
          </Link>{" "}
          - a table to instantly understand which tariffs are available and
          applicable to you
        </li>
        <li>
          <Link
            href="/priceCap"
            target="_blank"
            className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            National Ofgem Price Caps
          </Link>{" "}
          - currently and upcoming Ofgem energy price caps changes around the UK
        </li>
      </ul>
      <h2 className="font-display text-2xl text-accentPink-500 font-semibold">
        What is the Catch?
      </h2>
      <p>
        I can promise there is on catch. All your personal information is stored
        on your device (i.e. phone or computer) ONLY. I have absolutely NO
        access to your data. All your account and consumption data passes
        between your browser and Octopus Energy server only. And if you
        encounter any errors while using this website, I will need to ask your
        API key and account number in order to debug it.
      </p>
      <p>
        I have even decided to open-sourced my source code so that if you know
        about web development (in particular React), you can check if I have
        planted any malicious code in it.
      </p>
      <p>
        This project starts out as a showcase of my development skills to
        prospective employers but it has grown rapidly in popularity among
        Octopus Energy users. And yes, I am a Octopus Energy user too!
      </p>
      <h2 className="font-display text-2xl text-accentPink-500 font-semibold"></h2>
      <p></p>
    </div>
  );
};

export default WhyOctoprice;

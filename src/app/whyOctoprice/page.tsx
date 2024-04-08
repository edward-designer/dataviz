import { Metadata } from "next";

import LottieIcon from "@/components/octopus/LottieIcon";
import Link from "next/link";
import Image from "next/image";

import dashboardImg from "../../../public/images/dashboard.jpg";
import savingImg from "../../../public/images/savings.jpg";
import octopastImg from "../../../public/images/octopast.jpg";
import compareImg from "../../../public/images/compare.jpg";
import dataImg from "../../../public/images/missing.jpg";
import hopImg from "../../../public/images/hopping.jpg";
import shiftImg from "../../../public/images/loadShift.jpg";

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
        Unlike major energy providers in the UK which provide only traditional
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
        this website as &quot;the App&quot;)!{" "}
      </p>
      <p className="text-accentBlue-500 p-4 bg-theme-900">
        Note: You may read the following sentence from your Octopus bill:
        &quot;Good news, you&apos;re already on our cheapest tariff. We&apos;ll
        let you know if this changes.&quot;{" "}
        <strong className="font-extrabold">Just do not trust this!</strong> I am
        a victim myself until I find out by switching to Tracker which have
        saved me over 1/3 over my previous bill!
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
      <LottieIcon icon="all" loop={true} />
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
      <LottieIcon icon="vip" loop={true} />
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
      <h4 className="mb-0 pb-0 text-xl font-extrabold text-theme-500 text-center">
        Information / Data Visualization
      </h4>
      <ul className="flex flex-wrap bg-theme-900 -mt-7">
        <li className="flex gap-3 lg:basis-1/2 p-4">
          <Link
            href="/dashboard"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={dashboardImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/dashboard"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              Dashboard
            </Link>{" "}
            - get all your important Octopus Energy contract (contract start and
            end dates, current tariff code, current energy price and standing
            charge) and account info (including your Grid Supply Point (GSP),
            meter serial number and MPAN/MPRN) in one page.
          </div>
        </li>
        <li className="flex gap-3 lg:basis-1/2 p-4">
          <Link
            href="/savings"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={savingImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/savings"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              My Savings
            </Link>{" "}
            - get an overview of your monthly and daily savings of your current
            Octopus Tariff vs Varible (SVT) both for electricity and gas, i.e.
            how much you have saved each day and each month. If you have export,
            your export earnings will also be shown. The amount is inclusive of
            VAT and standing charges.
          </div>
        </li>
        <li className="flex gap-3 lg:basis-1/2  p-4">
          <Link
            href="/yearInReview"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={octopastImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/yearInReview"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              My Octopast Year
            </Link>{" "}
            - see your electicity and gas consumption (if applicable) in the
            past year on a beautiful polar chart together with the temerature
            range, sunrise and sunset time and prevailing weather conditions for
            each day of the past year. Just appreciate how your consumption
            pattern changes day by day in relation to time of the year and
            external conditions.
          </div>
        </li>
        <li className="flex gap-3 lg:basis-1/2  p-4">
          <Link
            href="/missingData"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={dataImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/missingData"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              Data Checker
            </Link>{" "}
            - smart meters are as good as they are working properly. You can use
            this tool to monitor whether Octopus has retrieved all your meter
            data and whether your smart meter is working properly. Each filled
            square represent each 30-minute slot of the day. You can get the
            total number of missing data slots readily for each month. By
            checking your data availability frequently, you can avoid surprise
            of massive energy bill arrears.
          </div>
        </li>
      </ul>
      <h4 className="mb-0 pb-0 text-xl font-extrabold text-theme-500 text-center">
        Tariff Comparision
      </h4>
      <ul className="flex flex-wrap bg-theme-900 -mt-7">
        <li className="flex gap-3 lg:basis-1/2 p-4">
          <Link
            href="/compare"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={compareImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/compare"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              Compare Tariffs
            </Link>{" "}
            - this is the very first tool available on this app. Here you can
            get recommendations on the cheapest electricity and gas tariffs
            based on your actual energy usage figures. It is most accurate if
            you have been with Octopus for at least a year. The price figures
            presented here include both the standing charges and VAT. If you
            have export, it will also recommend you the most profitable tariff.
          </div>
        </li>
      </ul>
      <h4 className="mb-0 pb-0 text-xl font-extrabold text-theme-500 text-center">
        Advanced Tools
      </h4>
      <ul className="flex flex-wrap bg-theme-900 -mt-7">
        <li className="flex gap-3 p-4 lg:basis-1/2">
          <Link
            href="/tariffHopping"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={hopImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/tariffHopping"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              Tariff Hopping
            </Link>{" "}
            - if you have export, then tariff hopping is definitely worth trying
            as Octopus is offering various kinds of intelligent tariff suitable
            for different amount of solar generation output (the flux/iFlux
            tariff are especially worth mentioning). This is the missing tool to
            help you tariff hopping between various Octopus smart tariffs during
            the year to take full advantage of the zero exit fee of the various
            Octopus tariffs. It can advise you when is the best time to switch
            and what tariff combinations suit you most!
          </div>
        </li>
        <li className="flex gap-3 p-4 lg:basis-1/2">
          <Link
            href="/maxSave"
            target="_blank"
            className="shrink-0 font-extrabold text-accentPink-500 hover:text-accentBlue-500"
          >
            <Image
              src={shiftImg}
              className="w-[150px] h-auto border border-accentBlue-500 "
              alt="demo showing how the dashboard work"
            />
          </Link>
          <div>
            <Link
              href="/maxSave"
              target="_blank"
              className="font-extrabold text-accentPink-500 hover:text-accentBlue-500"
            >
              Load Shift
            </Link>{" "}
            - the ultimate tool to help you squeeze the last bit of savings from
            your Octopus time of use tariffs (i.e. Agile, Flux, Cosy, etc.) for
            both import-only and import-and-export users. Octopus offers many
            tariffs with prices that changes throughout the day in response to
            the demand of the time. You may have heard of &quot;load
            shifting&quot; before. This is the exact tool to help you visualize
            how much you can save by shifting your load to earlier or later
            periods. If you do not current have solar panels/batttery storage,
            this tool can also simulate these for you to estimate how much more
            you can save!
          </div>
        </li>
      </ul>
      <h2 className="font-display text-2xl text-accentPink-500 font-semibold">
        It sounds so good, but, what is the Catch?
      </h2>
      <p>
        I can promise there is NO catch. All your personal information is stored
        on your device (i.e. phone or computer) ONLY. I have absolutely NO
        access to your data. All your account and consumption data passes
        between your browser and Octopus Energy server only. And if you
        encounter any errors while using this website, I will need to ask your
        API key and account number in order to debug it as I cannot gain access
        to your data via the app without your info.
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Badge from "./Badge";

import { LiaInfoCircleSolid } from "react-icons/lia";
import { MdOutlineInstallMobile } from "react-icons/md";
import { MdExpandCircleDown } from "react-icons/md";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <div>
      <button
        aria-label={isOpen ? "hide menu" : "show menu"}
        className={`w-8 h-8 z-50 ${isOpen ? "fixed right-4 top-4" : ""}`}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
          <g xmlns="http://www.w3.org/2000/svg" fill="none" clipPath="url(#a)">
            <path
              stroke="#fff"
              strokeLinecap="round"
              strokeWidth="8"
              d="M-0 36h192"
              style={{
                transformBox: "fill-box",
                display: "block",
                transition: "all 0.5s ease-out",
                rotate: `${isOpen ? "45deg" : "0deg"}`,
                translate: `${isOpen ? "20px -8px" : "0 0"}`,
              }}
            ></path>
            <path
              stroke="#fff"
              strokeLinecap="round"
              strokeWidth="8"
              d="M-0 96h192"
              style={{
                transformBox: "fill-box",
                display: "block",
                opacity: `${isOpen ? "0" : "1"}`,
                transition: "all 0.5s ease-out",
              }}
            ></path>
            <path
              stroke="#fff"
              strokeLinecap="round"
              strokeWidth="8"
              d="M-0 156h192"
              style={{
                transformBox: "fill-box",
                display: "block",
                transformOrigin: "left center",
                rotate: `${isOpen ? "-45deg" : "0deg"}`,
                transition: "all 0.5s ease-out",
                translate: `${isOpen ? "20px 8px" : "0 0"}`,
              }}
            ></path>
          </g>
        </svg>
      </button>
      <div
        className={`z-40 w-80 bg-black/50 backdrop-blur-lg fixed top-0 right-0 transition-all h-full ${
          isOpen ? "translate-none" : "translate-x-full"
        }`}
        aria-hidden={isOpen}
      >
        <nav
          className={`text-4xl font-extralight p-4 pt-16 flex justify-between flex-col h-full overflow-y-scroll ${
            isOpen ? "" : "hidden"
          }`}
        >
          <div>
            <span className="block border-t border-accentBlue-500/50 text-xs relative mt-2 mb-6">
              <span className="absolute -top-2 bg-accentBlue-500 px-2 text-theme-950 italic rounded-full">
                Import Tariffs
              </span>
            </span>
            <Link
              href="/tracker"
              className={`block my-4 ${
                pathname === "/tracker"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Tracker <span className="text-lg">Price</span>
            </Link>
            <Link
              href="/agile"
              className={`block my-4  ${
                pathname === "/agile"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Agile <span className="text-lg">Price</span>
            </Link>
            <div
              className={`overflow-y-hidden overflow-x-visible transition-all duration-500 -mt-4 ${
                isExtended ? "max-h-[1000px] visible" : "max-h-0 hidden"
              }`}
              aria-expanded={isExtended ? "true" : "false"}
            >
              <Link
                href="/cosy"
                className={`block my-4  ${
                  pathname === "/cosy"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Cosy <span className="text-lg"> Price</span>
              </Link>
              <Link
                href="/flux"
                className={`block my-4  ${
                  pathname === "/flux"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Flux <span className="text-lg"> Price</span>
              </Link>
              <Link
                href="/iflux"
                className={`block my-4  ${
                  pathname === "/iflux"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                <span className="text-lg">Intelligent</span> Flux{" "}
                <span className="text-lg"> Price</span>
              </Link>
              <Link
                href="/go"
                className={`block my-4  ${
                  pathname === "/go"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Go <span className="text-lg"> Price</span>
              </Link>
              <Link
                href="/igo"
                className={`block my-4  ${
                  pathname === "/igo"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                <span className="text-lg">Intelligent</span> Go{" "}
                <span className="text-lg"> Price</span>
              </Link>
              <Link
                href="/fixed"
                className={`block my-4  ${
                  pathname === "/fixed"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Fixed <span className="text-lg"> Price</span>
              </Link>
              <Link
                href="/variable"
                className={`block my-4  ${
                  pathname === "/variable"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Variable <span className="text-lg">(SVT) Price</span>
              </Link>
              <span className="block border-t border-accentBlue-500/50 text-xs relative mt-8 mb-6">
                <span className="absolute -top-2 bg-accentBlue-500 px-2 text-theme-950 italic rounded-full">
                  Export Tariffs
                </span>
              </span>
              <Link
                href="/agileOutgoing"
                className={`block my-4  ${
                  pathname === "/agileOutgoing"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Agile <span className="text-lg"> Export</span>
              </Link>
              <Link
                href="/flux"
                className={`block my-4  ${
                  pathname === "/flux"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Flux <span className="text-lg"> Export</span>
              </Link>
              <Link
                href="/iflux"
                className={`block my-4  ${
                  pathname === "/iflux"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                <span className="text-lg">Intelligent</span> Flux{" "}
                <span className="text-lg"> Export</span>
              </Link>
              <Link
                href="/fixedOutgoing"
                className={`block my-4  ${
                  pathname === "/fixedOutgoing"
                    ? "cursor-default text-accentBlue-900"
                    : "hover:text-accentPink-500"
                }`}
              >
                Fixed <span className="text-lg"> Export</span>
              </Link>
            </div>

            <button
              className={`w-full flex justify-center items-center gap-1  ${
                isExtended ? "" : "mt-5"
              }`}
              onClick={() => setIsExtended(!isExtended)}
            >
              <span className="text-sm text-accentBlue-600">
                {isExtended ? "less" : "more"}
              </span>
              <MdExpandCircleDown
                aria-hidden="true"
                className={`w-8 h-8 transition-all text-accentBlue-600 ${
                  isExtended ? "rotate-180" : ""
                }`}
              />
              <span className="text-sm text-accentBlue-600">tariffs</span>
            </button>
            <span className="block border-t border-accentBlue-500/50 text-xs relative mt-8 mb-6">
              <span className="absolute -top-2 bg-accentBlue-500 px-2 text-theme-950 italic rounded-full">
                Octopus Tools
              </span>
            </span>
            <Link
              href="/dashboard"
              className={`block my-4  ${
                pathname === "/dashboard"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/savings"
              className={`block my-4  ${
                pathname === "/savings"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <span className="text-lg">My</span> Savings
            </Link>
            <Link
              href="/compare"
              className={`block my-4  ${
                pathname === "/compare"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Compare <span className="text-lg">Tariffs</span>
            </Link>
            <Link
              href="/compareTracker"
              className={`block my-4  ${
                pathname === "/compareTracker"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <Badge label="new" /> <span className="text-lg">New vs Old</span>
              Tracker
            </Link>
            <Link
              href="/yearInReview"
              className={`block my-4  ${
                pathname === "/yearInReview"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <Badge label="beta" /> <span className="text-lg">My </span>
              Octopast <span className="text-lg">Year</span>
            </Link>
          </div>
          <div>
            <Link
              href="/install"
              className={`flex items-center gap-1 my-4 text-base  ${
                pathname === "/install"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <MdOutlineInstallMobile /> Install on Mobile
            </Link>
            <Link
              href="/about"
              className={`flex items-center gap-1 my-4 text-base  ${
                pathname === "/about"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <LiaInfoCircleSolid /> About
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Menu;

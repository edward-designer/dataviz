"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Badge from "./Badge";

import { LiaInfoCircleSolid } from "react-icons/lia";
import { MdOutlineInstallMobile } from "react-icons/md";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <div>
      <button
        aria-label="menu"
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
      >
        <nav className="text-4xl font-extralight p-4 pt-20 flex justify-between flex-col h-full">
          <div>
            <span className="block my-2 border-t border-accentBlue-500/50"></span>
            <Link
              href="/tracker"
              className={`block my-5 ${
                pathname === "/tracker"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Tracker <span className="text-lg">Price</span>
            </Link>
            <Link
              href="/agile"
              className={`block my-5  ${
                pathname === "/agile"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Agile <span className="text-lg">Price</span>
            </Link>
            <Link
              href="/variable"
              className={`block my-5  ${
                pathname === "/variable"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Variable <span className="text-lg">(SVT) Price</span>
            </Link>
            <span className="block my-2 border-t border-accentBlue-500/50"></span>
            <Link
              href="/dashboard"
              className={`block my-5  ${
                pathname === "/dashboard"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/savings"
              className={`block my-5  ${
                pathname === "/savings"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <span className="text-lg">My</span> Savings
            </Link>
            <Link
              href="/compare"
              className={`block my-5  ${
                pathname === "/compare"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              Compare <span className="text-lg">Tariffs</span>
            </Link>
            <Link
              href="/compareTracker"
              className={`block my-5  ${
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
              className={`block my-5  ${
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
              className={`flex items-center gap-1 my-3 text-base  ${
                pathname === "/install"
                  ? "cursor-default text-accentBlue-900"
                  : "hover:text-accentPink-500"
              }`}
            >
              <MdOutlineInstallMobile /> Install on Mobile
            </Link>
            <Link
              href="/about"
              className={`flex items-center gap-1 my-3 text-base  ${
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

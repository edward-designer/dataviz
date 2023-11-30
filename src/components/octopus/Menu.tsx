"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <div className="relative">
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
        className={`z-40 w-80 bg-theme-900/70 backdrop-blur-lg fixed top-0 right-0 transition-all h-full ${
          isOpen ? "translate-none" : "translate-x-full"
        }`}
      >
        <nav className="text-4xl font-extralight p-4 pt-20">
          <Link
            href="/tracker"
            className={`block my-5 ${
              pathname === "/tracker"
                ? "cursor-default text-accentBlue-900"
                : "hover:text-accentPink-500"
            }`}
          >
            Tracker
          </Link>
          <Link
            href="/agile"
            className={`block my-5  ${
              pathname === "/agile"
                ? "cursor-default text-accentBlue-900"
                : "hover:text-accentPink-500"
            }`}
          >
            Agile
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Menu;

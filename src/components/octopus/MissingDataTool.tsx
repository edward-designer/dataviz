"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import UserApi from "./UserApi";
import Image from "next/image";

import demoImg from "../../../public/images/missing.jpg";
import MissingDataToolContainer from "./MissingDataToolContainer";

import { BsUiChecksGrid } from "react-icons/bs";

export type ErrorType = Record<string, string>;

const MissingDataTool = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Missing Data Checker
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - find gaps in your smart meter data
      </h2>
      <div
        className="-z-10 absolute top-0 right-0 overflow-hidden"
        aria-hidden={true}
      >
        <BsUiChecksGrid className="relative -top-5 -right-10 text-theme-700/20  w-[170px] h-[170px] md:hidden pointer-events-none" />
      </div>

      {hasApiInfo ? (
        <MissingDataToolContainer />
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
          <div className="">
            <UserApi />
          </div>
          <div className="flex w-full md:w-fit flex-grow items-center justify-center mt-8 md:mt-0 shrink-0">
            <Image
              src={demoImg}
              className="w-[300px] h-auto border border-accentBlue-500 "
              alt="demo showing how the missing data tool work"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MissingDataTool;

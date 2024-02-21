"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import TrackerComparision from "./TrackerComparision";
import UserApi from "./UserApi";
import Image from "next/image";

import compareImg from "../../../public/images/compare.jpg";

export type ErrorType = Record<string, string>;

const CompareTariffs = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Old vs New Tracker Tariffs
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - how much MORE you have to pay
      </h2>

      {hasApiInfo ? (
        <TrackerComparision />
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
          <div className="">
            <UserApi />
          </div>
          <div className="flex w-full md:w-fit flex-grow items-center justify-center mt-8 md:mt-0 shrink-0">
            <Image
              src={compareImg}
              className="w-[300px] h-auto border border-accentBlue-500 "
              alt="demo showing how the savings calculation work"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareTariffs;

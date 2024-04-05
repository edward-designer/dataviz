"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import EnergyShiftSimContainer from "./EnergyShiftSimContainer";
import UserApi from "./UserApi";
import Image from "next/image";

import demoImg from "../../../public/images/loadShift.jpg";

import { HiAdjustmentsVertical } from "react-icons/hi2";

export type ErrorType = Record<string, string>;

const EnergyShiftSim = () => {
  const { value, setValue } = useContext(UserContext);
  const loggedIn = !!(value.apiKey && value.accountNumber) || value.testRun;

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-4xl lg:text-6xl font-medium ">
        Load Shifting Visualizer
      </h1>
      <h2 className="text-accentBlue-400 font-display font-medium text-lg lg:text-2xl mb-8">
        - data-driven simulation tool
      </h2>
      <div
        className="-z-10 absolute top-0 right-0 overflow-hidden"
        aria-hidden={true}
      >
        <HiAdjustmentsVertical className="relative -top-4 -right-6 text-theme-700/20  w-[170px] h-[170px] md:hidden pointer-events-none" />
      </div>

      {loggedIn ? (
        <EnergyShiftSimContainer />
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
          <div className="">
            <UserApi />
          </div>
          <div className="flex w-full md:w-fit flex-grow items-center justify-center mt-8 md:mt-0 shrink-0">
            <Image
              src={demoImg}
              className="w-[300px] h-auto border border-accentBlue-500 "
              alt="demo showing how the load shifting visualizer work"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyShiftSim;

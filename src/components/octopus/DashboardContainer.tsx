"use client";

import { useContext } from "react";

import { UserContext } from "@/context/user";
import UserApi from "./UserApi";
import Image from "next/image";

import demoImg from "../../../public/images/dashboard.jpg";
import DashboardContents from "./DashboardContents";

export type ErrorType = Record<string, string>;

const DashboardContainer = () => {
  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return hasApiInfo ? (
    <DashboardContents />
  ) : (
    <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
      <div className="">
        <UserApi />
      </div>
      <div className="flex w-full md:w-fit flex-grow items-center justify-center mt-8 md:mt-0 shrink-0">
        <Image
          src={demoImg}
          className="w-[300px] h-auto border border-accentBlue-500 "
          alt="demo showing how the dashboard work"
        />
      </div>
    </div>
  );
};

export default DashboardContainer;

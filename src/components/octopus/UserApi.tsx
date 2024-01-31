"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import Remark from "./Remark";

import UserApiForm from "./UserApiForm";
import Lottie from "lottie-react";

import { ImGift } from "react-icons/im";
import { MdOutlineCalculate } from "react-icons/md";

import Saving from "../../../public/lottie/saving.json";
import Link from "next/link";

export type ErrorType = Record<string, string>;

const UserApi = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p>
        To use the exclusive features of the Octoprice App, you will need to:
      </p>
      <ol className="list-decimal ml-5 flex flex-col gap-5 mt-4">
        <li>
          be an <span className="text-3xl">Octopus Energy user</span>
          <Remark>
            The results will be more accurate if you have been an Octopus user
            for at least several months, better if over a year - if you are not
            a current Octopus Energy user, you can switch now and wait for a
            month to use this service.
            <span className="inline-block mt-3 text-sm border-t border-b border-dotted py-2 my-2 leading-6">
              Not an Octopus user? No worries, you can get{" "}
              <ImGift className="inline-block -translate-y-1 w-6 h-6 px-1 fill-accentBlue-500" />
              <strong>£50 credit</strong> by{" "}
              <a
                href="https://share.octopus.energy/sky-heron-134"
                target="_blank"
                className="inline-block underline text-accentPink-500 hover:no-underline"
              >
                signing up thru our exclusive link
              </a>{" "}
              !
            </span>
          </Remark>
        </li>
        <li>
          <div className="inline-flex items-start lg:items-center gap-2 flex-col lg:flex-row ">
            <UserApiForm open={open} setOpen={setOpen} />
            <div>
              your Octopus account information
              <Remark>
                The account information is used to retrieve your energy usage
                details for cost calcuation. Please be assured that all your
                account information will be stored on your browser only and will
                NOT be shared with us.
              </Remark>
            </div>
          </div>
        </li>
      </ol>

      <div className="flex flex-col p-2 md:py-6 md:flex-row items-center bg-theme-900 mt-20 ">
        <div className="w-[100px] md:min-w-[200px] flex items-center justify-center">
          <Lottie
            animationData={Saving}
            aria-hidden={true}
            loop={true}
            className="w-[150px] h-[150px]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-accentBlue-600">Not an Octopus Energy user?</p>
          <h3 className="text-4xl mb-2 text-accentBlue-500">
            <a
              href="https://share.octopus.energy/sky-heron-134"
              target="_blank"
              className=" text-accentBlue-500 hover:no-underline"
            >
              Save £200+* by switching!
            </a>
          </h3>
          <p>
            By switching to Octopus through our exclusive link to get a FREE £50
            credit on your account! Swap today for 100% renewable energy and
            award winning customer service! And you can switch out anytime
            without penalties.
          </p>
          <p>
            <MdOutlineCalculate className="inline-block w-6 h-6 text-accentBlue-500 mr-2" />
            <Link
              href="/switch"
              className="underline text-accentPink-500 hover:no-underline hover:text-accentBlue-500"
            >
              calculate how much exactly you can save with this tool
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default UserApi;

"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import Remark from "./Remark";

import UserApiForm from "./UserApiForm";

import { ImGift } from "react-icons/im";

export type ErrorType = Record<string, string>;

const UserApi = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p>
        Wanna know which Ocotpus tariff brings you the most savings? You will
        need to:
      </p>
      <ol className="list-decimal ml-5 flex flex-col gap-10 mt-4">
        <li>
          be an <span className="text-3xl">Octopus user for a month</span>
          <Remark>
            The results will be more accurate if you have been an Octopus user
            for over a year - if you are not a current Octopus Energy user, you
            can switch now and wait for a month to use this service.
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
              </a>
              {" "}!
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
    </>
  );
};

export default UserApi;

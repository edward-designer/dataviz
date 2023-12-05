"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import Remark from "./Remark";

import UserApiForm from "./UserApiForm";
import UserApiResult from "./UserApiResult";

export type ErrorType = Record<string, string>;

const UserApi = () => {
  const [open, setOpen] = useState(false);

  const { value, setValue } = useContext(UserContext);
  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  return (
    <div className="flex flex-col font-extralight text-lg">
      <h1 className="text-accentBlue-400 font-display text-6xl mb-4">
        Agile vs Tracker?
      </h1>
      {hasApiInfo ? (
        <UserApiResult />
      ) : (
        <>
          <p>
            Wanna know which Ocotpus tariff brings you the most savings? You
            will need:
          </p>
          <ol className="list-decimal ml-5 flex flex-col gap-4 mt-4">
            <li>
              having been an{" "}
              <span className="text-3xl">Octopus user for a month</span>
              <Remark variant="badge">
                The results will be more accurate if you have been a Octopus
                user for over a year.
                <br />- if you are not a current Octopus Energy user, you can
                switch now and wait for a month to use this service
              </Remark>
            </li>
            <li>
              <div className="inline-flex items-start lg:items-center gap-2 flex-col lg:flex-row">
                <UserApiForm open={open} setOpen={setOpen} />
                <div>
                  your Octopus account information
                  <Remark variant="badge">
                    The account information is used to retrieve your energy
                    usage details for cost calcuation. Please be assured that
                    all your account information will be stored on your browser
                    only and will NOT be shared with us.
                  </Remark>
                </div>
              </div>
            </li>
          </ol>
        </>
      )}
    </div>
  );
};

export default UserApi;

export interface IUserApiForm {
  open: boolean;
  setOpen: (value: boolean) => void;
}
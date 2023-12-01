/*"use client";
import { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import toast from "react-hot-toast";

import { FETCH_ERROR } from "@/data/source";

import { IUserValue, IValue, UserContext } from "@/context/user";
import Remark from "./Remark";
import Button from "./Button";
import InfoInput from "./InfoInput";

import { tryFetch } from "@/utils/helpers";

import { IoLocationOutline } from "react-icons/io5";
import { GrStatusGood } from "react-icons/gr";
import { HiOutlinePencilSquare } from "react-icons/hi2";

export type ErrorType = Record<string, string>;

const UserApi = () => {
  const { value, setValue } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState(value.apiKey);
  const [accountNumber, setAccountNumber] = useState(value.accountNumber);

  useEffect(() => {
    setApiKey(value.apiKey);
  }, [value.apiKey]);

  const clearValueHandler = (
    name: string,
    key: keyof IUserValue,
    callback: (value: string) => void
  ) => {
    toast.success(`${name} cleared.`);
    callback("");
    const newError = { ...error };
    delete newError[key];
    setError(newError);
    setValue({ ...value, [key]: "" });
  };

  const submitHandler = () => {
    setError({});
    const getGsp = async () => {
      const response = await tryFetch(
        fetch(
          `https://api.octopus.energy/v1/industry/grid-supply-points/?apiKey=${apiKey}`
        )
      );
      if (!response.ok) throw new Error(FETCH_ERROR);

      const result = await response.json();
      const gsp = result?.results?.[0]?.group_id;
      if (!result.count || typeof gsp !== "string") {
        toast.error("Sorry, something went wrong.");
        setError({
          ...error,
          apiKey: "Please check your apiKey and try again.",
        });
        return false;
      }
      setValue({
        ...value,
        apiKey: apiKey.toUpperCase(),
        gsp: gsp.replace("_", ""),
      });
      toast.success("Changes are saved.");
      return true;
    };
    getGsp().then((result) => {
      if (result) setOpen(false);
    });
  };

  const cancelHandler = (value: IValue) => {
    setApiKey(value.apiKey);
    setOpen(false);
    setError({});
  };

  const handleDialogOpenChange = (state: boolean) => {
    if (!state) {
      cancelHandler(value);
    }
    setOpen(state);
  };

  const hasApiKey = !!(value.apiKey && value.accountNumber);
  const ButtonIcon = hasApiKey ? GrStatusGood : HiOutlinePencilSquare;

  return (
    <div className="flex">
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger className="text-accentPink-600 flex">
          <button className="flex gap-2 border border-accentPink-600 p-2 rounded-xl">
            <ButtonIcon
              className="w-6 h-6 text-accentPink-600"
              aria-label="click to enter apiKey"
            />
            {hasApiKey ? "Account info entered" : "Fill in account info"}
          </button>
        </DialogTrigger>
        <DialogContent className="text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">My Info</DialogTitle>
          </DialogHeader>
          <InfoInput
            label="Account Number"
            type="text"
            placeHolder="Please enter your account number"
            error={error}
            value={accountNumber}
            setValue={setAccountNumber}
            clearHandler={() =>
              clearValueHandler(
                "Account Number",
                "accountNumber",
                setAccountNumber
              )
            }
            remark={
              <Remark variant="badge">
                The account number can be obtained by logging in your Octopus
                account through{" "}
                <a href="https://octopus.energy/dashboard/" target="_blank">
                  this link to the Octopus dashboard
                </a>
                . It is the number under your user name with the format
                [A-AAAA1111].
              </Remark>
            }
          />
          <InfoInput
            label="API Key"
            type="text"
            placeHolder="Please enter your API Key"
            error={error}
            value={apiKey}
            setValue={setApiKey}
            clearHandler={() =>
              clearValueHandler("API Key", "apiKey", setApiKey)
            }
          />
          <div className="flex gap-2">
            <Button
              clickHandler={submitHandler}
              className="border-accentBlue-500 border"
            >
              Submit
            </Button>
            <Button
              clickHandler={() => cancelHandler(value)}
              className="border-white/50 border"
            >
              Cancel
            </Button>
          </div>
          <p className="font-light text-sm border-t border-dotted border-accentBlue-800 pt-2">
            Rest assured that your information will NOT be shared with us. It
            will be stored on your computer for information retrieval only.
          </p>
        </DialogContent>
      </Dialog>

      {value.apiKey === "" && (
        <Remark variant="badge">
          Unit rates are set slightly different depending on locations. Please
          enter your apiKey to get the accurate figures.
        </Remark>
      )}
    </div>
  );
};

export default UserApi;*/

import React from "react";

const UserApi = () => {
  return <div></div>;
};

export default UserApi;

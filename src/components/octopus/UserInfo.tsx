"use client";
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

import { IUserValue, UserContext } from "@/context/user";
import Remark from "./Remark";
import Button from "./Button";
import InfoInput from "./InfoInput";

import { tryFetch } from "@/utils/helpers";

import { IoLocationOutline } from "react-icons/io5";

export type ErrorType = Record<string, string>;

const UserInfo = () => {
  const { value, setValue } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [postcode, setPostcode] = useState(value.postcode);

  useEffect(() => {
    setPostcode(value.postcode);
  }, [value.postcode]);

  const clearPostCodeHandler = () => {
    toast.success("Postcode cleared.");
    setPostcode("");
    const newError = { ...error };
    delete newError.postcode;
    setError(newError);
    setValue({ ...value, postcode: "" });
  };

  const submitHandler = () => {
    setError({});
    const getGsp = async () => {
      const response = await tryFetch(
        fetch(
          `https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=${postcode}`
        )
      );
      if (!response.ok) throw new Error(FETCH_ERROR);

      const result = await response.json();
      const gsp = result?.results?.[0]?.group_id;
      if (!result.count || typeof gsp !== "string") {
        toast.error("Sorry, something went wrong.");
        setError({
          ...error,
          postcode: "Please check your postcode and try again.",
        });
        return false;
      }
      setValue({
        ...value,
        postcode: postcode.toUpperCase(),
        gsp: gsp.replace("_", ""),
      });
      toast.success("Changes are saved.");
      return true;
    };
    getGsp().then((result) => {
      if (result) setOpen(false);
    });
  };

  const cancelHandler = (value: IUserValue) => {
    setPostcode(value.postcode);
    setOpen(false);
    setError({});
  };

  const handleDialogOpenChange = (state: boolean) => {
    if (!state) {
      cancelHandler(value);
    }
    setOpen(state);
  };

  return (
    <div className="flex">
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger className="text-accentPink-600 flex">
          <IoLocationOutline
            className="w-6 h-6 text-accentPink-600"
            aria-label="click to enter postcode"
          />
          {value.postcode}
        </DialogTrigger>
        <DialogContent className="text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">My Info</DialogTitle>
          </DialogHeader>
          <InfoInput
            label="postcode"
            type="text"
            placeHolder="Please enter your postcode"
            error={error}
            value={postcode}
            setValue={setPostcode}
            clearHandler={clearPostCodeHandler}
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

      {value.postcode === "" && (
        <Remark variant="badge">
          Unit rates are set slightly different depending on locations. Please
          enter your postcode to get the accurate figures.
        </Remark>
      )}
    </div>
  );
};

export default UserInfo;

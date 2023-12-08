"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useContext, useEffect, useState } from "react";

import toast from "react-hot-toast";

import { IUserValue, UserContext } from "@/context/user";
import Button from "./Button";
import InfoInput from "./InfoInput";
import Remark from "./Remark";

import { getGsp } from "@/utils/helpers";

import { IoLocationOutline } from "react-icons/io5";
import UserApiForm from "./UserApiForm";

export type ErrorType = Record<string, string>;

const UserInfo = () => {
  const { value, setValue } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    setPostcode(value.postcode);
  }, [value.postcode]);

  const clearPostCodeHandler = () => {
    toast.success("Postcode cleared.");
    setPostcode("");
    const newError = { ...error };
    delete newError.postcode;
    setError(newError);
    setValue({ ...value, postcode: "", apiKey: "", accountNumber: "" });
  };

  const submitHandler = async () => {
    setError({});
    try {
      const gsp = await getGsp(postcode);
      if (gsp) {
        setValue({
          ...value,
          postcode: postcode.toUpperCase(),
          gsp: gsp.replace("_", ""),
        });
        toast.success("Changes are saved.");
        setOpen(false);
      } else {
        toast.error("Sorry, something went wrong.");
        setError({
          ...error,
          postcode: "Please check your postcode and try again.",
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
    }
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

  if (value.apiKey && value.accountNumber)
    return <UserApiForm open={open} setOpen={setOpen} />;

  return (
    <div className="flex items-center justify-center">
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
            <DialogTitle className="text-2xl">
              My Postcode{" "}
              {value.postcode === "" && (
                <Remark>
                  Please enter your postcode to get the accurate figures as unit
                  rates are set slightly different depending on locations.
                </Remark>
              )}
            </DialogTitle>
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
    </div>
  );
};

export default UserInfo;

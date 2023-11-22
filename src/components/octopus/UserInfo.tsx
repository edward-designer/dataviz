"use client";
import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoLocationOutline } from "react-icons/io5";
import Remark from "./Remark";
import Button from "./Button";
import { UserContext } from "@/context/user";
import InfoInput from "./InfoInput";

export type ErrorType = Record<string, string>;

const UserInfo = () => {
  const { value, setValue } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [postcode, setPostCode] = useState(value.postcode);

  const clearPostCodeHandler = () => {
    setPostCode("");
    const newError = { ...error };
    delete newError.postcode;
    setError(newError);
    setValue({ ...value, postcode: "" });
  };

  const submitHandler = () => {
    setError({});
    const getGsp = async () => {
      const response = await fetch(
        `https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=${postcode}`
      );
      const result = await response.json();
      const gsp = result?.results?.[0]?.group_id;
      if (!result.count || typeof gsp !== "string") {
        setError({
          ...error,
          postcode:
            "Sorry, something went wrong. Please check your postcode and try again.",
        });
        return false;
      }
      setValue({
        ...value,
        postcode: postcode.toUpperCase(),
        gsp: gsp.replace("_", ""),
      });
      return true;
    };
    getGsp().then((result) => {
      if (result) setOpen(false);
    });
  };

  const cancelHandler = () => {
    setPostCode("");
    setOpen(false);
    setError({});
  };

  return (
    <div className="flex">
      <Dialog open={open} onOpenChange={setOpen}>
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
            setValue={setPostCode}
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
              clickHandler={cancelHandler}
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

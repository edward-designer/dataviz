"use client";

import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MdOutlineClear } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import logo from "../../public/octoprice-light.svg";

import Remark from "./octopus/Remark";
import Button from "./octopus/Button";
import { UserContext } from "@/context/user";

const Header = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) => {
  const { value, setValue } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [postcode, PostcodeInput, postcodeReset] = useInfoInput(
    "Postcode",
    "text",
    value.postcode,
    "Enter your partial or full postcode",
    error.postcode
  );

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
        postcode,
        gsp: gsp.replace("_", ""),
      });
      return true;
    };
    getGsp().then((result) => {
      if (result) setOpen(false);
    });
  };

  const cancelHandler = () => {
    postcodeReset();
    setOpen(false);
    setError({});
  };
  return (
    <>
      <header
        className={`flex gap-4 justify-between items-center ${className} py-4`}
        {...props}
      >
        <Image
          priority
          src={logo}
          alt="Octoprice logo"
          className="w-40 h-auto"
        />
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
              {PostcodeInput}
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
                Rest assured that your information will NOT be shared with us.
                It will be stored on your computer for information retrieval
                only.
              </p>
            </DialogContent>
          </Dialog>

          {value.postcode === "" && (
            <Remark variant="badge">
              Enter your postcode to get the accurate energy price.
            </Remark>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;

const useInfoInput = (
  label: string,
  type: HTMLInputElement["type"],
  initialValue: string = "",
  placeHolder?: string,
  error?: string
) => {
  const [value, setValue] = useState(initialValue);
  const id = useId();
  const reset = () => setValue(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  const input = (
    <div className="grid w-full items-center gap-1 mb-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex w-full">
        <Input
          type={type}
          id={id}
          placeholder={placeHolder}
          value={value}
          className="flex-1"
          onChange={(e) => setValue(e.target.value)}
        />
        <Button clickHandler={() => setValue("")}>
          <MdOutlineClear className="w-6 h-6 text-accentPink-800 hover:text-accentPink-600" />
        </Button>
      </div>
      {error && <div className="text-red-800">{error}</div>}
    </div>
  );
  return [value, input, reset] as const;
};

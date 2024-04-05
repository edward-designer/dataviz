"use client";
import { useContext } from "react";
import Button from "./Button";
import { UserContext } from "@/context/user";
import { IoMdEyeOff } from "react-icons/io";

const ExitTrialButton = () => {
  const { value, setValue } = useContext(UserContext);

  return (
    <div className=" bg-black/50 p-2 flex justify-center">
      <Button
        variant="action"
        clickHandler={() => {
          setValue({ ...value, testRun: false });
        }}
        className="flex text-accentPink-600 gap-2 items-center px-8 rounded-xl"
      >
        <IoMdEyeOff
          className="w-6 h-6 text-accentPink-600 group-hover:text-accentPink-300"
          aria-label="click to enter account information"
        />
        Exit Trial Mode
      </Button>
    </div>
  );
};

export default ExitTrialButton;

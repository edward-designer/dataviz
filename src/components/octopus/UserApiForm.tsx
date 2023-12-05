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
import { IUserValue, UserContext } from "@/context/user";
import Remark from "./Remark";
import Button from "./Button";
import InfoInput from "./InfoInput";
import { GrStatusGood } from "react-icons/gr";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import Image from "next/image";
import { IUserApiForm } from "./UserApi";

const UserApiForm = ({ open, setOpen }: IUserApiForm) => {
  const { value, setValue } = useContext(UserContext);

  const [error, setError] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    setApiKey(value.apiKey);
  }, [value.apiKey]);

  useEffect(() => {
    setAccountNumber(value.accountNumber);
  }, [value.accountNumber]);

  const hasApiInfo = !!(value.apiKey && value.accountNumber);

  const ButtonIcon = hasApiInfo ? GrStatusGood : HiOutlinePencilSquare;

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
    setValue({
      ...value,
      apiKey,
      accountNumber,
    });
    toast.success("Changes are saved.");
    return true;
  };

  const cancelHandler = (value: IUserValue) => {
    setApiKey(value.apiKey);
    setAccountNumber(value.accountNumber);
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
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger className="text-accentPink-600 inline-flex">
        <div className="flex gap-2 border border-accentPink-600 py-2 px-8 rounded-xl">
          <ButtonIcon
            className="w-6 h-6 text-accentPink-600"
            aria-label="click to enter account information"
          />
          Filling in
        </div>
      </DialogTrigger>
      <DialogContent className="text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            My Octopus Account Info
          </DialogTitle>
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
              <a
                className="underline"
                href="https://octopus.energy/dashboard/"
                target="_blank"
              >
                this link to the Octopus dashboard
              </a>
              . It is the number under your user name with the format
              [A-AAAA1111].
              <Image
                className="block mt-2"
                src="/images/octopus-accountNumber.jpg"
                width={300}
                height={368}
                alt="showing how to get account number"
              />
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
          clearHandler={() => clearValueHandler("API Key", "apiKey", setApiKey)}
          remark={
            <Remark variant="badge">
              Get your{" "}
              <a
                className="underline"
                href="https://octopus.energy/dashboard/new/accounts/personal-details/api-access"
                target="_blank"
              >
                API key here
              </a>
              . It is in the format [sk_live_XXXXXXXX111111111].
              <Image
                className="block mt-2"
                src="/images/octopus-apiKey2.jpg"
                width={300}
                height={368}
                alt="showing how to get account number"
              />
            </Remark>
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
        {value.postcode && (
          <p className="font-light text-sm text-accentPink-500">
            Your postcode will also be updated should the previously entered
            postcode is different from that on your account.
          </p>
        )}
        <p className="font-light text-sm border-t border-dotted border-accentBlue-800 pt-2">
          Rest assured that your information will NOT be shared with us. It will
          be stored on your computer for information retrieval only.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default UserApiForm;

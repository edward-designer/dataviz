"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { IUserValue, UserContext } from "@/context/user";
import { FormEvent, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdSolarPower } from "react-icons/md";
import Button from "./Button";
import InfoInput from "./InfoInput";

export interface IFormSolar {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const FormSolar = ({ open, setOpen }: IFormSolar) => {
  const { value, setValue } = useContext(UserContext);

  const [error, setError] = useState<Record<string, string>>({});
  const [hasSolar, setHasSolar] = useState(false);
  const [annualProduction, setAnnualProduction] = useState<
    IUserValue["configSolar"]["annualProduction"]
  >([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    setHasSolar(value.configSolar.hasSolar);
    setAnnualProduction(value.configSolar.annualProduction);
  }, [value.configSolar]);

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError({});
    setValue({
      ...value,
      configSolar: {
        ...value.configSolar,
        hasSolar,
        annualProduction,
      },
    });

    toast.success("Changes are saved.");
    setOpen(false);
  };

  const cancelHandler = (value: IUserValue) => {
    setHasSolar(value.configSolar.hasSolar);
    setAnnualProduction(value.configSolar.annualProduction);
    setOpen(false);
    setError({});
  };

  const handleDialogOpenChange = (state: boolean) => {
    if (!state) {
      cancelHandler(value);
    }
    setOpen(state);
  };

  const updatePowerGeneration = (i: number) => (value: number) => {
    setAnnualProduction((prevValues) => {
      const curValues = [
        ...prevValues,
      ] as IUserValue["configSolar"]["annualProduction"];
      curValues[i] = value;
      return curValues;
    });
  };

  const total = annualProduction.reduce((acc, cur) => acc + cur, 0);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger
        className={`${
          value.configSolar.hasSolar ? "text-accentPink-500" : "text-slate-600"
        } relative flex group flex-col justify-center items-center p-1`}
      >
        <MdSolarPower
          aria-hidden={true}
          className="w-10 h-10 group-hover:text-white"
        />
        {!value.configSolar.hasSolar && (
          <span className="block absolute h-14 w-1 bg-slate-900/90 rotate-45 -top-1 group-hover:hidden"></span>
        )}
        <span className="group-hover:text-white text-xs">Solar Generation</span>
        {total > 0 && hasSolar && (
          <span className="text-sm font-bold group-hover:text-white">
            {total} kWh/yr
          </span>
        )}
      </DialogTrigger>

      <DialogContent className="text-white max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Solar Power Generation Info
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submitHandler}>
          <div className="flex items-center gap-2 mb-4">
            <Switch
              id="hasSolar"
              checked={hasSolar}
              onCheckedChange={setHasSolar}
            />
            <label htmlFor="hasSolar">Has Solar Panels</label>
          </div>
          {hasSolar && (
            <div className="flex flex-col p-4 gap-2  bg-slate-900 rounded-2xl">
              <div className="text-accentBlue-600 text-xl">
                Power Generation (in kWh) - total: {total} kWh
              </div>
              {annualProduction.map((production, i) => (
                <InfoInput
                  key={i}
                  label={`${new Date(new Date().setMonth(i)).toLocaleDateString(
                    "gb-EN",
                    { month: "long" }
                  )}:`}
                  type="number"
                  placeHolder="Please enter the monthly production"
                  min={0}
                  error={error}
                  value={production}
                  setValue={updatePowerGeneration(i)}
                  pattern="^\d+(?:\.\d{1,1})?$"
                  step={0.1}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap justify-between mt-4">
            <div className="flex gap-2">
              <button
                className="border-accentBlue-500 border px-2 rounded-lg"
                type="submit"
              >
                Submit
              </button>
              <Button
                clickHandler={() => cancelHandler(value)}
                className="border-white/50 border"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormSolar;

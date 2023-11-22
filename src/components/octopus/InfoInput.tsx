import { useId } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Button from "./Button";
import { MdOutlineClear } from "react-icons/md";
import { ErrorType } from "./UserInfo";

interface IInfoInput {
  label: string;
  type: HTMLInputElement["type"];
  placeHolder: string;
  error: ErrorType;
  value: string;
  setValue: (value: string) => void;
  clearHandler: () => void;
}

const InfoInput = ({
  label,
  type,
  placeHolder = "",
  error,
  value,
  setValue,
  clearHandler,
}: IInfoInput) => {
  const id = useId();

  return (
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
        <Button clickHandler={clearHandler}>
          <MdOutlineClear className="w-6 h-6 text-accentPink-800 hover:text-accentPink-600" />
        </Button>
      </div>
      {error?.[label] && <div className="text-red-800">{error[label]}</div>}
    </div>
  );
};

export default InfoInput;

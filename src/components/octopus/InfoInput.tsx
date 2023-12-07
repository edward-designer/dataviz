import { ChangeEvent, ReactNode, useId } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Button from "./Button";
import { MdOutlineClear } from "react-icons/md";
import { ErrorType } from "./UserInfo";
import { capitalize } from "@/utils/helpers";

interface IInfoInput {
  label: string;
  type: HTMLInputElement["type"];
  placeHolder: string;
  error: ErrorType;
  value: string;
  setValue: ((value: string) => void) | null;
  clearHandler: (() => void) | null;
  remark?: ReactNode;
  notice?: string;
}

const InfoInput = ({
  label,
  type,
  placeHolder = "",
  error,
  value,
  setValue,
  clearHandler,
  remark,
  notice,
}: IInfoInput) => {
  const id = useId();

  const changeHandler =
    setValue === null
      ? null
      : (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
  const onChangeProps =
    changeHandler === null ? {} : { onChange: changeHandler };

  return (
    <div className="grid w-full items-center gap-1 mb-1">
      <div className="flex flex-row">
        <Label htmlFor={id}>{capitalize(label)}</Label>
        {!!remark && remark}
      </div>
      <div className="flex w-full">
        <Input
          type={type}
          id={id}
          name={label}
          placeholder={placeHolder}
          value={value}
          className="flex-1"
          disabled={!setValue}
          {...onChangeProps}
        />
        {value && clearHandler && (
          <Button clickHandler={clearHandler}>
            <MdOutlineClear className="w-6 h-6 text-accentPink-800 hover:text-accentPink-600" />
          </Button>
        )}
      </div>
      {notice && <div className="text-accentBlue-500 text-sm">{notice}</div>}
      {error?.[label] && (
        <div className="text-red-800 text-sm">{error[label]}</div>
      )}
    </div>
  );
};

export default InfoInput;

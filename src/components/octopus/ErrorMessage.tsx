import React from "react";

import Button from "./Button";

interface IErrorMessage {
  error: Error;
  errorHandler: () => void;
}

const ErrorMessage = ({ error, errorHandler }: IErrorMessage) => {
  return (
    <div className="flex-1 flex gap-2 items-center justify-center flex-col h-full">
      <p>{error.message}</p>
      <Button variant="action" clickHandler={errorHandler}>
        Try Again
      </Button>
    </div>
  );
};

export default ErrorMessage;

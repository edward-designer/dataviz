"use client";

import { useEffect } from "react";

import toast from "react-hot-toast";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <div>
      <h2>Sorry, something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
};

export default Error;

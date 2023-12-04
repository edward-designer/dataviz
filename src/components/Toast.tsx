"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const Toast = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              background: "#000000DD",
              color: "#13d9fb",
            },
          }}
        />
      </div>
      {children}
    </>
  );
};

export default Toast;

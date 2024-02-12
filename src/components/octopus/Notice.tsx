import React, { PropsWithChildren, PropsWithoutRef } from "react";

const Notice = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-center gap-2 my-2 bg-black/40 p-2 text-sm leading-tight md:justify-center">
      {children}
    </div>
  );
};

export default Notice;

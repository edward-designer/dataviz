import { PropsWithChildren } from "react";

const NotCurrentlySupported = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};

export default NotCurrentlySupported;

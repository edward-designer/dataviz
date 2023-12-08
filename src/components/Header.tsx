import { ComponentPropsWithoutRef } from "react";
import Image from "next/image";

import UserInfo from "./octopus/UserInfo";

import logo from "../../public/octoprice-light.svg";
import Menu from "./octopus/Menu";
import Link from "next/link";

const Header = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) => {
  return (
    <>
      <header
        className={`flex gap-4 justify-between items-center ${className} py-4 z-50`}
        {...props}
      >
        <Link href="/">
          <Image
            priority
            src={logo}
            alt="Octoprice logo"
            className="w-40 h-auto "
          />
        </Link>
        <div className="flex items-center gap-4">
          <UserInfo />
          <Menu />
        </div>
      </header>
    </>
  );
};

export default Header;

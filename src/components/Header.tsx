import Image from "next/image";
import { ComponentPropsWithoutRef } from "react";
import logo from "../../public/octoprice-light.svg";

const Header = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"header">) => {
  return (
    <header
      className={`flex gap-4 justify-center items-center ${className} py-4`}
      {...props}
    >
      <Image priority src={logo} alt="Octoprice logo" />
      <nav className="flex-1">Menu</nav>
      <div>PostCode</div>
    </header>
  );
};

export default Header;

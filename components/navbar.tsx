import React from "react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <div>
      <Button variant="ghost" size="icon" className=" md:hidden">
        <Menu color="red" />
      </Button>
    </div>
  );
};

export default Navbar;

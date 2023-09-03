import Image from "next/image";
import Link from "next/link";
import React from "react";
import imglogo from "../public/logo.png";

const Sidebar = () => {
  return (
    <div className=" space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="  px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-7 h-7 mr-4">
            <Image alt="logo" src={imglogo} />
          </div>
          <h1 className=" font-bold">Dune Ai</h1>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=" h-full relative">
      <div className=" hidden h-full md:flex flex-col md:w-72 md:fixed md:inset-y-0 z-[80] bg-gray-800 ">
        <div>
          {" "}
          <Sidebar />{" "}
        </div>
      </div>
      <main className="md:pl-72">
        <Navbar /> {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

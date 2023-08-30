import Navbar from "@/components/navbar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=" h-full relative">
      <div className=" hidden h-full md:flex flex-col md:w-72 md:fixed md:inset-y-0 bg-gray-800 ">
        <div>Hello Sidebar</div>
        <div>
          <Navbar />
        </div>
      </div>
      <main className=" md:pl-72">Center Sidebar {children}</main>{" "}
    </div>
  );
};

export default DashboardLayout;

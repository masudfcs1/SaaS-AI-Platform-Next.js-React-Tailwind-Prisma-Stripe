import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full relative bg-white dark:bg-[#111827] min-h-screen transition-colors duration-200">
      <div className="hidden h-full md:flex flex-col md:w-72 md:fixed md:inset-y-0 z-[80] bg-[#111827] border-r border-zinc-200 dark:border-white/10">
        <Sidebar />
      </div>
      <main className="md:pl-72 pb-12">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

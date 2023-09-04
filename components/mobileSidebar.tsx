"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState, useEffect } from "react";

const MobileSidebar = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return "This is never prerendered";
  } else "Prerendered";

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className=" md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className=" p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;

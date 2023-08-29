import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const LandingPage = () => {
  return (
    <>
      <div>LandingPage(UN-PROT....) </div>
      <div className=" space-x-5 ">
        <Link href="/sign-in">
          <Button className=" bg-cyan-500">Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button className="bg-cyan-500">Regrister</Button>
        </Link>
      </div>
    </>
  );
};

export default LandingPage;

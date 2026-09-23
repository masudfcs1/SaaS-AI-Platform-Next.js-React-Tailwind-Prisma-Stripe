import type { ReactNode } from "react";
import "./landing.css";

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="landing-page min-h-screen">
      {children}
    </div>
  );
};

export default LandingLayout;

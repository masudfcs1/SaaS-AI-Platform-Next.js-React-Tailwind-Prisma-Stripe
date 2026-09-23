import type { ReactNode } from "react";

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
};

export default LandingLayout;

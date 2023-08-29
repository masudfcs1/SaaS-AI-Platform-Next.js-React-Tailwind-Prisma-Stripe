import { UserButton } from "@clerk/nextjs";

const Dashboard = () => {
  return (
    <>
      <div>
        Dashboard Page Protected
        <h1>
          <UserButton afterSignOutUrl="/" />
        </h1>
      </div>
    </>
  );
};

export default Dashboard;

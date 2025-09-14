import { Menu, ShipWheel, X } from "lucide-react";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import { SignIn, useUser } from "@clerk/clerk-react";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser();

  return user ? (
    <div className="flex flex-col items-start  justify-start h-screen">
      <nav className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200">
        <div className="pl-5">
          <div
            className="flex items-center gap-2.5"
            onClick={() => navigate("/")}
          >
            <ShipWheel className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide cursor-pointer">
              Verbia.ai
            </span>
          </div>
        </div>
        {sidebar ? (
          <X
            className="size-6 text-gray-600 sm:hidden"
            onClick={() => setSidebar(false)}
          />
        ) : (
          <Menu
            className="size-6 text-gray-600 sm:hidden"
            onClick={() => setSidebar(true)}
          />
        )}
      </nav>

      <div className="flex-1 w-full flex h-[calc(100vh-64px)]">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 bg-[#F4F7FB]">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen ">
      <SignIn />
    </div>
  );
};

export default Layout;

import { Link } from "react-router";
import { ArrowRight, ShipWheel } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32">
      <div className="pl-2 sm:pl-5">
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5">
          <ShipWheel className="size-6 sm:size-8 md:size-9 text-primary" />
          <span className="text-lg sm:text-2xl md:text-3xl font-bold font-mono bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide">
            VerbiaAi
          </span>
        </Link>
      </div>
      {user ? (
        <UserButton />
      ) : (
        <button
          className="flex items-center gap-1 sm:gap-2 rounded-full text-xs sm:text-sm cursor-pointer bg-primary text-white px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5"
          onClick={openSignIn}
        >
          <span className="hidden sm:inline">Get Started</span>
          <span className="sm:hidden">Start</span>
          <ArrowRight className="size-3 sm:size-4" />
        </button>
      )}
    </div>
  );
};

export default Navbar;

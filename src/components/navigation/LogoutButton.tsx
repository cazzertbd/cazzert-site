import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { RiLogoutCircleRLine } from "react-icons/ri";

// Helper function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part !== undefined) {
      return part.split(";").shift() || null;
    }
  }
  return null;
}

const LogoutButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { execute: logout, isPending } = useAstroAction(actions.auth.logout);

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const isLoggedInCookie = getCookie("isLoggedIn");
        setIsLoggedIn(isLoggedInCookie === "true");
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
      localStorage.removeItem("user");

      // Show brief feedback before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  // Don't render anything if not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="group relative">
      <button
        onClick={handleLogout}
        disabled={isPending || isLoggingOut}
        aria-label="Logout"
        className={`text-text-muted hover:bg-bg hover:text-primary focus:ring-primary/30 relative cursor-pointer rounded-full p-2 transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          isLoggingOut ? "bg-red-50 text-red-600" : ""
        }`}
      >
        {isLoggingOut ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600"></div>
        ) : (
          <RiLogoutCircleRLine className="h-5 w-5" />
        )}
      </button>

      {/* Tooltip on hover */}
      <span className="bg-bg-alt text-text-base border-border/20 pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {isLoggingOut ? "Logging out..." : "Logout"}
      </span>
    </div>
  );
};

export default LogoutButton;

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { isAuthenticated, getUserRole } from "@/lib/utils";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const { toast } = useToast();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const openAuthModal = (mode: "signIn" | "signUp") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-primary font-bold text-xl cursor-pointer">JobHub</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className={`${isActive("/") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </Link>
                <Link href="/jobs" className={`${isActive("/jobs") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Jobs
                </Link>
                {(isLoggedIn && userRole === "jobseeker") && (
                  <Link href="/resume-builder" className={`${isActive("/resume-builder") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Resume Builder
                  </Link>
                )}
                {isLoggedIn ? (
                  userRole === "employer" ? (
                    <Link href="/employer/dashboard" className={`${isActive("/employer/dashboard") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Dashboard
                    </Link>
                  ) : (
                    <Link href="/jobseeker/dashboard" className={`${isActive("/jobseeker/dashboard") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Dashboard
                    </Link>
                  )
                ) : (
                  <Link href="/for-employers" className={`${isActive("/for-employers") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    For Employers
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isLoggedIn ? (
                <>
                  {userRole === "employer" && (
                    <Link href="/post-job">
                      <Button variant="outline" className="mr-2">
                        Post a Job
                      </Button>
                    </Link>
                  )}
                  <Button variant="default" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => openAuthModal("signIn")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => openAuthModal("signUp")}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button
                variant="ghost"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={toggleMobileMenu}
                aria-expanded={showMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {showMobileMenu ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className={`${
                  isActive("/")
                    ? "bg-primary-50 border-primary text-primary-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link 
                href="/jobs"
                className={`${
                  isActive("/jobs")
                    ? "bg-primary-50 border-primary text-primary-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setShowMobileMenu(false)}
              >
                Jobs
              </Link>
              {(isLoggedIn && userRole === "jobseeker") && (
                <Link 
                  href="/resume-builder"
                  className={`${
                    isActive("/resume-builder")
                      ? "bg-primary-50 border-primary text-primary-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Resume Builder
                </Link>
              )}
              {isLoggedIn ? (
                userRole === "employer" ? (
                  <Link 
                    href="/employer/dashboard"
                    className={`${
                      isActive("/employer/dashboard")
                        ? "bg-primary-50 border-primary text-primary-700"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/jobseeker/dashboard"
                    className={`${
                      isActive("/jobseeker/dashboard")
                        ? "bg-primary-50 border-primary text-primary-700"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                )
              ) : (
                <Link 
                  href="/for-employers"
                  className={`${
                    isActive("/for-employers")
                      ? "bg-primary-50 border-primary text-primary-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  For Employers
                </Link>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                {isLoggedIn ? (
                  <>
                    {userRole === "employer" && (
                      <Link 
                        href="/post-job"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Post a Job
                      </Link>
                    )}
                    <button
                      className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      onClick={() => {
                        openAuthModal("signIn");
                        setShowMobileMenu(false);
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      onClick={() => {
                        openAuthModal("signUp");
                        setShowMobileMenu(false);
                      }}
                    >
                      Create Account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}

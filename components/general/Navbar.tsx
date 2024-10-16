"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import { logout } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/images/logo.png";

const Navbar = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();

  const sidebarRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const handleLogout = () => {
    router.push("/login");
    dispatch(logout());
  };

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        openSidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpenSidebar(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () =>
      document.removeEventListener("mousedown", checkIfClickedOutside);
  }, [openSidebar]);

  return (
    <div className="flex items-center justify-between gap-10 lg:px-16 pl-4 pr-7 z-[999] py-3 bg-secondary sticky top-0 shadow-sm">
      <div
        onClick={() => router.push("/")}
        className="flex items-center cursor-pointer"
      >
        <Image src={Logo} width={60} height={60} alt="Job Nest" />
        <h1 className="text-xl">Job Nest</h1>
      </div>
      <div onClick={() => setOpenSidebar(true)} className="lg:hidden block">
        <GiHamburgerMenu className="text-xl cursor-pointer" />
      </div>
      <div
        ref={sidebarRef}
        className={`lg:static fixed top-0 ${
          openSidebar ? "right-0" : "-right-[3000px]"
        } transition-all bottom-0 lg:shadow-none shadow-xl lg:w-auto w-[200px] lg:p-0 p-7 bg-secondary lg:flex lg:flex-1`}
      >
        <AiOutlineClose
          onClick={() => setOpenSidebar(false)}
          className="float-right text-xl mb-5 lg:hidden cursor-pointer"
        />
        <div className="clear-both" />
        <div className="flex-1 lg:flex-row flex-col flex lg:items-center items-start text-sm lg:gap-7 gap-4">
          <Link
            href="/"
            className={`navbar-link ${
              pathname === "/" || pathname === "/index" ? "active" : undefined
            }`}
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className={`navbar-link ${
              pathname === "/jobs" ? "active" : undefined
            }`}
          >
            Find Jobs
          </Link>
          {(auth.user?.role?.name === "organization" ||
            auth.user?.role?.name === "Authenticated") && (
            <Link
              href="/find_candidate"
              className={`navbar-link ${
                pathname === "/find_candidate" ? "active" : undefined
              }`}
            >
              Find Candidates
            </Link>
          )}
        </div>
        <div className="text-sm flex lg:flex-row flex-col lg:items-center items-start lg:gap-8 gap-4 mt-10 lg:mt-0">
          {!auth.accessToken ? (
            <>
              <Link
                href="/login"
                className={`navbar-link ${
                  pathname === "/login" ? "active" : undefined
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`px-6 py-2 border-2 rounded-full border-[#504ED7] ${
                  pathname === "/register" ||
                  pathname === "/register/jobseeker" ||
                  pathname === "/register/organization"
                    ? "bg-[#504ED7] text-white"
                    : "text-[#504ED7]"
                }`}
              >
                Register Now
              </Link>
            </>
          ) : (
            <>
              {auth.user?.role?.name === "jobseeker" ? (
                <>
                  <Link
                    href="/edit_profile"
                    className={`navbar-link ${
                      pathname === "/edit_profile" ? "active" : undefined
                    }`}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/received_invitation"
                    className={`navbar-link ${
                      pathname === "/received_invitation" ? "active" : undefined
                    }`}
                  >
                    Invitation
                  </Link>
                  <Link
                    href="/job_applied"
                    className={`navbar-link ${
                      pathname === "/job_applied" ? "active" : undefined
                    }`}
                  >
                    Jobs Applied
                  </Link>
                </>
              ) : auth.user?.role?.name === "organization" ? (
                <>
                  <Link
                    href="/organization/jobs"
                    className={`navbar-link ${
                      pathname === "/organization/jobs" ? "active" : undefined
                    }`}
                  >
                    Jobs Posted
                  </Link>
                  <Link
                    href="/sent_invitation"
                    className={`navbar-link ${
                      pathname === "/sent_invitation" ? "active" : undefined
                    }`}
                  >
                    Sent Invitation
                  </Link>
                </>
              ) : (
                <Link href="/organization/approval" className="navbar-link">
                  Dashboard
                </Link>
              )}
              <div onClick={handleLogout}>
                <p className="navbar-link cursor-pointer">Logout</p>
              </div>
              <div>
                <p>Hi, {auth.user?.username}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

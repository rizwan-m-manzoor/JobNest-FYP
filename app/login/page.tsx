"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FormSubmit, InputChange } from "./../../utils/Interface";
import { login } from "./../../redux/slices/authSlice";
import { validateEmail } from "./../../utils/validator";
import { AppDispatch, RootState } from "./../../redux/store";
import Head from "next/head";
import Link from "next/link";
import Loader from "./../../components/general/Loader";
import Footer from "./../../components/general/Footer";
import Navbar from "./../../components/general/Navbar";

const Login = () => {
  const [userData, setUserData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("r");
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const alert = useSelector((state: RootState) => state.alert);

  const handleChange = (e: InputChange) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e: FormSubmit) => {
    e.preventDefault();

    if (!userData.identifier) {
      return dispatch({
        type: "alert/alert",
        payload: { error: "Please provide email to login." },
      });
    }

    if (!validateEmail(userData.identifier)) {
      return dispatch({
        type: "alert/alert",
        payload: { error: "Please provide valid email address." },
      });
    }

    if (!userData.password) {
      return dispatch({
        type: "alert/alert",
        payload: { error: "Please provide password to login." },
      });
    }

    await dispatch(login(userData));
    setUserData({ identifier: "", password: "" });
  };

  useEffect(() => {
    if (auth.accessToken) {
      if (redirectPath && redirectPath !== "email-confirmed") {
        router.push(`/${redirectPath}`);
      } else {
        router.push("/");
      }
    }
  }, [auth, router, redirectPath]);

  useEffect(() => {
    if (redirectPath === "email-confirmed") {
      dispatch({
        type: "alert/alert",
        payload: { success: "Your Email has been confirmed." },
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Job Nest | Sign In</title>
      </Head>
      <Navbar />
      <div className="flex flex-col" style={{ minHeight: "70vh" }}>
        <div className="bg-background px-10 py-14 flex-grow">
          <div className="bg-background shadow-md w-full max-w-[400px] border border-gray-300 m-auto px-6 py-12">
            <h1 className="text-xl text-center mb-7 text-gray-600">
              Sign In to Job Nest
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-7">
                <label htmlFor="identifier" className="text-sm">
                  Email
                </label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={userData.identifier}
                  onChange={handleChange}
                  placeholder="me@example.com"
                  className="bg-background w-full outline-0 border border-gray-300 px-2 py-3 text-sm rounded-md mt-3"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 mt-3 rounded-md px-2 py-3 gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    className="bg-background w-full outline-0 text-sm"
                  />
                  {showPassword ? (
                    <AiFillEyeInvisible
                      onClick={() => setShowPassword(false)}
                      className="text-gray-400 cursor-pointer"
                    />
                  ) : (
                    <AiFillEye
                      onClick={() => setShowPassword(true)}
                      className="text-gray-400 cursor-pointer"
                    />
                  )}
                </div>
                <Link
                  href="/forgot_password"
                  className="text-blue-500 text-xs mt-2 float-right outline-0"
                >
                  Forgot password?
                </Link>
                <div className="clear-both" />
              </div>
              <button
                type="submit"
                className={`${
                  alert.loading
                    ? "bg-gray-200 hover:bg-gray-200 cursor-auto"
                    : "bg-[#504ED7] hover:bg-[#2825C2] cursor-pointer"
                } outline-0 transition-[background] w-full text-white py-2 mt-6`}
              >
                {alert.loading ? <Loader /> : "SIGN IN"}
              </button>
            </form>
            <p className="text-sm text-gray-500 text-center mt-8">
              Don't have a Job Nest account yet?{" "}
              <Link href="/register" className="text-blue-500 outline-0">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;

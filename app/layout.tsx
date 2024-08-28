"use client";

import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import DataProvider, { AppDispatch } from "../redux/store";
import Alert from "../components/general/Alert";
import UserDescriptionModal from "../components/modal/UserDescriptionModal";
import "../styles/globals.css";
import { getLoginData } from "@/redux/slices/authSlice";

interface IProps {
  children: ReactNode;
}

const App = ({ children }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getLoginData());
  }, [dispatch]);

  return <>{children}</>;
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <Alert />
          <UserDescriptionModal />
          <App>{children}</App>
        </DataProvider>
      </body>
    </html>
  );
}

"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch } from "../../../redux/store";

interface IProps {
  success?: string;
  error?: string;
}

export default function ActivateAccountClient({ success, error }: IProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    if (success) {
      dispatch({
        type: "alert/alert",
        payload: { success: success },
      });
    } else if (error) {
      dispatch({
        type: "alert/alert",
        payload: { error: error },
      });
    }

    router.push("/login");
  }, [dispatch, router, error, success]);

  return <></>;
}

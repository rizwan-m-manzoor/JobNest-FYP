import { IRegister } from "./Interface";
import { uploadFile } from "./uploadHelper";
import { postDataAPI } from "./fetchData";
import { Dispatch } from "@reduxjs/toolkit";

export const register = async (
  userData: IRegister,
  avatar: File[] = [],
  dispatch: Dispatch
) => {
  try {
    dispatch({
      type: "alert/alert",
      payload: {
        loading: true,
      },
    });

    let data = { ...userData };

    if (userData.role === "organization") {
      const imgUrl = await uploadFile(avatar, "avatar");
      data.avatar = imgUrl[0];
    }

    const res = await postDataAPI(
      "auth/local/register",
      data,
      process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
    );
    dispatch({
      type: "alert/alert",
      payload: {
        success: `An account activation link has been sent to ${res.data.user.email}`,
      },
    });
  } catch (err: any) {
    dispatch({
      type: "alert/alert",
      payload: {
        error: err.response.data.error.name,
      },
    });
  }
};

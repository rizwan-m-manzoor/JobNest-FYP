import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { IEditProfile, IUserLogin, IAuth } from "./../../utils/Interface";
import { getDataAPI, patchDataAPI, postDataAPI } from "./../../utils/fetchData";
import { uploadFile } from "./../../utils/uploadHelper";
import Cookie from "js-cookie";

interface IEditProfileType extends IEditProfile {
  tempAvatar: File[];
  tempCv: File[];
  token: string;
}

export const login = createAsyncThunk(
  "auth/login",
  async (userData: IUserLogin, thunkAPI) => {
    try {
      thunkAPI.dispatch({ type: "alert/alert", payload: { loading: true } });

      const res = await postDataAPI(
        "auth/local",
        userData,
        process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
      );
      // localStorage.setItem("jobnest_logged", "true");

      // Cookie.set('jobnest_rfToken', res.data.refreshToken, {
      //   expires: 30
      // })

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { success: `Authorized as ${res.data.user.username}` },
      });

      console.log(res.data, "here at testing response");

      // return {
      //   accessToken: res.data.jwt,
      //   user: res.data.user
      // }
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { error: err.response.data.error.message },
      });
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    const logged = localStorage.getItem("jobnest_logged");
    if (logged !== "true") return;

    try {
      const res = await getDataAPI("auth/refresh_token");
      return res.data;
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { error: err.response.data.msg },
      });
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  localStorage.removeItem("jobnest_logged");

  Cookie.remove("jobnest_rfToken");

  thunkAPI.dispatch({
    type: "alert/alert",
    payload: { success: "Logout success." },
  });

  return {};
});

export const editProfile = createAsyncThunk(
  "auth/editProfile",
  async (profileData: IEditProfileType, thunkAPI) => {
    try {
      thunkAPI.dispatch({ type: "alert/alert", payload: { loading: true } });

      let avatarUrl = "";
      let cvUrl = "";

      if (profileData.tempAvatar.length > 0) {
        let url = await uploadFile(profileData.tempAvatar, "avatar");
        avatarUrl = url[0];
      }

      if (profileData.tempCv.length > 0) {
        let url = await uploadFile(profileData.tempCv, "cv");
        cvUrl = url[0];
      }

      const res = await patchDataAPI(
        "jobseeker",
        {
          ...profileData,
          avatar: avatarUrl ? avatarUrl : profileData.avatar,
          cv: cvUrl ? cvUrl : profileData.cv,
        },
        profileData.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { success: res.data.msg },
      });

      return {
        accessToken: profileData.token,
        user: res.data.user,
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { error: err.response.data.msg },
      });
    }
  }
);

const initialState: IAuth = {};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => {
        return (
          action.type.startsWith("auth/") && action.type.endsWith("/fulfilled")
        );
      },
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default authSlice.reducer;

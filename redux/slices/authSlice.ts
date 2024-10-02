import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { IEditProfile, IUserLogin, IAuth } from "./../../utils/Interface";
import { postDataAPI, putDataAPI } from "./../../utils/fetchData";
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

      const res = await postDataAPI("auth/local", userData);
      localStorage.setItem("jobnest_logged", "true");

      Cookie.set(
        "jobnest_login_data",
        JSON.stringify({
          accessToken: res.data.jwt,
          user: res.data.user,
        }),
        {
          expires: 30,
        }
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { success: `Authorized as ${res.data.user.username}` },
      });

      return {
        accessToken: res.data.jwt,
        user: res.data.user,
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { error: err.response.data.error.message },
      });
    }
  }
);

export const getLoginData = createAsyncThunk(
  "auth/getLoginData",
  async (_, thunkAPI) => {
    try {
      const logged = localStorage.getItem("jobnest_logged");
      if (logged !== "true") return {};

      const cookieData = Cookie.get("jobnest_login_data");
      const loginData = cookieData ? JSON.parse(cookieData) : {};

      return loginData;
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          error: err.message || "Something went wrong, please login again.",
        },
      });
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  localStorage.removeItem("jobnest_logged");

  Cookie.remove("jobnest_login_data");

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

      const res = await putDataAPI(
        `users/${profileData.userId}`,
        {
          ...profileData,
          avatar: avatarUrl ? avatarUrl : profileData.avatar,
          cv: cvUrl ? cvUrl : profileData.cv,
        },
        profileData.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { success: "Profile updated." },
      });

      // Retrieve the current cookie
      const existingCookie = Cookie.get("jobnest_login_data");
      const loginData = existingCookie ? JSON.parse(existingCookie) : {};

      // Update the user information while keeping the JWT token the same
      loginData.user = res.data;

      // Set the updated cookie
      Cookie.set("jobnest_login_data", JSON.stringify(loginData), {
        expires: 30,
      });

      return {
        accessToken: loginData.accessToken,
        user: res.data,
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { error: err.response.data.error.message },
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

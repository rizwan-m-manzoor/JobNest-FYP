import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../store";
import { getDataAPI, putDataAPI } from "./../../utils/fetchData";
import { IOrganization, IOrganizationState } from "./../../utils/Interface";

interface IGetOrganizationType {
  token: string;
  page: number;
}

interface IChangeStatusType {
  id: string;
  token: string;
}

export const getUnapprovedOrganizations = createAsyncThunk(
  "organization/getUnapproved",
  async (data: IGetOrganizationType, thunkAPI) => {
    try {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          loading: true,
        },
      });

      const res = await getDataAPI(
        `organizations?populate[0]=users_permissions_user&filters[status][$eq]=on review&pagination[page]=${data.page}&pagination[pageSize]=6`,
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {},
      });

      const mappedResponse = res.data.data?.map(({ id, attributes }: any) => {
        const {
          phoneNumber,
          totalEmployee,
          industryType,
          address,
          description,
          status,
          createdDate,
          createdAt,
          updatedAt,
          users_permissions_user,
        } = attributes;
        const { id: userId, attributes: userAttributes } =
          users_permissions_user.data;
        const {
          username,
          email,
          avatar,
          province,
          city,
          district,
          postalCode,
          type,
        } = userAttributes;

        return {
          id,
          phoneNumber,
          totalEmployee,
          industryType,
          address,
          description,
          status,
          createdDate,
          createdAt,
          updatedAt,
          user: {
            id: userId,
            username,
            email,
            password: "",
            avatar,
            province,
            city,
            district,
            postalCode,
            type,
            createdAt: userAttributes.createdAt,
            updatedAt: userAttributes.updatedAt,
          },
        };
      });

      return {
        data: mappedResponse,
        totalPage: res.data?.meta?.pagination.pageCount,
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          error: err.response.data.error.message,
        },
      });
    }
  }
);

export const acceptOrganization = createAsyncThunk(
  "organization/accept",
  async (data: IChangeStatusType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).organization;

      const res = await putDataAPI(
        `organizations/${data.id}`,
        {
          data: {
            status: "accepted",
          },
        },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: `${res.data.users_permissions_user?.username} accepted successfully.`,
        },
      });

      return {
        ...state,
        data: state.data.filter((item: IOrganization) => item.id !== data.id),
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          error: err.response.data.error.message,
        },
      });
    }
  }
);

export const rejectOrganization = createAsyncThunk(
  "organization/reject",
  async (data: IChangeStatusType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).organization;

      const res = await putDataAPI(
        `organizations/${data.id}`,
        {
          data: {
            status: "rejected",
          },
        },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: `${res.data.users_permissions_user?.username} rejected successfully.`,
        },
      });

      return {
        ...state,
        data: state.data.filter((item: IOrganization) => item.id !== data.id),
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          error: err.response.data.error.message,
        },
      });
    }
  }
);

const initialState: IOrganizationState = {
  data: [],
  totalPage: 0,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => {
        return (
          action.type.startsWith("organization/") &&
          action.type.endsWith("/fulfilled")
        );
      },
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default organizationSlice.reducer;

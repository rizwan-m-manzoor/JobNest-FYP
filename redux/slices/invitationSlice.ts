import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../store";
import { getDataAPI, postDataAPI, putDataAPI } from "./../../utils/fetchData";
import { IInvitation } from "./../../utils/Interface";

export interface ISendInvitationType {
  jobId: string;
  userId: string;
  token: string;
}

export interface IChangeStatusType {
  id: string;
  status: string;
  token: string;
}

export const sendInvitation = createAsyncThunk(
  "invitation/send",
  async (data: ISendInvitationType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).invitation;
      const res = await postDataAPI(
        "invitations",
        { data: { job: data.jobId, users_permissions_user: data.userId } },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: "Invitation sent successfully.",
        },
      });

      const formattedResponsedObject = {
        id: res.data.data?.id,
        ...res.data.data?.attributes,
      };

      return [formattedResponsedObject, ...state];
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

export const getReceivedInvitations = createAsyncThunk(
  "invitation/get",
  async (token: string, thunkAPI) => {
    try {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          loading: true,
        },
      });

      const res = await getDataAPI(
        "invitations?populate[job][populate][skills]=true&populate[job][populate][keywords]=true&populate[job][populate][organization][populate][users_permissions_user]=true&populate[job][populate][category]=true",
        token
      );

      const mappedResponse = res.data?.data?.map(({ id, attributes }: any) => {
        const { job, ...restAttributes } = attributes;

        const {
          category,
          organization,
          skills,
          keywords,
          ...restJobAttributes
        } = job.data.attributes;

        const { users_permissions_user, ...restOrganizationAttributes } =
          organization.data.attributes;

        return {
          id,
          ...restAttributes,
          job: {
            id: job.data.id,
            ...restJobAttributes,
            organization: {
              id: organization?.data?.id,
              ...restOrganizationAttributes,
              user: {
                id: users_permissions_user?.data?.id,
                ...users_permissions_user?.data?.attributes,
              },
            },
            skills: skills.data?.map(
              (item: any) => item?.attributes?.jobSeekerSkill
            ),
            keywords: keywords.data?.map(
              (item: any) => item?.attributes?.jobKeyword
            ),
            category: category?.data?.id,
          },
        };
      });

      console.log(mappedResponse, "here at mappedResponse");

      return mappedResponse;
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

export const changeInvitationStatus = createAsyncThunk(
  "invitation/change",
  async (data: IChangeStatusType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).invitation;

      const res = await putDataAPI(
        `invitations/${data.id}`,
        { data: { status: data.status } },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success:
            res.data.data.attributes.status === "accepted"
              ? "Invitation accepted successfully."
              : "Invitation rejected.",
        },
      });

      return state.map((item: IInvitation) =>
        item.id === data.id ? { ...item, status: data.status } : item
      );
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

const initialState: IInvitation[] = [];

const invitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => {
        return (
          action.type.startsWith("invitation/") &&
          action.type.endsWith("/fulfilled")
        );
      },
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default invitationSlice.reducer;

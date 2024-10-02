import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../store";
import { getDataAPI, putDataAPI } from "./../../utils/fetchData";
import { IApplicant } from "./../../utils/Interface";

interface IGetApplicantType {
  jobId: string;
  token: string;
}

interface IChangeStatusSlice extends IGetApplicantType {
  jobseeker: string;
  status: string;
}

export const getApplicants = createAsyncThunk(
  "applicant/get",
  async (data: IGetApplicantType, thunkAPI) => {
    try {
      const res = await getDataAPI(
        `jobs-applieds?populate[job]=true&populate[job_seeker][populate][users_permissions_user]=true&populate[job_seeker][populate][skills]=true&filters[job][id][$eq]=${data.jobId}`,
        data.token
      );
      const mappedResponse = res.data?.data?.map(({ id, attributes }: any) => {
        const { job, job_seeker, ...restAttributes } = attributes;

        const { users_permissions_user, skills, ...restJobSeekerAttributes } =
          job_seeker.data.attributes;

        return {
          id,
          ...restAttributes,
          job: job.data.id,
          jobseeker: {
            id: job_seeker?.data?.id,
            ...restJobSeekerAttributes,
            user: {
              id: users_permissions_user?.data?.id,
              ...users_permissions_user?.data?.attributes,
            },
            skills: skills.data?.map(
              (item: any) => item?.attributes?.jobSeekerSkill
            ),
          },
        };
      });
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

export const changeApplicantStatus = createAsyncThunk(
  "applicant/changeStatus",
  async (data: IChangeStatusSlice, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).applicant;
      await putDataAPI(
        `jobs-applieds/${data.jobseeker}`,
        { data: { status: data.status } },
        data.token
      );

      return state.map((item: IApplicant) =>
        item.job === data.jobId && item.jobseeker.id === data.jobseeker
          ? { ...item, status: data.status }
          : item
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

const initialState: IApplicant[] = [];

const applicantSlice = createSlice({
  name: "applicant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => {
        return (
          action.type.startsWith("applicant/") &&
          action.type.endsWith("/fulfilled")
        );
      },
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default applicantSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../store";
import {
  deleteDataAPI,
  getDataAPI,
  postDataAPI,
  putDataAPI,
} from "./../../utils/fetchData";
import { IJob, IJobState } from "./../../utils/Interface";

interface IGetJobType {
  token: string;
  page: number;
}

interface ICreateJobType extends IJob {
  token: string;
}

interface IDeleteJobType {
  id: string;
  token: string;
}

// interface IUpdateJobType extends IDeleteJobType, IJob {}

export const getJobPosition = createAsyncThunk(
  "job/position",
  async (token: string, thunkAPI) => {
    try {
      const userAuthState = (thunkAPI.getState() as RootState).auth;

      const res = await getDataAPI(
        `jobs?populate=*&filters[organization][$eq]=${userAuthState.user?.organization?.id}`,
        token
      );

      const mappedResponse = res.data.data?.map(({ id, attributes }: any) => {
        const {
          category,
          createdAt,
          updatedAt,
          publishedAt,
          employmentType,
          experienceRequired,
          expirationDate,
          invitations,
          jobLevel,
          jobs_applieds,
          keywords,
          organization,
          overview,
          position,
          requirements,
          salary,
          skills,
        } = attributes;

        const {
          organization: userOrganization,
          ...userObjectWithoutOrganization
        } = userAuthState.user || {};

        return {
          id,
          category: category?.data?.id,
          createdAt,
          updatedAt,
          publishedAt,
          employmentType,
          experienceRequired,
          expirationDate,
          jobLevel,
          keywords: keywords?.data?.map(
            (item: any) => item?.attributes?.jobKeyword
          ),
          organization: {
            id: organization?.data?.id,
            address: organization?.data?.attributes?.address,
            createdDate: organization?.data?.attributes?.createdDate,
            description: organization?.data?.attributes?.description,
            industryType: organization?.data?.attributes?.industryType,
            phoneNumber: organization?.data?.attributes?.phoneNumber,
            status: organization?.data?.attributes?.status,
            totalEmployee: organization?.data?.attributes?.totalEmployee,
            user: userObjectWithoutOrganization,
          },
          overview,
          position,
          requirements,
          salary,
          skills: skills?.data?.map(
            (item: any) => item?.attributes?.jobSeekerSkill
          ),
        };
      });

      return {
        data: mappedResponse,
        page: 1,
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

export const getJobs = createAsyncThunk(
  "job/get",
  async (data: IGetJobType, thunkAPI) => {
    try {
      const userAuthState = (thunkAPI.getState() as RootState).auth;

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { loading: true },
      });

      const res = await getDataAPI(
        `jobs?populate=*&filters[organization][$eq]=${userAuthState.user?.organization?.id}&pagination[page]=${data.page}&pagination[pageSize]=6`,
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {},
      });

      const mappedResponse = res.data.data?.map(({ id, attributes }: any) => {
        const {
          category,
          createdAt,
          updatedAt,
          publishedAt,
          employmentType,
          experienceRequired,
          expirationDate,
          invitations,
          jobLevel,
          jobs_applieds,
          keywords,
          organization,
          overview,
          position,
          requirements,
          salary,
          skills,
        } = attributes;

        const {
          organization: userOrganization,
          ...userObjectWithoutOrganization
        } = userAuthState.user || {};

        return {
          id,
          category: category?.data?.id,
          createdAt,
          updatedAt,
          publishedAt,
          employmentType,
          experienceRequired,
          expirationDate,
          jobLevel,
          keywords: keywords?.data?.map(
            (item: any) => item?.attributes?.jobKeyword
          ),
          organization: {
            id: organization?.data?.id,
            address: organization?.data?.attributes?.address,
            createdDate: organization?.data?.attributes?.createdDate,
            description: organization?.data?.attributes?.description,
            industryType: organization?.data?.attributes?.industryType,
            phoneNumber: organization?.data?.attributes?.phoneNumber,
            status: organization?.data?.attributes?.status,
            totalEmployee: organization?.data?.attributes?.totalEmployee,
            user: userObjectWithoutOrganization,
          },
          overview,
          position,
          requirements,
          salary,
          skills: skills?.data?.map(
            (item: any) => item?.attributes?.jobSeekerSkill
          ),
        };
      });

      return {
        data: mappedResponse,
        totalPage: res.data?.meta?.pagination.pageCount,
      };
    } catch (err: any) {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: { error: err.response.data.error.message },
      });
    }
  }
);

export const createJob = createAsyncThunk(
  "job/create",
  async (jobData: ICreateJobType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).job;
      const userAuthState = (thunkAPI.getState() as RootState).auth;

      const res = await postDataAPI(
        "jobs",
        {
          data: {
            ...jobData,
            organization: userAuthState.user?.organization?.id,
          },
        },
        jobData.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: "Job has been created successfully.",
        },
      });

      return {
        ...state,
        data: [{ id: res.data.data.id, ...jobData }, ...state.data],
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

export const deleteJob = createAsyncThunk(
  "job/delete",
  async (data: IDeleteJobType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).job;
      const res = await deleteDataAPI(`jobs/${data?.id}`, data.token);

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: "Job has been deleted successfully.",
        },
      });

      return {
        ...state,
        data: state.data.filter((item: IJob) => item.id !== data.id),
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

export const updateJob = createAsyncThunk(
  "job/update",
  async (data: ICreateJobType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).job;
      const res = await putDataAPI(
        `jobs/${data?.id}`,
        {
          data: {
            ...data,
          },
        },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: "Job has been updated successfully.",
        },
      });

      return {
        ...state,
        data: state.data.map((item: IJob) =>
          item.id === res.data.data.id ? data : item
        ),
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

const initialState: IJobState = {
  data: [],
  totalPage: 0,
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => {
        return (
          action.type.startsWith("job/") && action.type.endsWith("/fulfilled")
        );
      },
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default jobSlice.reducer;

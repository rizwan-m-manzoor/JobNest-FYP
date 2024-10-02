import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  deleteDataAPI,
  getDataAPI,
  postDataAPI,
  putDataAPI,
} from "../../utils/fetchData";
import { uploadFile } from "../../utils/uploadHelper";
import { ICategoryState, ICategory } from "../../utils/Interface";

interface IGetCategoryType {
  token: string;
  page: number;
}

interface ICreateCategoryType extends ICategory {
  token: string;
}

interface IUpdateCategoryType extends ICreateCategoryType {
  prevImg: string;
}

interface IDeleteCategoryType {
  id: string;
  token: string;
}

export const getCategory = createAsyncThunk(
  "category/get",
  async (data: IGetCategoryType, thunkAPI) => {
    try {
      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          loading: true,
        },
      });

      const res = await getDataAPI(
        `categories?pagination[page]=${data.page}&pagination[pageSize]=6`,
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {},
      });

      const mappedResponse = res.data.data?.map(({ id, attributes }: any) => {
        const { name, image } = attributes;

        return {
          id,
          name,
          image,
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

export const createCategory = createAsyncThunk(
  "category/create",
  async (data: ICreateCategoryType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).category;
      let imgUrl = await uploadFile(data.image as File[], "category");

      const res = await postDataAPI(
        "categories",
        { data: { ...data, image: imgUrl[0] } },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: "Category has been created successfully",
        },
      });

      const createdCategory = {
        id: res.data.data.id,
        ...res.data.data.attributes,
      };

      return {
        ...state,
        data: [createdCategory, ...state.data],
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

export const updateCategory = createAsyncThunk(
  "category/update",
  async (data: IUpdateCategoryType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).category;

      let newImgUrl;

      if (typeof data.image !== "string") {
        if (data.image.length > 0) {
          newImgUrl = await uploadFile(data.image, "category");
        }
      }

      const res = await putDataAPI(
        `categories/${data.id}`,
        { data: { ...data, image: newImgUrl ? newImgUrl[0] : data.prevImg } },
        data.token
      );

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: "Category has been updated successfully.",
        },
      });

      const updatedCategory = {
        id: res.data.data.id,
        ...res.data.data.attributes,
      };

      return {
        ...state,
        data: state.data?.map((item: ICategory) =>
          item?.id === updatedCategory?.id ? updatedCategory : item
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

export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (data: IDeleteCategoryType, thunkAPI) => {
    try {
      const state = (thunkAPI.getState() as RootState).category;

      const res = await deleteDataAPI(`categories/${data.id}`, data.token);

      const deletedCategory = {
        id: res.data.data.id,
        ...res.data.data.attributes,
      };

      thunkAPI.dispatch({
        type: "alert/alert",
        payload: {
          success: `${deletedCategory?.name} has been deleted successfully.`,
        },
      });

      return {
        ...state,
        data: state.data?.filter(
          (item: ICategory) => item.id !== deletedCategory?.id
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

const initialState: ICategoryState = {
  data: [],
  totalPage: 0,
};

const category = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => {
        return (
          action.type.startsWith("category/") &&
          action.type.endsWith("/fulfilled")
        );
      },
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default category.reducer;

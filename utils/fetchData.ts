import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL;
if (!API_URL) {
  throw new Error(
    "Please define the NEXT_PUBLIC_STRAPI_API_BASE_URL environment variable"
  );
}
const api = axios.create({
  baseURL: API_URL,
});

export const getDataAPI = async (url: string, token?: string) => {
  const res = await api.get(`/api/${url}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res;
};

export const postDataAPI = async (
  url: string,
  data: object,
  token?: string
) => {
  const res = await api.post(`/api/${url}`, data, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res;
};

export const putDataAPI = async (url: string, data: object, token?: string) => {
  const res = await api.put(`/api/${url}`, data, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res;
};

export const patchDataAPI = async (
  url: string,
  data: object,
  token?: string
) => {
  const res = await api.patch(`/api/${url}`, data, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res;
};

export const deleteDataAPI = async (url: string, token?: string) => {
  const res = await api.delete(`/api/${url}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res;
};

import { ChangeEvent, FormEvent } from "react";

export type InputChange = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export type FormSubmit = FormEvent<HTMLFormElement>;

export interface IJobseeker {
  id: string;
  cv?: string;
  dob?: string;
  status?: string;
  skills?: string[];
  about?: string;
  user?: IUser
}

export interface IEditProfile {
  avatar: string;
  username: string;
  dob: string;
  cv: string;
  province: string;
  city: string;
  district: string;
  postalCode: number;
  skills: string[];
  about: string;
  userId: string;
}

export interface IUser {
  id: string;
  username: string;
  password: string;
  email: string;
  avatar: string;
  type: string;
  role: Role;
  province: string;
  city: string;
  district: string;
  postalCode: number;
  createdAt?: string;
  job_seeker?: IJobseeker;
  organization?: IOrganization;
}
export interface Role {
  id: number;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserLogin {
  identifier: string;
  password: string;
}

export interface IActivationData {
  username: string;
  password: string;
  name: string;
}

export interface IDecodedToken {
  id: string;
  role: string;
}

export interface IRegister {
  username: string;
  password: string;
  role: string;
  avatar?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: number;
  address?: string;
  description?: string;
  createdDate?: string;
  totalEmployee?: number;
  industryType?: string;
  phoneNumber?: string;
}

export interface IProvinceData {
  name: string;
  state_code: string;
}

// export interface ICityData extends IProvinceData {
//   id_provinsi: string
// }

export interface IDistrictData extends IProvinceData {
  id_kota: string;
}

export interface IJob {
  id?: string;
  organization?: IOrganization;
  position: string;
  employmentType: string;
  jobLevel: string;
  skills: string[];
  experienceRequired: number;
  expirationDate: string;
  salary: number;
  overview: string;
  requirements: string;
  keywords: string[];
  createdAt?: string;
  category?: string;
}

export interface IJobState {
  data: IJob[];
  totalPage: number;
}

export interface IInvitation {
  id?: string;
  job: IJob;
  user: IUser;
  status?: string;
}

export interface ICategory {
  id?: string;
  name: string;
  image: string | File[];
}

export interface ICategoryState {
  data: ICategory[];
  totalPage: number;
}

export interface IOrganization {
  id: string;
  phoneNumber: string;
  createdDate: string;
  totalEmployee: number;
  industryType: string;
  address: string;
  description: string;
  status: string;
  createdAt: string;
  user?: IUser;
}

export interface IOrganizationState {
  data: IOrganization[];
  totalPage: number;
}

export interface IApplicant {
  id: string;
  status: string;
  job: string;
  jobseeker: IJobseeker;
}

export interface IAlert {
  error?: string;
  success?: string;
  loading?: boolean;
}

export interface IAuth {
  accessToken?: string;
  user?: IUser;
}

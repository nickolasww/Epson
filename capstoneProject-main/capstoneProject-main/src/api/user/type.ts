import { TResponseData, TResponsePaginate } from "@/commons/types/response";
import { TRoleItem } from "../role/type";

export type TUserProjectAssignment = {
  project_id: string;
  assignment_type: string;
  team_type: string;
};

export type TUserItem = {
  id: string;
  name: string;
  email?: string;
  username?: string;
  login_type?: "username" | "email";
  created_at: string;
  updated_at: string;
  roles: Array<TRoleItem>;
  project_users?: TUserProjectAssignment[];
};

export type TUserCreateRequest = Omit<TUserItem, "id" | "created_at" | "updated_at" | "roles">;

export type TUserUpdateRequest = Omit<TUserItem, "created_at" | "updated_at" | "roles">;

export type TGetUsersParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  search?: string;
};

export type TUserPaginateResponse = TResponsePaginate<TUserItem>;

export type TUserDetailResponse = TResponseData<TUserItem>;

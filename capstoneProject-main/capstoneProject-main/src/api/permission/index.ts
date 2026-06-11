import {
  TPermissionCreateRequest,
  TPermissionDetailResponse,
  TGetPermissionsParams,
  TPermissionListResponse,
  TPermissionUpdateRequest,
} from "./type";

export const getPermissions = (
  params: TGetPermissionsParams
): Promise<TPermissionListResponse> => {
  console.log(params);
  return Promise.resolve({
    status_code: 200,
    data: {
      items: [
        {
          name: "View Role",
          key: "view-role",
          id: "145efcff-8ae5-4a6c-9900-05a855000622",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Update Permission",
          key: "update-permission",
          id: "000442db-5859-4c76-a9f3-2859b3870856",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Delete Permission",
          key: "delete-permission",
          id: "bcc60162-450c-497a-9998-2c50a87a8b15",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "View User",
          key: "view-user",
          id: "221724fc-3b56-481a-b222-46dd56469a7d",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Update User",
          key: "update-user",
          id: "913f59b8-3b2d-42dd-af0a-8d19f31678b2",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Create Permission",
          key: "create-permission",
          id: "91d83e8c-f892-4e1b-95be-9c37d0032711",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Delete Role",
          key: "delete-role",
          id: "470afb2e-3766-42ea-9480-cb6102d70c31",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Create User",
          key: "create-user",
          id: "406912d8-a004-4e44-a433-d2c1d0cdb0b6",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Create Role",
          key: "create-role",
          id: "afab9068-a09a-4814-b4db-d4c153a80ded",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          name: "Update Role",
          key: "update-role",
          id: "596b355f-9820-4b45-9ca6-eae594a13956",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
      ],
      meta: {
        total_page: 2,
        total: 12,
        page: 1,
        per_page: 10,
      },
    },
    version: "1.0.0",
  });
};

export const getPermission = (
  id: string
): Promise<TPermissionDetailResponse> => {
  console.log(id);
  return Promise.resolve({
    status_code: 200,
    data: {
      name: "View Role",
      key: "view-role",
      id: "145efcff-8ae5-4a6c-9900-05a855000622",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

export const createPermission = (
  data: TPermissionCreateRequest
): Promise<TPermissionDetailResponse> => {
  console.log(data);
  return Promise.resolve({
    status_code: 200,
    data: {
      name: "View Role",
      key: "view-role",
      id: "145efcff-8ae5-4a6c-9900-05a855000622",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

export const updatePermission = (
  id: string,
  data: TPermissionUpdateRequest
): Promise<TPermissionDetailResponse> => {
  console.log(id, data);
  return Promise.resolve({
    status_code: 200,
    data: {
      name: "View Role",
      key: "view-role",
      id: "145efcff-8ae5-4a6c-9900-05a855000622",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

export const deletePermission = (
  id: string
): Promise<TPermissionDetailResponse> => {
  console.log(id);
  return Promise.resolve({
    status_code: 200,
    data: {
      name: "View Role",
      key: "view-role",
      id: "145efcff-8ae5-4a6c-9900-05a855000622",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

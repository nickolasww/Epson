import {
  TRoleCreateRequest,
  TRoleDetailResponse,
  TRoleGetRequest,
  TRoleListResponse,
  TRoleUpdateRequest,
} from "./type";

export const getRoles = (
  params: TRoleGetRequest,
): Promise<TRoleListResponse> => {
  console.log(params);
  return Promise.resolve({
    status_code: 200,
    data: {
      items: [
        {
          permissions: [
            {
              name: "View Role",
              key: "view-role",
              id: "145efcff-8ae5-4a6c-9900-05a855000622",
              created_at: null,
              updated_at: null,
              deleted_at: null,
            },
          ],
          name: "Admin",
          key: "admin",
          id: "9b89100c-fd49-4b87-b2fd-763832c59cc1",
          created_at: "2023-10-01T00:00:00.000Z",
          updated_at: "2023-10-01T00:00:00.000Z",
          deleted_at: null,
        },
        {
          permissions: [
            {
              name: "View Role",
              key: "view-role",
              id: "145efcff-8ae5-4a6c-9900-05a855000622",
              created_at: null,
              updated_at: null,
              deleted_at: null,
            },
          ],
          name: "Super Admin",
          key: "super-admin",
          id: "410b4d3f-9ea1-4871-81ff-b091cf6c15fb",
          created_at: "2023-10-01T00:00:00.000Z",
          updated_at: "2023-10-01T00:00:00.000Z",
          deleted_at: null,
        },
      ],
      meta: {
        total_page: 1,
        total: 2,
        page: 1,
        per_page: 10,
      },
    },
    version: "1.0.0",
  });
};

export const getRole = (id: string): Promise<TRoleDetailResponse> => {
  console.log(id);
  return Promise.resolve({
    status_code: 200,
    data: {
      permissions: [
        {
          name: "View Role",
          key: "view-role",
          id: "145efcff-8ae5-4a6c-9900-05a855000622",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
      ],
      name: "Super Admin",
      key: "super-admin",
      id: "410b4d3f-9ea1-4871-81ff-b091cf6c15fb",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

export const createRole = (
  data: TRoleCreateRequest,
): Promise<TRoleDetailResponse> => {
  console.log(data);
  return Promise.resolve({
    status_code: 200,
    data: {
      permissions: [
        {
          name: "View Role",
          key: "view-role",
          id: "145efcff-8ae5-4a6c-9900-05a855000622",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
      ],
      name: "Admin HC",
      key: "admin-hc",
      id: "904a0805-ff4c-4513-9e6b-628089e23692",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

export const updateRole = (
  id: string,
  data: TRoleUpdateRequest,
): Promise<TRoleDetailResponse> => {
  console.log(id, data);
  return Promise.resolve({
    status_code: 200,
    data: {
      permissions: [
        {
          name: "View Role",
          key: "view-role",
          id: "145efcff-8ae5-4a6c-9900-05a855000622",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
      ],
      name: "Admin HC",
      key: "admin-hc",
      id: "904a0805-ff4c-4513-9e6b-628089e23692",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

export const deleteRole = (id: string): Promise<TRoleDetailResponse> => {
  console.log(id);
  return Promise.resolve({
    status_code: 200,
    data: {
      permissions: [],
      name: "Super Admin",
      key: "super-admin",
      id: "410b4d3f-9ea1-4871-81ff-b091cf6c15fb",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    version: "1.0.0",
  });
};

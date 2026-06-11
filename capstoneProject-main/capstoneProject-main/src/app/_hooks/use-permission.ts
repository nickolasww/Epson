import { useMemo } from "react";
import { useSession, type Role } from "../_components/providers/session";
import type { TPermissionWithGroup } from "@/api/auth/type";

/**
 * Hook for checking user permissions
 *
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
 *
 * // Check single permission
 * if (hasPermission(PERMISSIONS.USER.DELETE)) {
 *   // Show delete button
 * }
 *
 * // Check if user has any of the permissions
 * if (hasAnyPermission([PERMISSIONS.USER.VIEW, PERMISSIONS.ROLE.VIEW])) {
 *   // Show IAM menu
 * }
 *
 * // Check if user has all permissions
 * if (hasAllPermissions([PERMISSIONS.USER.CREATE, PERMISSIONS.USER.UPDATE])) {
 *   // Show advanced form
 * }
 */
export const usePermission = () => {
  const { user } = useSession();

  /**
   * Get all permissions from user's roles
   */
  const userPermissions = useMemo(
    () =>
      user?.roles
        ?.map((role: Role) => 
          role.permissions.map((perm: TPermissionWithGroup) => perm.slug || perm.name)
        )
        ?.flat() || [],
    [user?.roles],
  );

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => userPermissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => userPermissions.includes(permission));
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

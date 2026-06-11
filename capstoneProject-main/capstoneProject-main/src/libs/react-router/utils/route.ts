/**
 * Convert file path to route path
 * Example: './app/(public)/auth/login/page.tsx' -> '/auth/login'
 */
export function filePathToRoutePath(filePath: string): string {
  // Remove ./app/ prefix
  let path = filePath.replace(/^\.?\/app/, '');
  
  // Remove (public) and (protected) segments
  path = path.replace(/\/\((public|protected)\)/, '');
  
  // Remove /page.tsx, /layout.tsx, /error.tsx, /404.tsx, /loading.tsx
  path = path.replace(/\/(page|layout|error|404|loading)\.tsx$/, '');
  
  // Convert [id] to :id for dynamic routes
  path = path.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Convert empty path to /
  if (path === '/') {
    return '/';
  }
  
  return path;
}

/**
 * Get directory path from file path
 */
export function getDirectoryPath(filePath: string): string {
  return filePath.substring(0, filePath.lastIndexOf('/'));
}

/**
 * Check if path is protected route
 */
export function isProtectedRoute(filePath: string): boolean {
  return filePath.includes('/(protected)/');
}

/**
 * Transform page file path to route segment
 */
export function transformPagePath(filePath: string): string {
  // Remove ./app/ prefix and /page.tsx suffix
  let path = filePath
    .replace(/^\.?\/app/, '')
    .replace(/\/page\.tsx$/, '');
  
  // Remove (public) and (protected) segments
  path = path.replace(/\/\((public|protected)\)/, '');
  
  // Convert [id] to :id for dynamic routes
  path = path.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Handle homepage -> /
  if (path === '/homepage') {
    return '/';
  }
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  return path || '/';
}

/**
 * Get layout path for a page
 */
export function getLayoutPathForPage(pagePath: string): string {
  const dir = pagePath.substring(0, pagePath.lastIndexOf('/'));
  return `${dir}/layout.tsx`;
}

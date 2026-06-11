/**
 * Normalize path by removing trailing slashes
 */
export function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.replace(/\/$/, '');
}

/**
 * Join path segments
 */
export function joinPaths(...paths: string[]): string {
  return normalizePath(
    paths
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/')
  );
}

/**
 * Get parent path
 */
export function getParentPath(path: string): string {
  const normalized = normalizePath(path);
  const lastSlashIndex = normalized.lastIndexOf('/');
  if (lastSlashIndex <= 0) return '/';
  return normalized.substring(0, lastSlashIndex);
}

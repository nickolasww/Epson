import type { RouteObject } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { transformPagePath } from '@/libs/react-router/transformers/page';
import { getDirectoryPath } from '@/libs/react-router/utils/route';

type FileGlob = Record<string, () => Promise<any>>;

/**
 * Create lazy component wrapper with Suspense
 */
function createLazyComponent(importFn: () => Promise<any>, fallback: ReactNode = <div>Loading...</div>) {
  const LazyComponent = lazy(async () => {
    const module = await importFn();
    return { default: module.default || (() => null) };
  });
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}

/**
 * Create routes from file globs with nested layout support
 */
export function createRoutesFromFiles(
  pageFiles: FileGlob,
  errorFiles: FileGlob = {},
  notFoundFiles: FileGlob = {},
  loadingFiles: FileGlob = {}
): RouteObject {
  // Find root layout
  const rootLayoutPath = './app/layout.tsx';
  const rootLayout = pageFiles[rootLayoutPath];
  
  // Group pages by their layout
  const layoutGroups: { [layoutPath: string]: string[] } = {};
  
  // Process all page files and group by layout
  Object.keys(pageFiles).forEach((filePath) => {
    if (!filePath.includes('/page.tsx')) return; // Only process page files
    
    // Find layout for this page by searching up the directory tree
    let currentDir = getDirectoryPath(filePath);
    let foundLayout: string | null = null;
    
    // Keep searching parent directories until we find a layout or reach root
    while (currentDir && currentDir !== './app' && currentDir !== '/src/app') {
      const parentDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
      const layoutPath = `${parentDir}/layout.tsx`;
      
      if (pageFiles[layoutPath]) {
        foundLayout = layoutPath;
        break;
      }
      
      currentDir = parentDir;
    }
    
    // Group by found layout or root
    const groupKey = foundLayout || 'root';
    if (!layoutGroups[groupKey]) {
      layoutGroups[groupKey] = [];
    }
    layoutGroups[groupKey].push(filePath);
  });
  
  // Create routes for each layout group
  const layoutRoutes: RouteObject[] = [];
  
  Object.entries(layoutGroups).forEach(([layoutPath, pages]) => {
    const layout = layoutPath === 'root' ? null : pageFiles[layoutPath];
    
    // Create routes for pages in this layout
    const pageRoutes: RouteObject[] = pages.map((filePath) => {
      const transformedPath = filePath.replace('/src/app', './app');
      const routePath = transformPagePath(transformedPath);
      const dir = getDirectoryPath(filePath);
      
      // Find corresponding error and loading files
      const errorPath = `${dir}error.tsx`;
      const loadingPath = `${dir}loading.tsx`;
      
      const errorFile = errorFiles[errorPath];
      const loadingFile = loadingFiles[loadingPath];
      
      const fallback = loadingFile ? createLazyComponent(loadingFile) : <div>Loading...</div>;
      
      const route: RouteObject = {
        path: routePath === '/' ? '/' : routePath.replace(/^\//, ''),
        element: createLazyComponent(pageFiles[filePath], fallback),
      };
      
      if (errorFile) {
        route.errorElement = createLazyComponent(errorFile);
      }
      
      return route;
    });
    
    // If there's a layout, wrap routes
    if (layout) {
      layoutRoutes.push({
        element: createLazyComponent(layout),
        children: pageRoutes,
      });
    } else {
      layoutRoutes.push(...pageRoutes);
    }
  });
  
  // Create root route with layout
  const rootRoute: RouteObject = {
    path: '/',
    element: rootLayout ? createLazyComponent(rootLayout) : null,
    children: layoutRoutes,
  };
  
  // Add global 404 handler
  const globalNotFound = notFoundFiles['/src/app/404.tsx'];
  if (globalNotFound) {
    rootRoute.children?.push({
      path: '*',
      element: createLazyComponent(globalNotFound),
    });
  }
  
  return rootRoute;
}

// Export all utilities
export * from '@/libs/react-router/utils/route';
export * from '@/libs/react-router/utils/path';
export * from '@/libs/react-router/transformers/page';

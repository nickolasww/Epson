import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Add your theme logic here (dark mode, etc.)
  return <>{children}</>;
}

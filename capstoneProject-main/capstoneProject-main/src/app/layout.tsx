import { Outlet } from 'react-router-dom';
// import { ConfigProvider } from 'antd';
import { AppBoundary } from '@/app/_components/ui/app-boundry';
import { ThemeProvider } from '@/app/_components/providers/theme';
import { SessionAuthListener } from '@/app/_components/providers/session';

export default function RootLayout() {
  return (
    // <ConfigProvider
    //   theme={{
    //     token: {
    //       colorPrimary: "#4d9232",
    //     },
    //   }}
    // >
      <ThemeProvider>
        <AppBoundary>
          <SessionAuthListener />
          <div className="min-h-screen">
            <Outlet />
          </div>
        </AppBoundary>
      </ThemeProvider>
    // </ConfigProvider>
  );
}

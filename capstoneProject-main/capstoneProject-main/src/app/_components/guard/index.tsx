import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession, type UserRole } from '../providers/session';
import Loading from '@/app/loading';

interface GuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function Guard({
  children,
  requireAuth = false,
  allowedRoles,
  redirectTo = '/',
}: GuardProps) {
  const { user, isAuthenticated, isLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo, { 
        replace: true,
        state: { from: location.pathname } 
      });
      return;
    }

    // If specific roles are required
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role
      if (user.role === 'client') {
        navigate('/', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }
  }, [isAuthenticated, user, isLoading, requireAuth, allowedRoles, navigate, location, redirectTo]);

  // Show loading state
  if (isLoading) {
    return <Loading />;
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If roles are specified and user doesn't have permission, don't render children
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/app/loading';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback logic here
    // For now, redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <Loading />;
}

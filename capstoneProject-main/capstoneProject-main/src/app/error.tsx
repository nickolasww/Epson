import { useRouteError, Link } from 'react-router-dom';

type RouteError = { 
  statusText?: string;
  message?: string;
  [key: string]: unknown;
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-xl text-gray-800 mb-4">
          Terdapat Kesalahan Silakan coba kembali beberapa saat lagi
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 font-mono">
              {error.statusText || error.message}
            </p>
          </div>
        )}
        <Link 
          to="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

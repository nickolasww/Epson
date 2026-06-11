import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden">
      {/* Content */}
      <div className="px-12 py-16 max-w-2xl mx-4">
        <div className="text-center space-y-4">
          <h1 className="text-7xl md:text-8xl font-normal text-blue-400">Oops!</h1>
          
          <div className="text-2xl md:text-3xl font-semibold text-gray-800">
            <span className="text-blue-400">404</span> - Page Not Found
          </div>
          
          <p className="text-black text-base md:text-lg leading-relaxed ">
            Halaman yang kamu cari mungkin telah dihapus, namanya telah diubah, atau sementara tidak tersedia.
          </p>
          
          <div className="pt-6">
            <Link 
              to="/" 
              className="inline-block px-8 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-lg"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

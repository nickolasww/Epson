import React from 'react';
import { Construction, Home} from 'lucide-react';
import { Link } from 'react-router-dom';

interface UnderConstructionProps {
  title: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ title }) => {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-32 text-center relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="relative mb-12">
        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-br from-blue-50 to-blue-100 shadow-xl border border-blue-200/50 rotate-3 transition-transform hover:rotate-6">
          <Construction className="h-16 w-16 text-blue-400" />
        </div>
        <div className="absolute -right-3 -top-3 h-12 w-12 animate-bounce items-center justify-center rounded-full bg-yellow-400 font-bold text-white shadow-lg flex border-4 border-white">
          !
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Layanan <span className="text-blue-400">{title}</span> <br className="hidden md:block" />
          Sedang Disiapkan
        </h1>
        
        <p className="mx-auto max-w-xl text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
          Kami sedang memoles halaman ini untuk memberikan informasi terbaik mengenai layanan kami. Mohon kesabaran Anda.
        </p>
      </div>
      
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-blue-400 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-500 hover:shadow-blue-300 active:scale-95 group"
        >
          <Home size={20} className="transition-transform group-hover:scale-110" />
          Beranda Utama
        </Link>
      </div>
      
      {/* Visual Decoration: Professional Construction Cues */}
      <div className="mt-20 flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-3">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full bg-blue-400 transition-all duration-1000 animate-pulse`} 
              style={{ width: `${(i + 1) * 20}px`, animationDelay: `${i * 200}ms` }}
            ></div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400/60">
          <div className="h-1 w-1 rounded-full bg-blue-400/60"></div>
          Under Construction
          <div className="h-1 w-1 rounded-full bg-blue-400/60"></div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;

import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/app/navbar";
import Footer from "@/app/footer";
import { useSession } from "@/app/_components/providers/session";
import Loading from "../loading";

const PublicLayout = () => {
  const [hasBackground, setHasBackground] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { user, isAuthenticated, isLoading } = useSession();

  // Hide navbar and footer on auth pages
  const isAuthPage = pathname.startsWith('/auth');

  // Redirect authenticated admin/super_admin to dashboard
  useEffect(() => {
    if (isLoading) return;
    // Skip redirect for auth pages (login/register flow)
    if (isAuthPage) return;
    // If user is authenticated and has admin role, redirect to dashboard
    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'super_admin')) {
      console.log('[Public Layout] Authenticated admin detected, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, isAuthPage, navigate]);

  // Scroll handler untuk mengubah background navbar
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Cari section dengan id "mitra-kami" atau heading "Mitra Kami"
          let mitraSection = document.getElementById('mitra-kami');
          if (!mitraSection) {
            // Fallback: cari berdasarkan heading
            mitraSection = Array.from(document.querySelectorAll('h2')).find(
              (h2) => h2.textContent?.trim() === 'Mitra Kami'
            )?.closest('section') as HTMLElement | null;
          }

          //aboutpage visimisi
          let visimisiSection = document.getElementById('visimisi-section');
          if (!visimisiSection) {
            visimisiSection = Array.from(document.querySelectorAll('h2')).find(
              (h2) => h2.textContent?.trim() === 'Visi & Misi'
            )?.closest('section') as HTMLElement | null;
          }

        const navbarHeight = 88;
        const mitraTop = mitraSection ? mitraSection.getBoundingClientRect().top : Infinity;
        const visimisiTop = visimisiSection ? visimisiSection.getBoundingClientRect().top : Infinity;

        // Jika salah satu sudah mencapai navbar, tampilkan background
        if (mitraTop <= navbarHeight || visimisiTop <= navbarHeight) {
          setHasBackground(true);
        } else {
          setHasBackground(false);
        }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    // Tambahkan event listener dengan passive untuk performa lebih baik
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Panggil sekali untuk cek posisi awal
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]); // Re-run ketika pathname berubah

  // Show loading state while checking authentication for non-auth pages
  if (!isAuthPage && isLoading) {
    return (
      <Loading /> 
    );
  }

  return (
    <div className=" bg-gray-50 flex flex-col">
      {!isAuthPage && <Navbar/>}

      <main className="">
        <Outlet />
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
};

export default PublicLayout;


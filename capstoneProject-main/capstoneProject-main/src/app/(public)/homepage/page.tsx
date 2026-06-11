import CaraKerjaPage from './carakerja/page';
import HeroSection from './herosection/page';
import PelayananKami from './pelayanan/page';
import SEO from '@/app/_components/seo/seo';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Epson AI Helpdesk"
        description="Solusi Cepat untuk Masalah Printer Anda"
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PT Bukit Aurumn Sejahtera",
            "alternateName": ["BAS", "BAS Kediri", "PT BAS"],
            "url": "https://www.bukitaurumnsejahtera.co.id",
            "description": "Perusahaan kontraktor & supplier berpengalaman di Kediri, Jawa Timur. Melayani konstruksi, pengadaan barang & jasa, dan sewa alat berat untuk proyek nasional.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Kediri",
              "addressRegion": "Jawa Timur",
              "addressCountry": "ID"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": "Indonesian"
            },
            "sameAs": []
          })}
        </script>
      </Helmet>
      
      <HeroSection />
      <PelayananKami />
      <CaraKerjaPage/>
    </div>
  );
};

export default HomePage;

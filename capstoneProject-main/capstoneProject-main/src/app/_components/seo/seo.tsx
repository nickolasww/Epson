import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  canonical?: string;
}

export default function SEO({title, description, name, type, canonical}: SEOProps) {
  const defaultCanonical = "https://www.bukitaurumnsejahtera.co.id";
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <link rel="canonical" href={canonical || defaultCanonical} />
      
      {/* Open Graph tags (Facebook, WhatsApp, dsb) */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical || defaultCanonical} />
      <meta property="og:site_name" content="PT EPSON " />
      <meta property="og:locale" content="id_ID" />       
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || "PT EPSON "} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
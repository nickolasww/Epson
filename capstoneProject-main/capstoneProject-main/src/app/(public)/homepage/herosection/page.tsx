import hero from "@/assets/homepage/hero.webp";
import Icon from "@/assets/homepage/Home_Icon.png";
import { Button } from "antd";

const HeroSection = () => {
  return (
    <section className="min-h-screen w-full flex justify-center bg-[#F5F7FB]">
      {/* Content */}
      
      <div className="flex flex-col justify-center px-10 w-[60%]">
        <h1 className="mb-6 text-5xl font-bold md:text-6xl lg:text-7xl">
          Smart AI Helpdesk for <span className="text-[#00A3FF]">Epson</span>{" "}
          Users
        </h1>
        <h2 className="mb-8 max-w-3xl text-lg md:text-xl">
          Solusi cepat untuk setiap masalah printer Anda
        </h2>

        <div className="flex items-center">
          <Button
            type="primary"
            size="large"
            style={{
              height: "48px",
              padding: "0 32px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          >
            Mulai Chat AI
          </Button>
          <Button
            className="ml-4"
            type="default"
            size="large"
            style={{
              height: "48px",
              padding: "0 32px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          >
            Cek Garansi Sekarang
          </Button>
        </div>
      </div>

      <div>
        <img
          src={Icon}
          alt="Hero Image"
          className="h-[80%] w-full object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;

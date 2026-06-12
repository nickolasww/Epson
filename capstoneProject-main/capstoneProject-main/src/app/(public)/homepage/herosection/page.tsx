import Icon from "@/assets/homepage/Home_Icon.png";
import { Button } from "antd";

const HeroSection = () => {
  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F7FB] lg:flex-row lg:items-stretch">
      {/* Content */}
      
      <div className="flex w-full flex-col justify-center px-5 pt-10 text-center sm:px-8 md:px-10 lg:w-[60%] lg:pt-0 lg:text-left">
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl">
          Smart AI Helpdesk for <span className="text-[#00A3FF]">Epson</span>{" "}
          Users
        </h1>
        <h2 className="mx-auto mb-6 max-w-3xl text-base sm:text-lg md:mb-8 md:text-xl lg:mx-0">
          Solusi cepat untuk setiap masalah printer Anda
        </h2>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:items-center lg:justify-start lg:gap-0">
          <Button
            type="primary"
            size="large"
            className="w-full sm:w-auto"
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
            className="w-full sm:w-auto lg:ml-4"
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

      <div className="mt-8 flex w-full justify-center px-5 pb-10 sm:px-8 md:mt-10 md:px-10 lg:mt-0 lg:block lg:px-0 lg:pb-0">
        <img
          src={Icon}
          alt="Hero Image"
          className="h-auto max-h-[360px] w-full max-w-[520px] object-contain lg:h-[80%] lg:max-h-none lg:max-w-none lg:object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;

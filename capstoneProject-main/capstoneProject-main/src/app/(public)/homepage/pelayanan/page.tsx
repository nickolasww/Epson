import { ArrowRightOutlined } from "@ant-design/icons";

const PelayananKami = () => {
  const services = [
    {
      id: 1,
      title: 'AI ChatBot',
      description:
        'Tanyakan masalah printer Anda kapan saja, AI kami siap membantu memberikan solusi terbaik',
      button: 'Mulai Chat'
    },
    {
      id: 2,
      title: 'OCR Errir Scanner',
      description:
        'Upload foto error atau kode pada printer, AI akan membaca dan memberikan analisis solusi',
      button:"Scan Error"
    },
    {
      id: 3,
      title: 'Warranty Checker',
      description:
        'Masukkan serial number untuk cek garansi, estimasi biaya, dan lokasi service center terdekat',
      button: 'Cek Sekarang'
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
          layanan Kami
        </h1>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex h-full overflow-hidden rounded-xl bg-white shadow-lg transition hover:shadow-2xl"
            >
              
              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="mb-2 text-2xl font-bold">
                  {service.title}
                </h2>
                <p className="mb-4 grow text-sm w-[70%]">
                  {service.description}
                </p>
                <div className="">
                  <button className="text-[#00A3FF] cursor-pointer ">
                    {service.button} <ArrowRightOutlined />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PelayananKami;

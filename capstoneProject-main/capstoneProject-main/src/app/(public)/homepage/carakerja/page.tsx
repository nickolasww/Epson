import { QrcodeOutlined } from "@ant-design/icons";
import { RobotOutlined} from "@ant-design/icons";
import { SafetyOutlined } from "@ant-design/icons";

const CaraKerjaPage = () => {
  const services = [
    {
      id: 1,
      icon: <QrcodeOutlined />,
      title: 'Ajukan Pertanyaan / Upload',
      description:'Tuliskan Pertanyaan, Masukkan Serial Number, atau Upload Foto Error Printer Anda',
    },
    {
      id: 2,
      icon: <RobotOutlined />,
      title: 'AI Menganalisis ',
      description:
        'AI Kami akan mencari jawaban paling relevan atau membaca kode error secara otomatis',
    },
    {
      id: 3,
      icon: <SafetyOutlined />,
      title: 'Dapatkan Solusi',
      description:
        'Dapatkan Solusi, Estimasi Biaya, dan Lokasi Service Center dengan cepat',
    },
  ];

  return (
    <section className="bg-white py-10 md:py-12 lg:py-16">
      <div className="container mx-auto px-5 sm:px-8 lg:px-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800 md:mb-8 md:text-4xl">
          Cara Kerja
        </h1>

        {/* Services Grid */}
        <div className="border border-gray-100 rounded-xl flex flex-col bg-white transition shadow-2xl md:grid md:grid-cols-3 lg:flex lg:flex-row">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col items-center px-5 py-6 text-center sm:px-8 md:px-4 lg:flex-row lg:px-5 lg:py-0 lg:text-left"
            >
                <div className="flex text-4xl bg-blue-50 rounded-full m-auto p-3 lg:m-auto">
                  {service.icon}
                </div>
              {/* Content */}
              <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
                <h2 className="mb-2 text-xl font-bold md:text-lg lg:text-2xl">
                  {service.title}
                </h2>
                <p className="mb-4 grow text-sm ">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaraKerjaPage;

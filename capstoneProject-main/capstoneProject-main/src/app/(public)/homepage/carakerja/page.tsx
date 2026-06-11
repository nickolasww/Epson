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
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
          Cara Kerja
        </h1>

        {/* Services Grid */}
        <div className="border border-gray-100 rounded-xl flex bg-white transition shadow-2xl">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex px-5"
            >
                <div className="flex text-4xl bg-blue-50 rounded-full m-auto p-3">
                  {service.icon}
                </div>
              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="mb-2 text-2xl font-bold">
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

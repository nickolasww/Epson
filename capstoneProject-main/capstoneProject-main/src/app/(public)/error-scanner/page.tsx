import { useState } from "react";
import SEO from "@/app/_components/seo/seo";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload, Spin } from "antd";

const { Dragger } = Upload;

type OcrResult = {
  detected_error_code: string;
  confidence: number;
  description: string;
  solutions: string[];
  estimated_service_cost: string;
  severity: string;
  can_self_repair: boolean;
};

const severityColor: Record<string, string> = {
  ringan: "text-green-600",
  sedang: "text-yellow-600",
  berat: "text-red-600",
};

const ErrorScannerPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [result, setResult] = useState<OcrResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const props: UploadProps = {
    name: "file",
    multiple: false,
    action: "/api/upload",
    accept: "image/*",
    showUploadList: true,
    beforeUpload: () => {
      setResult(null);
      setAnalyzing(true);
      return true;
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        setAnalyzing(false);
        const response = info.file.response;
        if (response?.data) {
          setResult(response.data);
          messageApi.success(`${info.file.name} berhasil dianalisis.`);
        } else {
          messageApi.error("Tidak ada hasil analisis dari server.");
        }
      } else if (status === "error") {
        setAnalyzing(false);
        const errMsg =
          info.file.response?.detail ||
          info.file.response?.message ||
          `${info.file.name} gagal diupload.`;
        messageApi.error(errMsg);
      }
    },
    onDrop() {
      setResult(null);
    },
  };

  return (
    <>
      <SEO
        title="Error Scanner - EPSON INDONESIA"
        description="Gunakan fitur Error Scanner untuk menganalisis masalah printer Anda dengan cepat. Upload foto error atau kode, dan dapatkan solusi instan dari AI kami."
        canonical="https://www.bukitaurumnsejahtera.co.id/servicespage/error-scanner"
      />

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="text-center xl:w-130 xl:mr-120">
          <h1 className="text-3xl font-bold mb-4">Scan Error Code Printer</h1>
          <h2 className="text-lg mb-6">
            Upload foto error pada layar printer, AI akan membaca kode dan memberikan solusi terbaik
          </h2>
        </div>

        <div className="flex w-full max-w-6xl flex-col gap-6 xl:max-w-300 xl:flex-row xl:gap-10 2xl:max-w-350 h-full min-h-130">
          {/* Upload panel */}
          <div className="w-full xl:w-[55%] p-6 bg-white rounded-lg shadow-md min-h-130">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">Upload Gambar Error</h3>
            {contextHolder}
            <Dragger {...props} className="custom-dragger" style={{ marginBottom: "20px" }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Dukung JPG, PNG, WebP. Maksimal 10MB.
              </p>
            </Dragger>

            <p className="text-sm text-blue-900 font-semibold">
              Contoh Gambar Yang Didukung
            </p>
          </div>

          {/* Results panel */}
          <div className="w-full xl:w-[45%] h-full p-6 bg-white rounded-lg shadow-md min-h-130">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">Hasil Analisis</h3>

            {/* Analyzing spinner */}
            {analyzing && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Spin size="large" />
                <p className="text-sm text-gray-500">Menganalisis gambar dengan AI…</p>
              </div>
            )}

            {/* Empty state */}
            {!analyzing && !result && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                <InboxOutlined style={{ fontSize: 48 }} />
                <p className="text-sm">Upload gambar error printer untuk melihat hasil analisis</p>
              </div>
            )}

            {/* Result */}
            {!analyzing && result && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Detected Error Code</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-700">
                      {result.detected_error_code}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col items-start gap-1">
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-xl font-semibold text-green-600">{result.confidence}%</p>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700">Deskripsi Masalah</p>
                    <span className={`text-xs font-semibold capitalize ${severityColor[result.severity] ?? "text-gray-600"}`}>
                      {result.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{result.description}</p>
                </div>

                {result.solutions.length > 0 && (
                  <div className="mt-5 rounded-lg border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700">Rekomendasi Solusi</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {result.solutions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Estimasi Biaya Servis</p>
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      {result.estimated_service_cost}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {result.can_self_repair ? "✓ Bisa diperbaiki sendiri" : "Disarankan ke service center"}
                    </p>
                  </div>
                  <button className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                    Cari Service Center Terdekat
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorScannerPage;

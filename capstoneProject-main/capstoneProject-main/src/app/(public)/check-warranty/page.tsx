import { useState } from 'react'
import {
  Typography,
  Input,
  Button,
  Card,
  Tag,
  Row,
  Col,
  Divider,
  Space,
  Spin,
  Alert,
} from 'antd'
import {
  SafetyOutlined,
  CalendarOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { api } from '@/libs/axios/api'

const { Title, Text, Paragraph } = Typography

const CheckWarrantyPage = () => {
  const [serialInput, setSerialInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    const sn = serialInput.trim()
    if (!sn) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await api.get('/warranty/check', {
        params: { serial_number: sn },
      })
      setResult(data.data ?? data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Serial number tidak ditemukan dalam database kami.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isActive = result?.warrantyStatus === 'Aktif'

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans min-h-screen">

      {/* Header */}
      <div className="text-center mb-8">
        <Title level={2} style={{ color: '#1a1a2e', marginBottom: 8, fontSize: 50 }}>
          Cek Garansi &amp; Informasi Produk
        </Title>
        <Paragraph style={{ color: '#666', maxWidth: 500, margin: '0 auto 40px' }}>
          Masukkan serial number / service ID untuk melihat informasi garansi,
          estimasi biaya servis, dan lokasi service center terdekat.
        </Paragraph>
      </div>

      {/* Search Box */}
      <div className="flex flex-col gap-3 mb-10 bg-white rounded-lg shadow-md p-6">
        <label>
          <Text strong style={{ fontSize: 14, marginRight: 8 }}>
            Masukkan Serial Number / Service ID
          </Text>
        </label>
        <div className='flex gap-3'>
          <Input
            size="large"
            placeholder="Contoh: L4260DEMO01"
            value={serialInput}
            onChange={(e) => setSerialInput(e.target.value)}
            onPressEnter={handleCheck}
            style={{ flex: 1 }}
            disabled={loading}
          />
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleCheck}
            style={{ backgroundColor: '#1677ff', borderColor: '#1677ff', whiteSpace: 'nowrap' }}
          >
            Cek Sekarang
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert
          type="error"
          message="Tidak Ditemukan"
          description={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      )}

      {/* Result Section */}
      {result && !loading && (
        <div>
          <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}>
            <Text strong style={{ fontSize: 20, display: 'block', marginBottom: 12 }}>
              Hasil Pengecekan
            </Text>

            {/* Product Info */}
            <Row gutter={24} align="middle">
              <Col flex="120px">
                <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
                  <img
                    src="https://placehold.co/100x80?text=Printer"
                    alt="product"
                    style={{ width: 100, height: 80, objectFit: 'contain' }}
                  />
                </div>
              </Col>

              <Col flex="auto">
                <Space align="center" style={{ marginBottom: 8 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {result.productName}
                  </Title>
                  <Tag
                    color={isActive ? 'green' : 'red'}
                    style={{ borderRadius: 20, fontWeight: 600, fontSize: 13 }}
                  >
                    {result.status}
                  </Tag>
                </Space>
                <Row gutter={32}>
                  <Col>
                    <Text type="secondary" style={{ fontSize: 12 }}>Serial Number</Text>
                    <br />
                    <Text strong>{result.serialNumber}</Text>
                  </Col>
                  <Col>
                    <Text type="secondary" style={{ fontSize: 12 }}>Tipe Produk</Text>
                    <br />
                    <Text strong>{result.productType}</Text>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Divider style={{ margin: '20px 0' }} />

            {/* Warranty Info Cards */}
            <Row gutter={16}>
              {/* Status Garansi */}
              <Col xs={24} sm={8}>
                <div className={`flex items-start gap-3 py-3 px-4 rounded-xl h-full border ${isActive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="mt-0.5">
                    <SafetyOutlined style={{ color: isActive ? '#52c41a' : '#ff4d4f', fontSize: 20 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Status Garansi</Text>
                    <br />
                    <Text strong style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
                      {result.warrantyStatus}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>Berakhir pada</Text>
                    <br />
                    <Text style={{ fontSize: 13 }}>{result.warrantyStart}</Text>
                  </div>
                </div>
              </Col>

              {/* Sisa Garansi */}
              <Col xs={24} sm={8}>
                <div className="flex items-start gap-3 py-3 px-4 rounded-xl bg-blue-50 border border-blue-100 h-full">
                  <div className="mt-0.5">
                    <CalendarOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Sisa Garansi</Text>
                    <br />
                    <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                      {result.sisaGaransi}
                    </Text>
                  </div>
                </div>
              </Col>

              {/* Estimasi Biaya Servis */}
              <Col xs={24} sm={8}>
                <div className="flex items-start gap-3 py-3 px-4 rounded-xl bg-amber-50 border border-amber-100 h-full">
                  <div className="mt-0.5">
                    <CameraOutlined style={{ color: '#faad14', fontSize: 20 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Estimasi Biaya Servis</Text>
                    <br />
                    <Text strong style={{ color: '#ff4d4f', fontSize: 15 }}>
                      {result.estimasiMin} - {result.estimasiMax}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>Dapat berubah sesuai kerusakan</Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '20px 0' }} />

            {/* Service Center */}
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
              Service Center Terdekat
            </Text>

            <Row gutter={16} style={{ marginTop: 12 }} align="top">
              <Col xs={24} sm={12}>
                <Space direction="vertical" size={6}>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#1677ff' }} />
                    <Text strong>{result.serviceCenter?.name}</Text>
                  </Space>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#aaa' }} />
                    <Text type="secondary">{result.serviceCenter?.address}</Text>
                  </Space>
                  <Space>
                    <ClockCircleOutlined style={{ color: '#aaa' }} />
                    <Text type="secondary">Buka: {result.serviceCenter?.hours}</Text>
                  </Space>
                  <Button type="default" size="small" style={{ marginTop: 4 }}>
                    Lihat di Peta
                  </Button>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <div className="h-36 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src="https://placehold.co/320x140?text=Map"
                    alt="map"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CheckWarrantyPage

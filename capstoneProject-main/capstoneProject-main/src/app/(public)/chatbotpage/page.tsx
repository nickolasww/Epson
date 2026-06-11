import { useState, useRef, useEffect } from 'react'
import { Avatar, Button, Card, Input, Spin, Typography } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { api } from '@/libs/axios/api'

type Message = {
  role: 'user' | 'bot'
  content: string
  time: string
}

const getTime = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const FAQ_POPULAR = [
  'Printer tidak terdeteksi',
  'Cara reset printer Epson',
  'Cara scan dokumen',
  'Hasil print bergaris',
  'Printer offline',
]

const SUGGESTIONS = [
  'Printer tidak bisa print',
  'Cara install driver Epson',
  'Kertas nyangkut di printer',
  'Hasil print bergaris',
  'Printer offline',
]

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'bot',
    content: 'Halo!\nSaya Epson AI Assistant.\nAda yang bisa saya bantu hari ini?',
    time: getTime(),
  },
]

const ChatBotPage = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed, time: getTime() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/chat', {
        message: trimmed,
        session_id: sessionId,
      })
      const result = data.data ?? data
      if (!sessionId && result.session_id) {
        setSessionId(result.session_id)
      }
      const botMsg: Message = {
        role: 'bot',
        content: result.response ?? 'Maaf, tidak ada jawaban.',
        time: getTime(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.', time: getTime() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(input)
  }

  const handleNewChat = () => {
    setMessages(INITIAL_MESSAGES)
    setSessionId(undefined)
    setInput('')
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 lg:max-w-6xl lg:grid-cols-[240px_1fr] lg:gap-6 xl:max-w-7xl xl:grid-cols-[260px_1fr_260px] xl:gap-8">

        {/* Left sidebar */}
        <Card
          className="order-2 lg:order-1"
          style={{ borderRadius: 14, border: '1px solid #e6edf7', boxShadow: '0 8px 24px rgba(20,38,70,0.06)' }}
          bodyStyle={{ padding: 16 }}
        >
          <div className="flex items-center justify-between">
            <Typography.Text style={{ color: '#1b2b4a', fontSize: 14, fontWeight: 700 }}>
              Riwayat Chat
            </Typography.Text>
          </div>
          <Button
            className="mt-3 w-full"
            onClick={handleNewChat}
            style={{
              borderRadius: 10,
              fontWeight: 600,
              height: 34,
              padding: '0 14px',
              background: '#2f5dff',
              borderColor: '#2f5dff',
              color: '#ffffff',
            }}
          >
            Chat Baru
          </Button>

          <div className="mt-4">
            {messages
              .filter((m) => m.role === 'user')
              .slice(-4)
              .map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                  style={{ borderBottom: '1px solid #eef2f8', padding: '10px 0' }}
                >
                  <Typography.Text
                    className="text-xs font-semibold text-[#1f2f4d]"
                    ellipsis
                    style={{ maxWidth: 160 }}
                  >
                    {m.content}
                  </Typography.Text>
                  <Typography.Text style={{ color: '#6b7a99', fontSize: 12, marginLeft: 4 }}>
                    {m.time}
                  </Typography.Text>
                </div>
              ))}
          </div>

          <div className="mt-6">
            <Typography.Text style={{ color: '#1b2b4a', fontSize: 13, fontWeight: 700 }}>
              FAQ Populer
            </Typography.Text>
            <ul className="cb-faq-list mt-2 list-disc pl-4">
              {FAQ_POPULAR.map((item) => (
                <li
                  key={item}
                  style={{ color: '#1f2f4d', fontSize: 12, margin: '6px 0', cursor: 'pointer' }}
                  onClick={() => sendMessage(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Chat area */}
        <Card
          className="order-1 lg:order-2"
          style={{ borderRadius: 14, border: '1px solid #e6edf7', boxShadow: '0 10px 26px rgba(20,38,70,0.08)' }}
          bodyStyle={{ padding: 16 }}
        >
          <div className="flex items-center gap-3">
            <Avatar size={36} src="/favicon.ico" />
            <div>
              <Typography.Text style={{ color: '#1b2b4a', fontSize: 16, fontWeight: 700 }}>
                Epson AI Assistant
              </Typography.Text>
              <div style={{ color: '#6b7a99', fontSize: 12 }}>
                Tanyakan apa saja tentang printer Epson Anda
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="mt-5 space-y-4 overflow-y-auto" style={{ maxHeight: 400 }}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                <div
                  className="inline-block max-w-[85%] text-left"
                  style={{
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    background: msg.role === 'user' ? '#2f5dff' : '#f2f6ff',
                    color: msg.role === 'user' ? '#ffffff' : '#1f2f4d',
                  }}
                >
                  {msg.content}
                </div>
                <div className="mt-1" style={{ color: '#6b7a99', fontSize: 12 }}>
                  {msg.time}
                </div>
              </div>
            ))}

            {loading && (
              <div>
                <div
                  className="inline-flex items-center gap-2"
                  style={{
                    borderRadius: 12,
                    padding: '10px 14px',
                    background: '#f2f6ff',
                    color: '#6b7a99',
                    fontSize: 13,
                  }}
                >
                  <Spin size="small" />
                  <span>Sedang mencari jawaban…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="mt-4 flex items-center gap-3">
            <Input
              placeholder="Ketik pertanyaan Anda..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ borderRadius: 12, borderColor: '#d9e2f2', height: 42 }}
            />
            <Button
              icon={<SendOutlined />}
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: loading || !input.trim() ? '#c9d9ff' : '#2f5dff',
                borderColor: loading || !input.trim() ? '#c9d9ff' : '#2f5dff',
                color: '#ffffff',
              }}
            />
          </div>
        </Card>

        {/* Right sidebar */}
        <div className="order-3 space-y-6 lg:col-span-2 xl:col-span-1">
          <Card
            style={{ borderRadius: 14, border: '1px solid #e6edf7', boxShadow: '0 8px 24px rgba(20,38,70,0.06)' }}
            bodyStyle={{ padding: 16 }}
          >
            <Typography.Text style={{ color: '#1b2b4a', fontSize: 14, fontWeight: 700 }}>
              Saran Pertanyaan
            </Typography.Text>
            <div className="mt-3 flex flex-col gap-2">
              {SUGGESTIONS.map((item) => (
                <Button
                  key={item}
                  block
                  onClick={() => sendMessage(item)}
                  disabled={loading}
                  style={{
                    borderRadius: 10,
                    fontWeight: 600,
                    height: 34,
                    padding: '0 14px',
                    borderColor: '#c8d6f2',
                    color: '#2f5dff',
                    background: '#ffffff',
                    textAlign: 'left',
                  }}
                >
                  {item}
                </Button>
              ))}
            </div>
          </Card>

          <Card
            style={{ borderRadius: 14, border: '1px solid #e6edf7', boxShadow: '0 8px 24px rgba(20,38,70,0.06)' }}
            bodyStyle={{ padding: 16 }}
          >
            <Typography.Text style={{ color: '#1b2b4a', fontSize: 14, fontWeight: 700 }}>
              Butuh Bantuan Lebih Lanjut?
            </Typography.Text>
            <Typography.Paragraph
              className="mt-2"
              style={{ marginBottom: 16, color: '#6b7a99', fontSize: 12 }}
            >
              Jika jawaban di atas belum membantu, hubungi kami melalui layanan berikut.
            </Typography.Paragraph>
            <Button
              className="w-full"
              style={{
                borderRadius: 10,
                fontWeight: 600,
                height: 34,
                padding: '0 14px',
                background: '#2f5dff',
                borderColor: '#2f5dff',
                color: '#ffffff',
              }}
            >
              Hubungi Customer Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ChatBotPage

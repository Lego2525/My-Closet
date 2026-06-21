// src/pages/Stylist.jsx
import { useState, useRef, useEffect } from 'react'
import { useAppState } from '../hooks/useAppState.js'
import * as api from '../lib/api.js'

const STARTERS = [
  'What should I wear today?',
  'Build me a week of outfits',
  "What's missing from my wardrobe?",
  'What should I donate?',
  'Help me dress for a job interview',
  'What are my most versatile pieces?',
]

export default function Stylist() {
  const { aiContext, weather } = useAppState()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const weatherSummary = weather?.current
    ? `${Math.round(weather.current.temperature_2m)}°F`
    : null

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const { reply } = await api.aiChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        aiContext
      )
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch(e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✦</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>AI Stylist</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {aiContext.wardrobe?.length || 0} items · {weatherSummary ? `${weatherSummary} outside` : 'knows your wardrobe'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 8 }}>
        {messages.length === 0 && (
          <div>
            <div style={{ textAlign: 'center', padding: '24px 16px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Your personal stylist</div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                I know your entire wardrobe, your color season, and your style boards. Ask me anything.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, textAlign: 'left',
                  border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)',
                  lineHeight: 1.4,
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, marginBottom: 16,
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
          }}>
            {m.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>✦</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
              borderBottomRightRadius: m.role === 'user' ? 4 : 16,
              borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16,
              background: m.role === 'user' ? 'var(--pink)' : 'var(--bg-2)',
              color: m.role === 'user' ? 'white' : 'var(--text)',
              fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
            <div style={{ background: 'var(--bg-2)', borderRadius: 16, borderBottomLeftRadius: 4, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pink)', animation: `bounce 1s infinite ${i*0.2}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', paddingBottom: 'calc(var(--nav-height) + var(--safe-bottom) + 10px)', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', gap: 8 }}>
        <input
          className="input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask your stylist…" style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}
          style={{ padding: '10px 16px' }}>↑</button>
      </div>

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}

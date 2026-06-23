// src/pages/More.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.jsx'
import * as api from '../lib/api.js'

export default function More() {
  const [section, setSection] = useState(null)

  if (section === 'moodboards') return <Moodboards onBack={() => setSection(null)} />
  if (section === 'colors') return <ColorAnalysis onBack={() => setSection(null)} />
  if (section === 'shop') return <Shopping onBack={() => setSection(null)} />
  if (section === 'donate') return <Donate onBack={() => setSection(null)} />

  const { wardrobe } = useAppState()
  const donateCount = wardrobe.filter(i => i.status === 'donate').length

  const menu = [
    { id: 'moodboards', icon: '🎨', label: 'Mood Boards', desc: 'Define your aesthetic' },
    { id: 'colors', icon: '🌈', label: 'Color Analysis', desc: 'Your palette season' },
    { id: 'shop', icon: '🛍️', label: 'Buy or Pass', desc: 'Get a verdict on any item' },
    { id: 'donate', icon: '🎁', label: 'Edit & Donate', badge: donateCount || null, desc: 'Clear what no longer serves you' },
  ]

  return (
    <div className="page">
      <h1 style={{ marginBottom: 20 }}>More</h1>
      {menu.map(item => (
        <button key={item.id} onClick={() => setSection(item.id)} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 0',
          borderBottom: '1px solid var(--border)', background: 'none', textAlign: 'left',
        }}>
          <span style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 15 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{item.desc}</div>
          </div>
          {item.badge ? <span className="badge badge-donate">{item.badge}</span> : null}
          <span style={{ color: 'var(--text-3)' }}>›</span>
        </button>
      ))}
    </div>
  )
}

function Moodboards({ onBack }) {
  const { moodboards, refresh } = useAppState()

  const toggle = async (id, current) => {
    await api.toggleMoodboard(id, current ? 0 : 1)
    refresh()
  }

  return (
    <div className="page">
      <BackHeader title="Mood Boards" onBack={onBack} />
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
        Active boards shape your AI stylist's recommendations and outfit suggestions.
      </p>
      {moodboards.map(board => {
        const colors = tryParse(board.colors, [])
        return (
          <div key={board.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', width: 48, height: 48, flexShrink: 0 }}>
                {colors.slice(0,3).map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{board.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{board.description}</div>
              </div>
              <button onClick={() => toggle(board.id, board.is_active)} style={{
                width: 44, height: 26, borderRadius: 13, padding: 3,
                background: board.is_active ? 'var(--pink)' : 'var(--bg-3)',
                transition: 'background 0.2s', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: board.is_active ? 'flex-end' : 'flex-start',
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white' }} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ColorAnalysis({ onBack }) {
  const { colorProfile, refresh } = useAppState()
  const [form, setForm] = useState({
    season: colorProfile?.season || '',
    tone: colorProfile?.tone || '',
    contrast_level: colorProfile?.contrast_level || '',
    dominant_feature: colorProfile?.dominant_feature || '',
    outfit_approach: colorProfile?.outfit_approach || '',
    priority_colors: tryParse(colorProfile?.priority_colors, []),
    avoid_colors: tryParse(colorProfile?.avoid_colors, []),
    notes: colorProfile?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']
  const TONES = ['Warm', 'Cool', 'Neutral']
  const COLORS = ['Black', 'White', 'Ivory', 'Camel', 'Tan', 'Brown', 'Rust', 'Olive', 'Forest Green', 'Sage', 'Teal', 'Navy', 'Blue', 'Cobalt', 'Lavender', 'Purple', 'Blush', 'Pink', 'Magenta', 'Red', 'Burgundy', 'Coral', 'Orange', 'Yellow', 'Gold', 'Silver', 'Grey', 'Charcoal']

  const CONTRAST_LEVELS = [
    { id: 'low', label: 'Low contrast', desc: 'Hair, skin, eyes are similar in depth/value', example: 'e.g. light skin, light/medium hair, light eyes — or all deep features' },
    { id: 'medium', label: 'Medium contrast', desc: 'Some difference between features but not dramatic', example: 'e.g. medium skin, medium-dark hair' },
    { id: 'high', label: 'High contrast', desc: 'Strong difference between features', example: 'e.g. Anne Hathaway — very light skin, very dark hair, dark eyes' },
  ]

  const OUTFIT_APPROACHES = [
    { id: 'monochromatic', label: 'Monochromatic', desc: 'One color family, different shades', emoji: '🎨' },
    { id: 'tonal', label: 'Tonal dressing', desc: 'Similar tones blended together', emoji: '🌊' },
    { id: 'soft-contrast', label: 'Soft contrast', desc: 'Gentle color blocking, no stark opposites', emoji: '🌸' },
    { id: 'bold-contrast', label: 'Bold contrast', desc: 'Strong color blocking, black + white, opposites', emoji: '⚡' },
    { id: 'mixed', label: 'Mixed — context dependent', desc: 'Varies by occasion and mood', emoji: '✨' },
  ]

  const toggleColor = (list, color) => {
    const current = form[list]
    return current.includes(color) ? current.filter(c=>c!==color) : [...current, color]
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.saveColorProfile(form)
      await refresh()
      onBack()
    } catch(e) { alert('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="page">
      <BackHeader title="Color & Contrast Analysis" onBack={onBack} />
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
        Your color season + contrast level together tell your stylist exactly what will make you shine.
      </p>

      {/* Season */}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>Color season</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {SEASONS.map(s => (
            <button key={s} onClick={() => setForm(f => ({...f, season: s}))} style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13, border: 'none',
              background: form.season === s ? 'var(--pink)' : 'var(--bg-2)',
              color: form.season === s ? 'white' : 'var(--text-2)', fontWeight: form.season === s ? 600 : 400,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>Tone</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {TONES.map(t => (
            <button key={t} onClick={() => setForm(f => ({...f, tone: t}))} style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13, border: 'none',
              background: form.tone === t ? '#FAEEDA' : 'var(--bg-2)',
              color: form.tone === t ? '#633806' : 'var(--text-2)',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Contrast Level */}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>Contrast level</SectionLabel>
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, marginBottom: 10, lineHeight: 1.5 }}>
          How much contrast is there between your hair, skin, and eyes?
        </p>
        {CONTRAST_LEVELS.map(c => (
          <button key={c.id} onClick={() => setForm(f => ({...f, contrast_level: c.id}))} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%',
            padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 8,
            border: form.contrast_level === c.id ? '2px solid var(--pink)' : '1px solid var(--border)',
            background: form.contrast_level === c.id ? '#FBEAF0' : 'var(--bg-2)',
            cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: form.contrast_level === c.id ? '#993556' : 'var(--text)' }}>{c.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>{c.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontStyle: 'italic' }}>{c.example}</div>
          </button>
        ))}
      </div>

      {/* Outfit Approach */}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>Your outfit approach</SectionLabel>
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, marginBottom: 10, lineHeight: 1.5 }}>
          What styling approach makes you look and feel your best?
        </p>
        {OUTFIT_APPROACHES.map(o => (
          <button key={o.id} onClick={() => setForm(f => ({...f, outfit_approach: o.id}))} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 8,
            border: form.outfit_approach === o.id ? '2px solid var(--pink)' : '1px solid var(--border)',
            background: form.outfit_approach === o.id ? '#FBEAF0' : 'var(--bg-2)',
            cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{ fontSize: 24 }}>{o.emoji}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: form.outfit_approach === o.id ? '#993556' : 'var(--text)' }}>{o.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{o.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Priority colors */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Priority colors — great on you</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setForm(f => ({...f, priority_colors: toggleColor('priority_colors', c)}))} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, border: 'none',
              background: form.priority_colors.includes(c) ? '#EAF3DE' : 'var(--bg-2)',
              color: form.priority_colors.includes(c) ? '#3B6D11' : 'var(--text-2)',
              fontWeight: form.priority_colors.includes(c) ? 600 : 400,
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SectionLabel>Colors to avoid</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setForm(f => ({...f, avoid_colors: toggleColor('avoid_colors', c)}))} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, border: 'none',
              background: form.avoid_colors.includes(c) ? '#FAECE7' : 'var(--bg-2)',
              color: form.avoid_colors.includes(c) ? '#993C1D' : 'var(--text-2)',
            }}>{c}</button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={save} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
        {saving ? 'Saving…' : 'Save color & contrast profile'}
      </button>
    </div>
  )
}

function Shopping({ onBack }) {
  const { wardrobe, colorProfile, moodboards, shoppingHistory } = useAppState()
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const analyze = async () => {
    if (!url && !description) return
    setAnalyzing(true)
    setResult(null)
    try {
      const res = await api.aiShop(url || description, wardrobe, colorProfile, moodboards)
      setResult(res)
      if (url) {
        await api.saveShoppingAnalysis({ url, verdict: res.verdict, verdict_reason: res.reason })
      }
    } catch(e) { alert('Analysis failed') }
    finally { setAnalyzing(false) }
  }

  const verdictStyle = {
    buy: { bg: '#EAF3DE', color: '#3B6D11', label: '✓ Buy it' },
    pass: { bg: '#FAECE7', color: '#993C1D', label: '✗ Pass' },
    wait: { bg: '#FAEEDA', color: '#633806', label: '⏳ Wait' },
  }

  return (
    <div className="page">
      <BackHeader title="Buy or Pass" onBack={onBack} />
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
        Paste a product link or describe an item and I'll tell you if it works for your wardrobe and style.
      </p>

      <input className="input" placeholder="Product URL (optional)" value={url} onChange={e => setUrl(e.target.value)} style={{ marginBottom: 10 }} />
      <textarea className="input" rows={3} placeholder="Or describe the item: color, style, what it is…" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: 12 }} />

      <button className="btn btn-primary" onClick={analyze} disabled={analyzing || (!url && !description)}
        style={{ width: '100%', justifyContent: 'center', padding: 12, marginBottom: 16 }}>
        {analyzing ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'white' }} /> Analyzing…</> : '✦ Get stylist verdict'}
      </button>

      {result && (
        <div className="card" style={{ marginBottom: 16 }}>
          {result.verdict && (
            <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', display: 'inline-block', marginBottom: 12, fontWeight: 700, fontSize: 16, background: verdictStyle[result.verdict]?.bg, color: verdictStyle[result.verdict]?.color }}>
              {verdictStyle[result.verdict]?.label}
            </div>
          )}
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{result.reason}</p>
          {result.what_to_look_for && (
            <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, color: 'var(--text-2)' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>What to look for instead</strong>
              {result.what_to_look_for}
            </div>
          )}
        </div>
      )}

      {shoppingHistory.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Recent</div>
          {shoppingHistory.slice(0,5).map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>
                {h.verdict === 'buy' ? '✓' : h.verdict === 'pass' ? '✗' : '⏳'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.url}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{h.date_analyzed?.slice(0,10)}</div>
              </div>
              <span className="badge" style={{ background: verdictStyle[h.verdict]?.bg, color: verdictStyle[h.verdict]?.color, textTransform: 'capitalize' }}>{h.verdict}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function Donate({ onBack }) {
  const { wardrobe, refresh, colorProfile, moodboards } = useAppState()
  const candidates = wardrobe.filter(i => i.status === 'donate' || i.status === 'maybe')
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeAll = async () => {
    setAnalyzing(true)
    try {
      for (const item of wardrobe.filter(i => !i.ai_notes)) {
        const result = await api.aiAnalyzeItem(item, wardrobe, colorProfile, moodboards)
        await api.updateItem(item.id, { ai_notes: JSON.stringify(result), status: result.status })
      }
      await refresh()
    } catch(e) { console.error(e) }
    finally { setAnalyzing(false) }
  }

  const setStatus = async (id, status) => {
    await api.updateItem(id, { status })
    await refresh()
  }

  return (
    <div className="page">
      <BackHeader title="Edit & Donate" onBack={onBack} />
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>
        Your AI stylist analyzes each piece for style alignment, color palette fit, and whether it's a staple or unique piece worth keeping.
      </p>

      {wardrobe.filter(i => !i.ai_notes).length > 0 && (
        <button className="btn" onClick={analyzeAll} disabled={analyzing} style={{ width: '100%', justifyContent: 'center', marginBottom: 16, borderColor: 'var(--pink)' }}>
          {analyzing ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Analyzing wardrobe…</> : `✦ Analyze ${wardrobe.filter(i=>!i.ai_notes).length} unanalyzed items`}
        </button>
      )}

      {candidates.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎉</div>
          <p>No items flagged for donation. Your closet is looking great!</p>
        </div>
      ) : (
        candidates.map(item => {
          const analysis = tryParse(item.ai_notes)
          return (
            <div key={item.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, overflow: 'hidden', flexShrink: 0 }}>
                  {item.photo_url ? <img src={item.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👗'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{item.name}</div>
                  {analysis?.reason && <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{analysis.reason}</div>}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => setStatus(item.id, 'keep')} style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>Keep</button>
                    <button className="btn btn-sm" onClick={() => setStatus(item.id, 'donate')} style={{ flex: 1, justifyContent: 'center', fontSize: 12, borderColor: '#F09595', color: '#A32D2D' }}>Donate</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function BackHeader({ title, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <button onClick={onBack} style={{ fontSize: 22, padding: 4 }}>←</button>
      <h1>{title}</h1>
    </div>
  )
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>
}

function tryParse(val, fallback = null) {
  try { return val ? JSON.parse(val) : fallback } catch { return fallback }
}

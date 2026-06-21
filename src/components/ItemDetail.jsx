// src/components/ItemDetail.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.jsx'
import * as api from '../lib/api.js'

export default function ItemDetail({ item, onClose }) {
  const { refresh, wardrobe, colorProfile, moodboards } = useAppState()
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(item.ai_notes ? tryParse(item.ai_notes) : null)
  const [deleting, setDeleting] = useState(false)

  const colors = tryParse(item.colors, [])
  const vibes = tryParse(item.vibes, [])
  const seasons = tryParse(item.seasons, [])

  const setStatus = async (status) => {
    await api.updateItem(item.id, { status })
    refresh()
    onClose()
  }

  const toggleFav = async () => {
    await api.updateItem(item.id, { is_favorite: item.is_favorite ? 0 : 1 })
    refresh()
  }

  const toggleLaundry = async () => {
    await api.updateItem(item.id, { in_laundry: item.in_laundry ? 0 : 1 })
    refresh()
  }

  const analyze = async () => {
    setAnalyzing(true)
    try {
      const result = await api.aiAnalyzeItem(item, wardrobe, colorProfile, moodboards)
      setAnalysis(result)
      await api.updateItem(item.id, { ai_notes: JSON.stringify(result), status: result.status })
      refresh()
    } catch(e) { console.error(e) }
    finally { setAnalyzing(false) }
  }

  const deleteItem = async () => {
    if (!confirm('Remove this item from your closet?')) return
    setDeleting(true)
    await api.deleteItem(item.id)
    await refresh()
    onClose()
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onClose} style={{ fontSize: 22, padding: 4 }}>←</button>
        <h1 style={{ flex: 1, fontSize: 18 }}>{item.name}</h1>
        <button onClick={toggleFav} style={{ fontSize: 22 }}>{item.is_favorite ? '❤️' : '🤍'}</button>
      </div>

      {/* Photo */}
      <div style={{ height: 260, background: 'var(--bg-2)', borderRadius: 'var(--radius)', marginBottom: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
        {item.photo_url
          ? <img src={item.photo_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '👗'}
      </div>

      {/* Details */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Category', value: item.category },
            { label: 'Brand', value: item.brand || '—' },
            { label: 'Size', value: item.size || '—' },
            { label: 'Status', value: item.in_laundry ? '🧺 In laundry' : item.status },
          ].map(d => (
            <div key={d.label}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{d.label}</div>
              <div style={{ fontSize: 14, textTransform: 'capitalize' }}>{d.value}</div>
            </div>
          ))}
        </div>
        {colors.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Colors</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {colors.map(c => <span key={c} className="badge" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>{c}</span>)}
            </div>
          </div>
        )}
        {vibes.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Vibes</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {vibes.map(v => <span key={v} className="badge badge-staple">{v}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div style={{ background: 'var(--pink-light)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>✦ AI Stylist</div>
        {analysis ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 10, lineHeight: 1.6 }}>{analysis.reason}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {analysis.is_staple && <span className="badge badge-staple">Staple</span>}
              {analysis.is_unique && <span className="badge badge-unique">Unique piece</span>}
              {analysis.palette_match && <span className="badge badge-keep">Palette ✓</span>}
              {!analysis.palette_match && <span className="badge badge-donate">Palette clash</span>}
            </div>
            {analysis.styling_tips?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pink-dark)', marginBottom: 6 }}>Styling tips</div>
                {analysis.styling_tips.map((t,i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 3 }}>• {t}</div>
                ))}
              </div>
            )}
          </>
        ) : (
          <button className="btn" onClick={analyze} disabled={analyzing}
            style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--pink)', background: 'transparent' }}>
            {analyzing ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Analyzing…</> : 'Analyze this piece'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className="btn btn-sm" onClick={toggleLaundry} style={{ flex: 1, justifyContent: 'center' }}>
          {item.in_laundry ? '✓ Back from laundry' : '🧺 In laundry'}
        </button>
        <button className="btn btn-sm" onClick={() => setStatus(item.status === 'donate' ? 'keep' : 'donate')}
          style={{ flex: 1, justifyContent: 'center', borderColor: '#F09595', color: item.status === 'donate' ? '#3B6D11' : '#A32D2D' }}>
          {item.status === 'donate' ? '↩ Keep it' : '🎁 Donate'}
        </button>
      </div>
      <button className="btn btn-sm btn-danger" onClick={deleteItem} disabled={deleting}
        style={{ width: '100%', justifyContent: 'center' }}>
        {deleting ? 'Removing…' : 'Remove from closet'}
      </button>
    </div>
  )
}

function tryParse(val, fallback = null) {
  try { return JSON.parse(val) } catch { return fallback }
}

// src/components/AddItem.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.js'
import * as api from '../lib/api.js'

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']
const COLORS = ['Black', 'White', 'Navy', 'Beige', 'Camel', 'Brown', 'Grey', 'Cream', 'Rust', 'Olive', 'Forest Green', 'Burgundy', 'Blush', 'Pink', 'Red', 'Orange', 'Yellow', 'Blue', 'Purple', 'Gold', 'Silver', 'Print/Pattern']
const VIBES = ['Everyday', 'Work', 'Weekend', 'Evening', 'Date Night', 'Casual', 'Smart Casual', 'Formal', 'Vacation', 'Active']
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']

export default function AddItem({ onClose }) {
  const { refresh, wardrobe, colorProfile, moodboards } = useAppState()
  const [photo, setPhoto] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [form, setForm] = useState({
    name: '', category: '', subcategory: '', brand: '', size: '',
    colors: [], vibes: [], seasons: [], status: 'keep',
  })
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => set(k, form[k].includes(v) ? form[k].filter(x=>x!==v) : [...form[k], v])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhoto(URL.createObjectURL(file))
  }

  const analyzeWithAI = async () => {
    if (!form.name || !form.category) return
    setAnalyzing(true)
    try {
      const analysis = await api.aiAnalyzeItem(form, wardrobe, colorProfile, moodboards)
      setAiAnalysis(analysis)
      if (analysis.status) set('status', analysis.status)
    } catch(e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  const save = async () => {
    if (!form.name || !form.category) return alert('Name and category are required')
    setSaving(true)
    try {
      let photo_url = null
      if (photoFile) {
        const res = await api.uploadPhoto(photoFile)
        photo_url = res.url
      }
      await api.addItem({
        ...form,
        photo_url,
        ai_notes: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
      })
      await refresh()
      onClose()
    } catch(e) {
      alert('Failed to save item')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onClose} style={{ fontSize: 22, padding: 4 }}>←</button>
        <h1>Add Item</h1>
      </div>

      {/* Photo */}
      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{
          height: 200, border: '2px dashed var(--border-2)', borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-2)',
        }}>
          {photo
            ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 14 }}>Tap to add photo</div>
              </div>}
        </div>
        <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
      </label>

      {/* Name */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Item name *</label>
        <input className="input" style={{ marginTop: 6 }} placeholder="e.g. Black silk slip dress"
          value={form.name} onChange={e => set('name', e.target.value)} />
      </div>

      {/* Category */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => set('category', c.toLowerCase())} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13,
              background: form.category === c.toLowerCase() ? 'var(--pink)' : 'var(--bg-2)',
              color: form.category === c.toLowerCase() ? 'white' : 'var(--text-2)',
              border: 'none',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Colors</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => toggle('colors', c)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              background: form.colors.includes(c) ? 'var(--pink-light)' : 'var(--bg-2)',
              color: form.colors.includes(c) ? 'var(--pink-dark)' : 'var(--text-2)',
              border: form.colors.includes(c) ? '1px solid var(--pink)' : '1px solid transparent',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Vibes */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vibes</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {VIBES.map(v => (
            <button key={v} onClick={() => toggle('vibes', v)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              background: form.vibes.includes(v) ? '#EEEDFE' : 'var(--bg-2)',
              color: form.vibes.includes(v) ? '#3C3489' : 'var(--text-2)',
              border: form.vibes.includes(v) ? '1px solid #7F77DD' : '1px solid transparent',
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Seasons */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Seasons</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {SEASONS.map(s => (
            <button key={s} onClick={() => toggle('seasons', s)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              background: form.seasons.includes(s) ? '#EAF3DE' : 'var(--bg-2)',
              color: form.seasons.includes(s) ? '#3B6D11' : 'var(--text-2)',
              border: form.seasons.includes(s) ? '1px solid #639922' : '1px solid transparent',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Brand + size */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Brand</label>
          <input className="input" style={{ marginTop: 6 }} placeholder="e.g. Zara"
            value={form.brand} onChange={e => set('brand', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Size</label>
          <input className="input" style={{ marginTop: 6 }} placeholder="e.g. S / 6"
            value={form.size} onChange={e => set('size', e.target.value)} />
        </div>
      </div>

      {/* AI analyze */}
      {(form.name && form.category) && (
        <div style={{ background: 'var(--pink-light)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 16 }}>
          {aiAnalysis ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>✦ AI Stylist says:</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>{aiAnalysis.reason}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {aiAnalysis.is_staple && <span className="badge badge-staple">Staple</span>}
                {aiAnalysis.is_unique && <span className="badge badge-unique">Unique</span>}
                {aiAnalysis.palette_match && <span className="badge badge-keep">Palette ✓</span>}
              </div>
            </div>
          ) : (
            <button className="btn" onClick={analyzeWithAI} disabled={analyzing}
              style={{ width: '100%', justifyContent: 'center', background: 'transparent', borderColor: 'var(--pink)' }}>
              {analyzing ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Analyzing…</> : '✦ Analyze with AI Stylist'}
            </button>
          )}
        </div>
      )}

      <button className="btn btn-primary" onClick={save} disabled={saving}
        style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16, marginBottom: 8 }}>
        {saving ? 'Saving…' : 'Save to Closet'}
      </button>
      <button className="btn" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Cancel</button>
    </div>
  )
}

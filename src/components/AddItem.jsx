// src/components/AddItem.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.jsx'
import * as api from '../lib/api.js'

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']
const COLORS = ['Black', 'White', 'Navy', 'Beige', 'Camel', 'Brown', 'Grey', 'Cream', 'Rust', 'Olive', 'Forest Green', 'Burgundy', 'Blush', 'Pink', 'Red', 'Orange', 'Yellow', 'Blue', 'Purple', 'Gold', 'Silver', 'Print/Pattern']
const VIBES = ['Everyday', 'Work', 'Weekend', 'Evening', 'Date Night', 'Casual', 'Smart Casual', 'Formal', 'Vacation', 'Active']
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']

export default function AddItem({ onClose }) {
  const { refresh, wardrobe, colorProfile, moodboards } = useAppState()
  const [mode, setMode] = useState('choose') // choose | url | photo
  const [photo, setPhoto] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [form, setForm] = useState({
    name: '', category: '', subcategory: '', brand: '', size: '',
    colors: [], vibes: [], seasons: [], status: 'keep', purchase_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [importedImageUrl, setImportedImageUrl] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => set(k, form[k].includes(v) ? form[k].filter(x=>x!==v) : [...form[k], v])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhoto(URL.createObjectURL(file))
  }

  const importFromUrl = async () => {
    if (!urlInput.trim()) return
    setImporting(true)
    try {
      const result = await api.importFromUrl(urlInput.trim())
      // Pre-fill form with whatever AI extracted
      if (result.name) set('name', result.name)
      if (result.brand) set('brand', result.brand)
      if (result.price) set('purchase_price', result.price)
      if (result.category) set('category', result.category.toLowerCase())
      if (result.colors?.length) set('colors', result.colors)
      if (result.description) set('subcategory', result.description)
      set('purchase_url', urlInput.trim())
      if (result.image_url) setImportedImageUrl(result.image_url)
      setMode('photo') // move to the form
    } catch(e) {
      alert('Could not import from that URL. Try a different link or add manually.')
      console.error(e)
    } finally {
      setImporting(false)
    }
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
      let photo_url = importedImageUrl || null
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

  // ── CHOOSE MODE ──────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={onClose} style={{ fontSize: 22, padding: 4 }}>←</button>
          <h1>Add Item</h1>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
          How would you like to add this item?
        </p>

        <button onClick={() => setMode('url')} style={{
          display: 'flex', alignItems: 'center', gap: 16, width: '100%',
          padding: '18px 16px', borderRadius: 'var(--radius)', marginBottom: 12,
          border: '1px solid var(--cream-mid)', background: 'var(--white)', cursor: 'pointer',
          textAlign: 'left',
        }}>
          <span style={{ fontSize: 32 }}>🔗</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Import from website</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Paste a link from Zara, ASOS, Net-a-Porter, anywhere — I'll fill in the details</div>
          </div>
        </button>

        <button onClick={() => setMode('photo')} style={{
          display: 'flex', alignItems: 'center', gap: 16, width: '100%',
          padding: '18px 16px', borderRadius: 'var(--radius)', marginBottom: 12,
          border: '1px solid var(--cream-mid)', background: 'var(--white)', cursor: 'pointer',
          textAlign: 'left',
        }}>
          <span style={{ fontSize: 32 }}>📷</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Take or upload a photo</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Photograph something you own, or upload from your camera roll</div>
          </div>
        </button>

        <button onClick={() => setMode('photo')} style={{
          display: 'flex', alignItems: 'center', gap: 16, width: '100%',
          padding: '18px 16px', borderRadius: 'var(--radius)',
          border: '1px solid var(--cream-mid)', background: 'var(--white)', cursor: 'pointer',
          textAlign: 'left',
        }}>
          <span style={{ fontSize: 32 }}>✏️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Add manually</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Type the details yourself, no photo needed</div>
          </div>
        </button>
      </div>
    )
  }

  // ── URL IMPORT MODE ──────────────────────────────────────
  if (mode === 'url') {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setMode('choose')} style={{ fontSize: 22, padding: 4 }}>←</button>
          <h1>Import from URL</h1>
        </div>

        <div style={{ background: 'var(--copper-pale)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--copper-dark)' }}>✦ How it works</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Paste any product link. Your AI stylist will extract the name, brand, colors, price, and product image automatically — then you can review and save.
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Product URL</label>
          <input
            className="input" style={{ marginTop: 6 }}
            placeholder="https://www.zara.com/..."
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && importFromUrl()}
          />
        </div>

        <button className="btn btn-primary" onClick={importFromUrl} disabled={importing || !urlInput.trim()}
          style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginBottom: 12 }}>
          {importing
            ? <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} /> Importing…</>
            : '✦ Import item'}
        </button>

        <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12, marginBottom: 20 }}>— or —</div>

        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Works great with</div>
        {['Zara', 'ASOS', 'Net-a-Porter', 'H&M', 'Mango', 'Anthropologie', 'Free People', 'Nordstrom', '& Other Stories', 'Revolve', 'Shopbop', 'Farfetch'].map(store => (
          <span key={store} style={{ display: 'inline-block', margin: '0 6px 6px 0', padding: '4px 10px', borderRadius: 20, fontSize: 12, background: 'var(--bg-2)', color: 'var(--text-2)' }}>{store}</span>
        ))}
      </div>
    )
  }

  // ── PHOTO / FORM MODE ────────────────────────────────────
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setMode('choose')} style={{ fontSize: 22, padding: 4 }}>←</button>
        <h1>{importedImageUrl ? 'Review Import' : 'Add Item'}</h1>
      </div>

      {/* Import success banner */}
      {importedImageUrl && (
        <div style={{ background: '#EAF3DE', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#3B6D11', fontWeight: 500 }}>
          ✓ Details imported! Review and edit below, then save.
        </div>
      )}

      {/* Photo */}
      <label style={{ display: 'block', marginBottom: 16, cursor: 'pointer' }}>
        <div style={{
          height: 200, border: '2px dashed var(--border-2)', borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: 'var(--bg-2)', position: 'relative',
        }}>
          {photo || importedImageUrl
            ? <>
                <img src={photo || importedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, padding: '4px 10px', borderRadius: 20 }}>
                  {photo ? 'Tap to change' : 'Tap to replace with your photo'}
                </div>
              </>
            : <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 14 }}>Tap to add photo</div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-3)' }}>or skip — emoji will show instead</div>
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
              background: form.category === c.toLowerCase() ? 'var(--copper)' : 'var(--cream-dark)',
              color: form.category === c.toLowerCase() ? '#FFFFFF' : 'var(--ink-2)',
              border: form.category === c.toLowerCase() ? '1px solid var(--copper)' : '1px solid transparent',
              fontWeight: form.category === c.toLowerCase() ? 600 : 400,
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
              background: form.colors.includes(c) ? 'var(--copper)' : 'var(--cream-dark)',
              color: form.colors.includes(c) ? '#FFFFFF' : 'var(--ink-2)',
              border: form.colors.includes(c) ? '1px solid var(--copper)' : '1px solid transparent',
              fontWeight: form.colors.includes(c) ? 600 : 400,
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
              background: form.vibes.includes(v) ? 'var(--copper)' : 'var(--cream-dark)',
              color: form.vibes.includes(v) ? '#FFFFFF' : 'var(--ink-2)',
              border: form.vibes.includes(v) ? '1px solid var(--copper)' : '1px solid transparent',
              fontWeight: form.vibes.includes(v) ? 600 : 400,
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
              background: form.seasons.includes(s) ? 'var(--copper)' : 'var(--cream-dark)',
              color: form.seasons.includes(s) ? '#FFFFFF' : 'var(--ink-2)',
              border: form.seasons.includes(s) ? '1px solid var(--copper)' : '1px solid transparent',
              fontWeight: form.seasons.includes(s) ? 600 : 400,
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

      {/* Purchase URL if added manually */}
      {!importedImageUrl && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Product URL (optional)</label>
          <input className="input" style={{ marginTop: 6 }} placeholder="https://..."
            value={form.purchase_url} onChange={e => set('purchase_url', e.target.value)} />
        </div>
      )}

      {/* AI analyze */}
      {(form.name && form.category) && (
        <div style={{ background: 'var(--copper-pale)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 16 }}>
          {aiAnalysis ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--copper-dark)' }}>✦ AI Stylist says:</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8, lineHeight: 1.6 }}>{aiAnalysis.reason}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {aiAnalysis.is_staple && <span className="badge badge-staple">Staple</span>}
                {aiAnalysis.is_unique && <span className="badge badge-unique">Unique</span>}
                {aiAnalysis.palette_match && <span className="badge badge-keep">Palette ✓</span>}
              </div>
            </div>
          ) : (
            <button className="btn" onClick={analyzeWithAI} disabled={analyzing}
              style={{ width: '100%', justifyContent: 'center', background: 'transparent', borderColor: 'var(--copper)' }}>
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

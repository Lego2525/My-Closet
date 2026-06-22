// src/components/ItemDetail.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.jsx'
import * as api from '../lib/api.js'

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']
const COLORS = ['Black', 'White', 'Navy', 'Beige', 'Camel', 'Brown', 'Grey', 'Cream', 'Rust', 'Olive', 'Forest Green', 'Burgundy', 'Blush', 'Pink', 'Red', 'Orange', 'Yellow', 'Blue', 'Purple', 'Gold', 'Silver', 'Print/Pattern']
const VIBES = ['Everyday', 'Work', 'Weekend', 'Evening', 'Date Night', 'Casual', 'Smart Casual', 'Formal', 'Vacation', 'Active']
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
const OCCASIONS = ['Office', 'Brunch', 'Dinner', 'Party', 'Wedding', 'Beach', 'Travel', 'Gym', 'Date', 'Festival', 'Errands', 'Lounging']

export default function ItemDetail({ item, onClose }) {
  const { refresh, wardrobe, colorProfile, moodboards } = useAppState()
  const [mode, setMode] = useState('view') // view | edit
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(item.ai_notes ? tryParse(item.ai_notes) : null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newPhoto, setNewPhoto] = useState(null)
  const [newPhotoFile, setNewPhotoFile] = useState(null)

  const [form, setForm] = useState({
    name: item.name || '',
    category: item.category || '',
    subcategory: item.subcategory || '',
    brand: item.brand || '',
    size: item.size || '',
    colors: tryParse(item.colors, []),
    vibes: tryParse(item.vibes, []),
    seasons: tryParse(item.seasons, []),
    occasions: tryParse(item.occasions, []),
    purchase_url: item.purchase_url || '',
    tags: tryParse(item.tags, []),
  })
  const [newTag, setNewTag] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => set(k, form[k].includes(v) ? form[k].filter(x=>x!==v) : [...form[k], v])

  const colors = tryParse(item.colors, [])
  const vibes = tryParse(item.vibes, [])
  const seasons = tryParse(item.seasons, [])
  const occasions = tryParse(item.occasions, [])

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

  const handleNewPhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setNewPhotoFile(file)
    setNewPhoto(URL.createObjectURL(file))
  }

  const saveEdit = async () => {
    if (!form.name || !form.category) return alert('Name and category are required')
    setSaving(true)
    try {
      let photo_url = item.photo_url
      if (newPhotoFile) {
        const res = await api.uploadPhoto(newPhotoFile)
        photo_url = res.url
      }
      await api.updateItem(item.id, {
        ...form,
        colors: JSON.stringify(form.colors),
        vibes: JSON.stringify(form.vibes),
        seasons: JSON.stringify(form.seasons),
        occasions: JSON.stringify(form.occasions),
        tags: JSON.stringify(form.tags),
        photo_url,
      })
      await refresh()
      setMode('view')
    } catch(e) {
      alert('Failed to save changes')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (!newTag.trim()) return
    set('tags', [...form.tags, newTag.trim()])
    setNewTag('')
  }

  const archiveItem = async (reason) => {
    const currentTags = tryParse(item.tags, [])
    await api.updateItem(item.id, {
      status: 'archived',
      tags: JSON.stringify([...currentTags, `archived:${reason}`, `archived:${new Date().toISOString().slice(0,10)}`])
    })
    await refresh()
    onClose()
  }

  const deleteItem = async () => {
    if (!confirm('Permanently remove this item? This cannot be undone.\n\nTip: use Archive instead to keep a history.')) return
    setDeleting(true)
    await api.deleteItem(item.id)
    await refresh()
    onClose()
  }

  // ── EDIT MODE ────────────────────────────────────────────
  if (mode === 'edit') {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setMode('view')} style={{ fontSize: 22, padding: 4 }}>←</button>
          <h1 style={{ flex: 1, fontSize: 18 }}>Edit Item</h1>
          <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {/* Photo */}
        <label style={{ display: 'block', marginBottom: 16, cursor: 'pointer' }}>
          <div style={{
            height: 180, borderRadius: 'var(--radius)', overflow: 'hidden',
            background: 'var(--bg-2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 48, position: 'relative',
            border: '2px dashed var(--border-2)',
          }}>
            {newPhoto || item.photo_url
              ? <img src={newPhoto || item.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '👗'}
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, padding: '4px 10px', borderRadius: 20 }}>
              Tap to change photo
            </div>
          </div>
          <input type="file" accept="image/*" onChange={handleNewPhoto} style={{ display: 'none' }} />
        </label>

        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <Label>Name *</Label>
          <input className="input" style={{ marginTop: 6 }} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 14 }}>
          <Label>Category *</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {CATEGORIES.map(c => (
              <Chip key={c} active={form.category === c.toLowerCase()} color="pink" onClick={() => set('category', c.toLowerCase())}>{c}</Chip>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div style={{ marginBottom: 14 }}>
          <Label>Colors</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {COLORS.map(c => (
              <Chip key={c} active={form.colors.includes(c)} color="pink" onClick={() => toggle('colors', c)}>{c}</Chip>
            ))}
          </div>
        </div>

        {/* Vibes */}
        <div style={{ marginBottom: 14 }}>
          <Label>Vibes</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {VIBES.map(v => (
              <Chip key={v} active={form.vibes.includes(v)} color="purple" onClick={() => toggle('vibes', v)}>{v}</Chip>
            ))}
          </div>
        </div>

        {/* Occasions */}
        <div style={{ marginBottom: 14 }}>
          <Label>Occasions</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {OCCASIONS.map(o => (
              <Chip key={o} active={form.occasions.includes(o)} color="teal" onClick={() => toggle('occasions', o)}>{o}</Chip>
            ))}
          </div>
        </div>

        {/* Seasons */}
        <div style={{ marginBottom: 14 }}>
          <Label>Seasons</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {SEASONS.map(s => (
              <Chip key={s} active={form.seasons.includes(s)} color="green" onClick={() => toggle('seasons', s)}>{s}</Chip>
            ))}
          </div>
        </div>

        {/* Brand + Size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <Label>Brand</Label>
            <input className="input" style={{ marginTop: 6 }} placeholder="e.g. Zara" value={form.brand} onChange={e => set('brand', e.target.value)} />
          </div>
          <div>
            <Label>Size</Label>
            <input className="input" style={{ marginTop: 6 }} placeholder="e.g. S / 6" value={form.size} onChange={e => set('size', e.target.value)} />
          </div>
        </div>

        {/* Custom tags */}
        <div style={{ marginBottom: 14 }}>
          <Label>Custom tags</Label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 8 }}>
            <input className="input" placeholder="Add a tag…" value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              style={{ flex: 1 }} />
            <button className="btn btn-sm" onClick={addTag}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {form.tags.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, background: 'var(--bg-2)', color: 'var(--text-2)' }}>
                {t}
                <button onClick={() => set('tags', form.tags.filter((_,j)=>j!==i))} style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Purchase URL */}
        <div style={{ marginBottom: 20 }}>
          <Label>Product URL</Label>
          <input className="input" style={{ marginTop: 6 }} placeholder="https://..." value={form.purchase_url} onChange={e => set('purchase_url', e.target.value)} />
        </div>

        <button className="btn btn-primary" onClick={saveEdit} disabled={saving}
          style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16, marginBottom: 8 }}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="btn" onClick={() => setMode('view')} style={{ width: '100%', justifyContent: 'center' }}>Cancel</button>
      </div>
    )
  }

  // ── VIEW MODE ────────────────────────────────────────────
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onClose} style={{ fontSize: 22, padding: 4 }}>←</button>
        <h1 style={{ flex: 1, fontSize: 18 }}>{item.name}</h1>
        <button onClick={() => setMode('edit')} style={{ fontSize: 13, padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-2)', background: 'var(--bg)' }}>✏️ Edit</button>
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

        {colors.length > 0 && <TagRow label="Colors" items={colors} style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }} />}
        {vibes.length > 0 && <TagRow label="Vibes" items={vibes} style={{ background: '#EEEDFE', color: '#3C3489' }} />}
        {occasions.length > 0 && <TagRow label="Occasions" items={occasions} style={{ background: '#E1F5EE', color: '#0F6E56' }} />}
        {seasons.length > 0 && <TagRow label="Seasons" items={seasons} style={{ background: '#EAF3DE', color: '#3B6D11' }} />}
        {tryParse(item.tags, []).length > 0 && <TagRow label="Tags" items={tryParse(item.tags, [])} style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }} />}
        {item.purchase_url && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Product link</div>
            <a href={item.purchase_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--pink)' }}>View original →</a>
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
            <button className="btn btn-sm" onClick={analyze} disabled={analyzing} style={{ marginTop: 10 }}>
              {analyzing ? 'Re-analyzing…' : '↺ Re-analyze'}
            </button>
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
          {item.in_laundry ? '✓ Back from laundry' : '🧺 Laundry'}
        </button>
        <button className="btn btn-sm" onClick={() => setStatus(item.status === 'donate' ? 'keep' : 'donate')}
          style={{ flex: 1, justifyContent: 'center', borderColor: '#F09595', color: item.status === 'donate' ? '#3B6D11' : '#A32D2D' }}>
          {item.status === 'donate' ? '↩ Keep it' : '🎁 Donate'}
        </button>
      </div>

      {/* Archive */}
      {item.status !== 'archived' ? (
        <ArchiveButton onArchive={archiveItem} />
      ) : (
        <div style={{ background: '#F4F0E8', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 8, fontSize: 13, color: '#666' }}>
          📦 Archived · <button onClick={() => setStatus('keep')} style={{ color: 'var(--pink)', fontWeight: 500, fontSize: 13 }}>Restore to closet</button>
        </div>
      )}

      <button className="btn btn-sm btn-danger" onClick={deleteItem} disabled={deleting}
        style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
        {deleting ? 'Removing…' : '🗑 Delete permanently'}
      </button>
    </div>
  )
}

function TagRow({ label, items, style }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map(i => <span key={i} className="badge" style={style}>{i}</span>)}
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>
}

function Chip({ children, active, color, onClick }) {
  const colors = {
    pink: { active: { background: 'var(--pink)', color: 'white' }, inactive: { background: 'var(--bg-2)', color: 'var(--text-2)' } },
    purple: { active: { background: '#EEEDFE', color: '#3C3489', border: '1px solid #7F77DD' }, inactive: { background: 'var(--bg-2)', color: 'var(--text-2)' } },
    green: { active: { background: '#EAF3DE', color: '#3B6D11', border: '1px solid #639922' }, inactive: { background: 'var(--bg-2)', color: 'var(--text-2)' } },
    teal: { active: { background: '#E1F5EE', color: '#0F6E56', border: '1px solid #1D9E75' }, inactive: { background: 'var(--bg-2)', color: 'var(--text-2)' } },
  }
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 20, fontSize: 12, border: 'none',
      ...(active ? colors[color].active : colors[color].inactive)
    }}>{children}</button>
  )
}

function ArchiveButton({ onArchive }) {
  const [open, setOpen] = useState(false)
  const reasons = [
    { label: 'Donated', emoji: '🎁' },
    { label: 'Sold', emoji: '💰' },
    { label: 'Gave away', emoji: '🤝' },
    { label: 'Worn out', emoji: '🪡' },
    { label: 'Lost', emoji: '🔍' },
    { label: 'Other', emoji: '📦' },
  ]
  if (!open) return (
    <button className="btn btn-sm" onClick={() => setOpen(true)}
      style={{ width: '100%', justifyContent: 'center', marginBottom: 8, borderColor: '#B4A882', color: '#6B5E3E' }}>
      📦 Archive this item
    </button>
  )
  return (
    <div style={{ background: '#F4F0E8', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#6B5E3E' }}>Why are you archiving this?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {reasons.map(r => (
          <button key={r.label} onClick={() => onArchive(r.label.toLowerCase())} style={{
            padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: 13,
            border: '1px solid #C8BA9A', background: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{r.emoji}</span> {r.label}
          </button>
        ))}
      </div>
      <button onClick={() => setOpen(false)} style={{ fontSize: 13, color: 'var(--text-3)', width: '100%', textAlign: 'center' }}>Cancel</button>
    </div>
  )
}

function tryParse(val, fallback = null) {
  try { return JSON.parse(val) } catch { return fallback }
}

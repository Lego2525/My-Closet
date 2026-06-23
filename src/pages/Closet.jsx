// src/pages/Closet.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.jsx'
import AddItem from '../components/AddItem.jsx'
import ItemDetail from '../components/ItemDetail.jsx'

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']
const CATEGORY_EMOJI = { tops:'👕', bottoms:'👖', dresses:'👗', outerwear:'🧥', shoes:'👟', accessories:'💍', bags:'👜' }

export default function Closet() {
  const { wardrobe, loading } = useAppState()
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)

  const filtered = wardrobe.filter(item => {
    if (item.status === 'archived') return false
    const matchCat = cat === 'All' || item.category.toLowerCase() === cat.toLowerCase()
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const stats = {
    total: wardrobe.length,
    staples: wardrobe.filter(i => i.ai_notes?.includes('"is_staple":true')).length,
    donate: wardrobe.filter(i => i.status === 'donate').length,
  }

  if (showAdd) return <AddItem onClose={() => setShowAdd(false)} />
  if (selected) return <ItemDetail item={selected} onClose={() => setSelected(null)} />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ flex: 1 }}>My Closet</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Items', value: stats.total },
          { label: 'Staples', value: stats.staples },
          { label: 'Donate?', value: stats.donate },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input className="input" placeholder="🔍  Search your closet…" value={search}
        onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 20,
            fontSize: 13, fontWeight: cat === c ? 600 : 400,
            background: cat === c ? 'var(--pink-light)' : 'var(--bg-2)',
            color: cat === c ? 'var(--pink-dark)' : 'var(--text-2)',
            border: cat === c ? '1px solid var(--pink)' : '1px solid transparent',
          }}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👗</div>
          <p>{wardrobe.length === 0 ? 'Your closet is empty — add your first item!' : 'No items match your filter.'}</p>
          {wardrobe.length === 0 && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add First Item</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemCard({ item, onClick }) {
  const colors = tryParse(item.colors, [])
  const emoji = CATEGORY_EMOJI[item.category?.toLowerCase()] || '👗'

  return (
    <div onClick={onClick} style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      overflow: 'hidden', cursor: 'pointer', background: 'var(--bg)',
    }}>
      <div style={{
        height: 140, background: 'var(--bg-2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 48,
      }}>
        {item.photo_url
          ? <img src={item.photo_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : emoji}
        {item.status === 'donate' && <span className="badge badge-donate" style={{ position: 'absolute', top: 6, right: 6 }}>Donate?</span>}
        {item.is_favorite ? <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 16 }}>❤️</span> : null}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{colors.slice(0,2).join(' · ')}</div>
      </div>
    </div>
  )
}

function tryParse(val, fallback) {
  try { return JSON.parse(val) } catch { return fallback }
}

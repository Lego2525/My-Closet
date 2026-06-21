// src/pages/Outfits.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.js'
import * as api from '../lib/api.js'

export default function Outfits() {
  const { outfits, wardrobe, colorProfile, moodboards, weather, aiContext, refresh } = useAppState()
  const [tab, setTab] = useState('build')
  const [building, setBuilding] = useState(false)
  const [builtOutfit, setBuiltOutfit] = useState(null)
  const [occasion, setOccasion] = useState('')
  const [vibe, setVibe] = useState('')
  const [saving, setSaving] = useState(false)

  const weatherDesc = weather?.current
    ? `${Math.round(weather.current.temperature_2m)}°F`
    : 'mild'

  const buildOutfit = async () => {
    setBuilding(true)
    setBuiltOutfit(null)
    try {
      const result = await api.aiOutfit({
        occasion: occasion || 'casual',
        vibe: vibe || 'everyday',
        weather: weatherDesc,
        wardrobe,
        colorProfile,
        moodboards,
      })
      const outfitItems = wardrobe.filter(i => result.item_ids?.includes(i.id))
      setBuiltOutfit({ ...result, items: outfitItems })
    } catch(e) { alert('Could not build outfit') }
    finally { setBuilding(false) }
  }

  const saveBuilt = async () => {
    if (!builtOutfit) return
    setSaving(true)
    try {
      await api.saveOutfit({
        name: builtOutfit.name,
        item_ids: builtOutfit.item_ids,
        occasion, vibe, source: 'ai',
        notes: builtOutfit.reasoning,
      })
      await refresh()
      setBuiltOutfit(null)
      setTab('saved')
    } catch(e) { alert('Failed to save') }
    finally { setSaving(false) }
  }

  const deleteOutfit = async (id) => {
    await api.deleteOutfit(id)
    await refresh()
  }

  const occasions = ['Work', 'Casual', 'Date night', 'Weekend', 'Formal', 'Travel', 'Beach', 'Party']
  const vibes = ['Minimal', 'Chic', 'Cozy', 'Bold', 'Romantic', 'Edgy', 'Classic', 'Playful']

  return (
    <div className="page">
      <h1 style={{ marginBottom: 16 }}>Outfits</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {['build', 'saved'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: tab === t ? 600 : 400,
            color: tab === t ? 'var(--pink)' : 'var(--text-2)',
            borderBottom: tab === t ? '2px solid var(--pink)' : '2px solid transparent',
            background: 'none', textTransform: 'capitalize',
          }}>{t === 'build' ? '✨ Build outfit' : `❤️ Saved (${outfits.length})`}</button>
        ))}
      </div>

      {tab === 'build' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Occasion</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {occasions.map(o => (
                <button key={o} onClick={() => setOccasion(o)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, border: 'none',
                  background: occasion === o ? 'var(--pink)' : 'var(--bg-2)',
                  color: occasion === o ? 'white' : 'var(--text-2)',
                }}>{o}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Vibe</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vibes.map(v => (
                <button key={v} onClick={() => setVibe(v)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, border: 'none',
                  background: vibe === v ? '#EEEDFE' : 'var(--bg-2)',
                  color: vibe === v ? '#3C3489' : 'var(--text-2)',
                }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-2)' }}>
            🌤 {weatherDesc} today · Using your active style boards
          </div>

          <button className="btn btn-primary" onClick={buildOutfit} disabled={building}
            style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginBottom: 16 }}>
            {building ? <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} /> Building outfit…</> : '✨ Build my outfit'}
          </button>

          {builtOutfit && (
            <div style={{ background: 'var(--pink-light)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{builtOutfit.name}</div>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 12 }}>{builtOutfit.reasoning}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {builtOutfit.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    <span style={{ fontSize: 20 }}>
                      {item.photo_url
                        ? <img src={item.photo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                        : '👗'}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'capitalize' }}>{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
              {builtOutfit.styling_note && (
                <div style={{ fontSize: 12, color: 'var(--pink-dark)', fontStyle: 'italic', marginBottom: 12 }}>
                  ✦ {builtOutfit.styling_note}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveBuilt} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Saving…' : '❤️ Save look'}
                </button>
                <button className="btn btn-sm" onClick={buildOutfit} style={{ flex: 1, justifyContent: 'center' }}>
                  ↺ Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'saved' && (
        outfits.length === 0 ? (
          <div className="empty-state">
            <div className="icon">❤️</div>
            <p>No saved outfits yet. Build one and save it!</p>
            <button className="btn btn-primary" onClick={() => setTab('build')}>Build an outfit</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {outfits.map(outfit => {
              const itemIds = tryParse(outfit.item_ids, [])
              const items = wardrobe.filter(i => itemIds.includes(i.id))
              return (
                <div key={outfit.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{outfit.name || 'Untitled look'}</div>
                      {outfit.occasion && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{outfit.occasion}</div>}
                    </div>
                    <button onClick={() => deleteOutfit(outfit.id)} style={{ color: 'var(--text-3)', fontSize: 18, padding: 4 }}>×</button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{items.map(i=>i.name).join(' · ')}</div>
                  {outfit.notes && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, fontStyle: 'italic' }}>{outfit.notes}</div>}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

function tryParse(val, fallback = []) {
  try { return JSON.parse(val) } catch { return fallback }
}

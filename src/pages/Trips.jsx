// src/pages/Trips.jsx
import { useState } from 'react'
import { useAppState } from '../hooks/useAppState.js'
import * as api from '../lib/api.js'

export default function Trips() {
  const { trips, refresh, wardrobe, colorProfile, moodboards } = useAppState()
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)

  if (showNew) return <NewTrip onClose={() => { setShowNew(false); refresh() }} />
  if (selected) return <TripDetail trip={selected} onClose={() => setSelected(null)} />

  const upcoming = trips.filter(t => t.status !== 'completed')
  const past = trips.filter(t => t.status === 'completed')

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ flex: 1 }}>Trips</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ Plan trip</button>
      </div>

      {trips.length === 0 && (
        <div className="empty-state">
          <div className="icon">✈️</div>
          <p>No trips planned yet. Add your first trip and I'll pack your bags.</p>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>Plan a trip</button>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Upcoming</div>
          {upcoming.map(trip => <TripCard key={trip.id} trip={trip} onClick={() => setSelected(trip)} />)}
        </>
      )}

      {past.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 20 }}>Past trips</div>
          {past.map(trip => <TripCard key={trip.id} trip={trip} onClick={() => setSelected(trip)} />)}
        </>
      )}
    </div>
  )
}

function TripCard({ trip, onClick }) {
  const days = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000*60*60*24))
  const packed = tryParse(trip.packed_item_ids, [])

  return (
    <div className="card" onClick={onClick} style={{ marginBottom: 10, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 36 }}>✈️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{trip.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{trip.destination}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            {trip.start_date} · {days} day{days !== 1 ? 's' : ''}
            {packed.length > 0 ? ` · ${packed.length} items packed` : ''}
          </div>
        </div>
        <span className="badge" style={{ background: trip.status === 'packed' ? '#EAF3DE' : '#EEEDFE', color: trip.status === 'packed' ? '#3B6D11' : '#3C3489', textTransform: 'capitalize' }}>
          {trip.status}
        </span>
      </div>
    </div>
  )
}

function NewTrip({ onClose }) {
  const [form, setForm] = useState({
    name: '', destination: '', start_date: '', end_date: '',
    purpose: '', vibe: '', notes: '', co_travelers: [], occasions: [],
  })
  const [saving, setSaving] = useState(false)
  const [newOccasion, setNewOccasion] = useState({ name: '', dress_code: '', notes: '' })
  const [travelers, setTravelers] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addOccasion = () => {
    if (!newOccasion.name) return
    set('occasions', [...form.occasions, newOccasion])
    setNewOccasion({ name: '', dress_code: '', notes: '' })
  }

  const save = async () => {
    if (!form.name || !form.destination || !form.start_date || !form.end_date) return alert('Please fill in the required fields')
    setSaving(true)
    try {
      const travelersArr = travelers ? travelers.split(',').map(t => t.trim()).filter(Boolean) : []
      await api.addTrip({ ...form, co_travelers: travelersArr })
      onClose()
    } catch(e) { alert('Failed to save trip') }
    finally { setSaving(false) }
  }

  const purposes = ['Vacation', 'Work trip', 'Weekend getaway', 'Wedding', 'Family visit', 'City break', 'Beach', 'Ski/Snow', 'Festival', 'Other']
  const vibes = ['Relaxed', 'Adventurous', 'Glamorous', 'Business', 'Romantic', 'Active', 'Cultural', 'Party']

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onClose} style={{ fontSize: 22, padding: 4 }}>←</button>
        <h1>Plan a Trip</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Trip name *">
          <input className="input" placeholder="e.g. Paris girls trip" value={form.name} onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="Destination *">
          <input className="input" placeholder="e.g. Paris, France" value={form.destination} onChange={e => set('destination', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="From *">
            <input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </Field>
          <Field label="To *">
            <input type="date" className="input" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
          </Field>
        </div>
        <Field label="Purpose">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {purposes.map(p => (
              <button key={p} onClick={() => set('purpose', p)} style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 13, border: 'none',
                background: form.purpose === p ? 'var(--pink)' : 'var(--bg-2)',
                color: form.purpose === p ? 'white' : 'var(--text-2)',
              }}>{p}</button>
            ))}
          </div>
        </Field>
        <Field label="Vibe">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {vibes.map(v => (
              <button key={v} onClick={() => set('vibe', v)} style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 13, border: 'none',
                background: form.vibe === v ? '#EEEDFE' : 'var(--bg-2)',
                color: form.vibe === v ? '#3C3489' : 'var(--text-2)',
              }}>{v}</button>
            ))}
          </div>
        </Field>
        <Field label="Co-travelers (comma separated)">
          <input className="input" placeholder="e.g. Sarah, Mom, Jake" value={travelers} onChange={e => setTravelers(e.target.value)} />
        </Field>

        {/* Occasions */}
        <Field label="Special occasions">
          {form.occasions.map((o, i) => (
            <div key={i} style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div>
                {o.dress_code && <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{o.dress_code}</div>}
              </div>
              <button onClick={() => set('occasions', form.occasions.filter((_,j)=>j!==i))} style={{ color: 'var(--text-3)', fontSize: 18 }}>×</button>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input className="input" placeholder="Occasion (e.g. Gala dinner)" value={newOccasion.name} onChange={e => setNewOccasion(o => ({...o, name: e.target.value}))} />
            <input className="input" placeholder="Dress code" value={newOccasion.dress_code} onChange={e => setNewOccasion(o => ({...o, dress_code: e.target.value}))} />
          </div>
          <button className="btn btn-sm" onClick={addOccasion}>+ Add occasion</button>
        </Field>

        <Field label="Notes">
          <textarea className="input" rows={3} placeholder="Anything else? Weather expectations, specific needs…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </Field>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16, marginBottom: 8 }}>
          {saving ? 'Saving…' : 'Save Trip'}
        </button>
        <button className="btn" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Cancel</button>
      </div>
    </div>
  )
}

function TripDetail({ trip, onClose }) {
  const { wardrobe, colorProfile, moodboards, refresh } = useAppState()
  const [packing, setPacking] = useState(false)
  const [packResult, setPackResult] = useState(tryParse(trip.ai_packing_notes))
  const [deleting, setDeleting] = useState(false)

  const days = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000*60*60*24))
  const occasions = tryParse(trip.occasions, [])
  const coTravelers = tryParse(trip.co_travelers, [])
  const packedIds = tryParse(trip.packed_item_ids, [])
  const packedItems = wardrobe.filter(i => packedIds.includes(i.id))

  const generatePacking = async () => {
    setPacking(true)
    try {
      const result = await api.aiPack(trip, wardrobe, colorProfile, moodboards)
      setPackResult(result)
      await api.updateTrip(trip.id, {
        packed_item_ids: JSON.stringify(result.item_ids || []),
        ai_packing_notes: JSON.stringify(result),
        status: 'planning',
      })
      await refresh()
    } catch(e) { alert('Failed to generate packing list') }
    finally { setPacking(false) }
  }

  const markPacked = async () => {
    await api.updateTrip(trip.id, { status: 'packed' })
    await refresh()
    onClose()
  }

  const deleteTrip = async () => {
    if (!confirm('Delete this trip?')) return
    setDeleting(true)
    await api.deleteTrip(trip.id)
    await refresh()
    onClose()
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onClose} style={{ fontSize: 22, padding: 4 }}>←</button>
        <h1 style={{ flex: 1, fontSize: 18 }}>{trip.name}</h1>
      </div>

      {/* Trip info */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 20, marginBottom: 10 }}>✈️ {trip.destination}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Info label="Dates" value={`${trip.start_date} – ${trip.end_date}`} />
          <Info label="Duration" value={`${days} day${days!==1?'s':''}`} />
          {trip.purpose && <Info label="Purpose" value={trip.purpose} />}
          {trip.vibe && <Info label="Vibe" value={trip.vibe} />}
          {coTravelers.length > 0 && <Info label="With" value={coTravelers.join(', ')} />}
        </div>
        {occasions.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Special occasions</div>
            {occasions.map((o, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>
                🎉 <strong>{o.name}</strong>{o.dress_code ? ` · ${o.dress_code}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Packing */}
      <div style={{ background: 'var(--pink-light)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>✦ AI Packing List</div>
        {packResult ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 10, lineHeight: 1.6 }}>{packResult.packing_strategy}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="badge badge-keep">{packResult.item_ids?.length || 0} items</span>
              {packResult.carry_on_only && <span className="badge badge-staple">Carry-on only ✓</span>}
              {packResult.total_outfits_possible && <span className="badge" style={{ background: '#EEEDFE', color: '#3C3489' }}>{packResult.total_outfits_possible} outfits</span>}
            </div>
            {packResult.gaps?.length > 0 && (
              <div style={{ background: '#FAECE7', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#993C1D', marginBottom: 6 }}>⚠ Gaps in your wardrobe for this trip</div>
                {packResult.gaps.map((g, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#993C1D' }}>• {g}</div>
                ))}
              </div>
            )}
            {packResult.suggested_outfits?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Day-by-day looks</div>
                {packResult.suggested_outfits.slice(0,5).map((o, i) => {
                  const outfitItems = wardrobe.filter(item => o.item_ids?.includes(item.id))
                  return (
                    <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{o.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{outfitItems.map(i=>i.name).join(' · ')}</div>
                    </div>
                  )
                })}
              </>
            )}
            <button className="btn btn-sm" onClick={generatePacking} style={{ marginTop: 6 }}>↺ Regenerate</button>
          </>
        ) : (
          <button className="btn" onClick={generatePacking} disabled={packing}
            style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--pink)', background: 'transparent' }}>
            {packing ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Building your packing list…</> : '✨ Generate packing list'}
          </button>
        )}
      </div>

      {/* Packed items */}
      {packedItems.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Packing ({packedItems.length} items)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {packedItems.map(item => (
              <span key={item.id} style={{ fontSize: 12, background: 'var(--bg-2)', padding: '4px 10px', borderRadius: 20 }}>{item.name}</span>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={markPacked} style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
        ✓ Mark as packed
      </button>
      <button className="btn btn-sm btn-danger" onClick={deleteTrip} disabled={deleting} style={{ width: '100%', justifyContent: 'center' }}>
        {deleting ? 'Deleting…' : 'Delete trip'}
      </button>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

function tryParse(val, fallback = null) {
  try { return val ? JSON.parse(val) : fallback } catch { return fallback }
}

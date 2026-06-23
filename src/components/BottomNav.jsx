import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', emoji: '👗', label: 'Closet' },
  { to: '/outfits', emoji: '✨', label: 'Outfits' },
  { to: '/stylist', emoji: '💬', label: 'Stylist' },
  { to: '/trips', emoji: '✈️', label: 'Trips' },
  { to: '/more', emoji: '⋯', label: 'More' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(var(--nav-height) + var(--safe-bottom))',
      paddingBottom: 'var(--safe-bottom)',
      background: 'var(--white)',
      borderTop: '1px solid var(--cream-mid)',
      display: 'flex', alignItems: 'stretch', zIndex: 100,
    }}>
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} end={t.to==='/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
          textDecoration: 'none',
          color: isActive ? 'var(--copper)' : 'var(--ink-3)',
          fontSize: 10, fontWeight: isActive ? 600 : 400,
          letterSpacing: '0.3px', paddingTop: 4,
          transition: 'color 0.15s',
          borderTop: isActive ? '2px solid var(--copper)' : '2px solid transparent',
        })}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.emoji}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '👗', label: 'Closet' },
  { to: '/outfits', icon: '✨', label: 'Outfits' },
  { to: '/stylist', icon: '💬', label: 'Stylist' },
  { to: '/trips', icon: '✈️', label: 'Trips' },
  { to: '/more', icon: '⋯', label: 'More' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(var(--nav-height) + var(--safe-bottom))',
      paddingBottom: 'var(--safe-bottom)',
      background: 'var(--bg)', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'stretch', zIndex: 100,
    }}>
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} end={t.to==='/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, textDecoration: 'none',
          color: isActive ? 'var(--pink)' : 'var(--text-3)',
          fontSize: 10, fontWeight: 500, paddingTop: 4,
          transition: 'color 0.15s',
        })}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

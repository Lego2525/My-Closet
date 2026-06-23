import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Closet' },
  { to: '/outfits', label: 'Outfits' },
  { to: '/stylist', label: 'Stylist' },
  { to: '/trips', label: 'Trips' },
  { to: '/more', label: 'More' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'var(--white)',
      borderTop: '1px solid var(--cream-mid)',
      display: 'flex', alignItems: 'stretch', zIndex: 100,
    }}>
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} end={t.to==='/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          color: isActive ? 'var(--copper)' : 'var(--ink-3)',
          fontSize: 11, fontWeight: isActive ? 600 : 400,
          letterSpacing: '0.5px', textTransform: 'uppercase',
          transition: 'color 0.15s',
          borderTop: isActive ? '1.5px solid var(--copper)' : '1.5px solid transparent',
        })}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

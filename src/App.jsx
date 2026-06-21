// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './hooks/useAppState.jsx'
import BottomNav from './components/BottomNav.jsx'
import Closet from './pages/Closet.jsx'
import Outfits from './pages/Outfits.jsx'
import Stylist from './pages/Stylist.jsx'
import Trips from './pages/Trips.jsx'
import More from './pages/More.jsx'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Routes>
              <Route path="/" element={<Closet />} />
              <Route path="/outfits" element={<Outfits />} />
              <Route path="/stylist" element={<Stylist />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/more" element={<More />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}

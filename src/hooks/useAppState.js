// src/hooks/useAppState.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../lib/api.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [wardrobe, setWardrobe] = useState([])
  const [outfits, setOutfits] = useState([])
  const [moodboards, setMoodboards] = useState([])
  const [colorProfile, setColorProfile] = useState(null)
  const [trips, setTrips] = useState([])
  const [shoppingHistory, setShoppingHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [w, o, m, cp, t, sh] = await Promise.all([
        api.getItems(),
        api.getOutfits(),
        api.getMoodboards(),
        api.getColorProfile(),
        api.getTrips(),
        api.getShoppingHistory(),
      ])
      setWardrobe(w)
      setOutfits(o)
      setMoodboards(m)
      setColorProfile(cp)
      setTrips(t)
      setShoppingHistory(sh)
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    // Get weather for San Diego by default
    api.getWeather(32.72, -117.15).then(setWeather).catch(()=>{})
  }, [refresh])

  const aiContext = {
    wardrobe,
    colorProfile,
    moodboards,
    trips,
  }

  return (
    <AppContext.Provider value={{
      wardrobe, outfits, moodboards, colorProfile, trips, shoppingHistory, weather,
      loading, refresh, aiContext,
      setWardrobe, setOutfits, setMoodboards, setColorProfile, setTrips,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppState = () => useContext(AppContext)

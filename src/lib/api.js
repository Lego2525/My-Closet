// src/lib/api.js
const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// Items
export const getItems = () => req('/items')
export const addItem = (item) => req('/items', { method: 'POST', body: JSON.stringify(item) })
export const updateItem = (id, data) => req(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteItem = (id) => req(`/items/${id}`, { method: 'DELETE' })

// Photos
export const uploadPhoto = async (file) => {
  const fd = new FormData()
  fd.append('photo', file)
  const res = await fetch(BASE + '/photos/upload', { method: 'POST', body: fd })
  return res.json()
}

// Outfits
export const getOutfits = () => req('/outfits')
export const saveOutfit = (outfit) => req('/outfits', { method: 'POST', body: JSON.stringify(outfit) })
export const deleteOutfit = (id) => req(`/outfits/${id}`, { method: 'DELETE' })

// Moodboards
export const getMoodboards = () => req('/moodboards')
export const toggleMoodboard = (id, is_active) => req(`/moodboards/${id}`, { method: 'PUT', body: JSON.stringify({ is_active }) })

// Color profile
export const getColorProfile = () => req('/color-profile')
export const saveColorProfile = (profile) => req('/color-profile', { method: 'PUT', body: JSON.stringify(profile) })

// Trips
export const getTrips = () => req('/trips')
export const addTrip = (trip) => req('/trips', { method: 'POST', body: JSON.stringify(trip) })
export const updateTrip = (id, data) => req(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteTrip = (id) => req(`/trips/${id}`, { method: 'DELETE' })

// Shopping
export const getShoppingHistory = () => req('/shopping')
export const saveShoppingAnalysis = (data) => req('/shopping', { method: 'POST', body: JSON.stringify(data) })

// Weather
export const getWeather = (lat, lon) => req(`/weather?lat=${lat}&lon=${lon}`)

// URL Import
export const importFromUrl = (url) =>
  req('/ai/import-url', { method: 'POST', body: JSON.stringify({ url }) })

// AI
export const aiChat = (messages, context) =>
  req('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, context }) })

export const aiAnalyzeItem = (item, wardrobe, colorProfile, moodboards) =>
  req('/ai/analyze-item', { method: 'POST', body: JSON.stringify({ item, wardrobe, colorProfile, moodboards }) })

export const aiOutfit = (params) =>
  req('/ai/outfit', { method: 'POST', body: JSON.stringify(params) })

export const aiShop = (url, wardrobe, colorProfile, moodboards) =>
  req('/ai/shop', { method: 'POST', body: JSON.stringify({ url, wardrobe, colorProfile, moodboards }) })

export const aiPack = (trip, wardrobe, colorProfile, moodboards) =>
  req('/ai/pack', { method: 'POST', body: JSON.stringify({ trip, wardrobe, colorProfile, moodboards }) })

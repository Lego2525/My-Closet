// functions/api/[[route]].js
// Cloudflare Pages Function — handles all /api/* routes

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')
  const method = request.method

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    // ── ITEMS ──────────────────────────────────────────────
    if (path === '/items' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM items ORDER BY date_added DESC').all()
      return json(results)
    }

    if (path === '/items' && method === 'POST') {
      const body = await request.json()
      const id = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO items (id,name,category,subcategory,colors,vibes,occasions,seasons,brand,size,photo_url,purchase_url,purchase_price,status,ai_notes,tags)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        id, body.name, body.category, body.subcategory||null,
        JSON.stringify(body.colors||[]), JSON.stringify(body.vibes||[]),
        JSON.stringify(body.occasions||[]), JSON.stringify(body.seasons||[]),
        body.brand||null, body.size||null, body.photo_url||null,
        body.purchase_url||null, body.purchase_price||null,
        body.status||'keep', body.ai_notes||null, JSON.stringify(body.tags||[])
      ).run()
      return json({ id, ...body })
    }

    if (path.match(/^\/items\/[\w-]+$/) && method === 'PUT') {
      const id = path.split('/')[2]
      const body = await request.json()
      const fields = Object.keys(body).map(k => `${k}=?`).join(',')
      const values = Object.values(body).map(v => typeof v === 'object' ? JSON.stringify(v) : v)
      await env.DB.prepare(`UPDATE items SET ${fields} WHERE id=?`).bind(...values, id).run()
      return json({ success: true })
    }

    if (path.match(/^\/items\/[\w-]+$/) && method === 'DELETE') {
      const id = path.split('/')[2]
      await env.DB.prepare('DELETE FROM items WHERE id=?').bind(id).run()
      return json({ success: true })
    }

    // ── PHOTO UPLOAD ───────────────────────────────────────
    if (path === '/photos/upload' && method === 'POST') {
      const formData = await request.formData()
      const file = formData.get('photo')
      if (!file) return json({ error: 'No file' }, 400)
      const ext = file.name.split('.').pop()
      const key = `photos/${crypto.randomUUID()}.${ext}`
      await env.PHOTOS.put(key, file.stream(), {
        httpMetadata: { contentType: file.type }
      })
      const url = `https://pub-b8df4cd6e8b441a78f24ad120ea8068f.r2.dev/${key}`
      return json({ url, key })
    }

    // ── OUTFITS ────────────────────────────────────────────
    if (path === '/outfits' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM outfits ORDER BY date_created DESC').all()
      return json(results)
    }

    if (path === '/outfits' && method === 'POST') {
      const body = await request.json()
      const id = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO outfits (id,name,item_ids,occasion,vibe,season,weather,notes,source)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).bind(
        id, body.name||null, JSON.stringify(body.item_ids||[]),
        body.occasion||null, body.vibe||null, body.season||null,
        body.weather||null, body.notes||null, body.source||'manual'
      ).run()
      return json({ id, ...body })
    }

    if (path.match(/^\/outfits\/[\w-]+$/) && method === 'DELETE') {
      const id = path.split('/')[2]
      await env.DB.prepare('DELETE FROM outfits WHERE id=?').bind(id).run()
      return json({ success: true })
    }

    // ── MOODBOARDS ─────────────────────────────────────────
    if (path === '/moodboards' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM moodboards ORDER BY sort_order').all()
      return json(results)
    }

    if (path.match(/^\/moodboards\/[\w-]+$/) && method === 'PUT') {
      const id = path.split('/')[2]
      const body = await request.json()
      await env.DB.prepare('UPDATE moodboards SET is_active=? WHERE id=?')
        .bind(body.is_active, id).run()
      return json({ success: true })
    }

    // ── COLOR PROFILE ──────────────────────────────────────
    if (path === '/color-profile' && method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM color_profile WHERE id=1').first()
      return json(result || {})
    }

    if (path === '/color-profile' && method === 'PUT') {
      const body = await request.json()
      await env.DB.prepare(`
        INSERT OR REPLACE INTO color_profile (id,season,tone,priority_colors,avoid_colors,notes,updated_at)
        VALUES (1,?,?,?,?,?,datetime('now'))
      `).bind(
        body.season||null, body.tone||null,
        JSON.stringify(body.priority_colors||[]),
        JSON.stringify(body.avoid_colors||[]),
        body.notes||null
      ).run()
      return json({ success: true })
    }

    // ── TRIPS ──────────────────────────────────────────────
    if (path === '/trips' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM trips ORDER BY start_date ASC').all()
      return json(results)
    }

    if (path === '/trips' && method === 'POST') {
      const body = await request.json()
      const id = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO trips (id,name,destination,start_date,end_date,purpose,vibe,notes,co_travelers,occasions,status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        id, body.name, body.destination, body.start_date, body.end_date,
        body.purpose||null, body.vibe||null, body.notes||null,
        JSON.stringify(body.co_travelers||[]),
        JSON.stringify(body.occasions||[]),
        'planning'
      ).run()
      return json({ id, ...body })
    }

    if (path.match(/^\/trips\/[\w-]+$/) && method === 'PUT') {
      const id = path.split('/')[2]
      const body = await request.json()
      const fields = Object.keys(body).map(k => `${k}=?`).join(',')
      const values = Object.values(body).map(v => typeof v === 'object' ? JSON.stringify(v) : v)
      await env.DB.prepare(`UPDATE trips SET ${fields} WHERE id=?`).bind(...values, id).run()
      return json({ success: true })
    }

    if (path.match(/^\/trips\/[\w-]+$/) && method === 'DELETE') {
      const id = path.split('/')[2]
      await env.DB.prepare('DELETE FROM trips WHERE id=?').bind(id).run()
      return json({ success: true })
    }

    // ── SHOPPING HISTORY ───────────────────────────────────
    if (path === '/shopping' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM shopping_history ORDER BY date_analyzed DESC LIMIT 50').all()
      return json(results)
    }

    if (path === '/shopping' && method === 'POST') {
      const body = await request.json()
      const id = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO shopping_history (id,url,product_name,original_price,best_price,best_price_url,verdict,verdict_reason,wardrobe_match_count)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).bind(
        id, body.url, body.product_name||null, body.original_price||null,
        body.best_price||null, body.best_price_url||null,
        body.verdict||null, body.verdict_reason||null, body.wardrobe_match_count||0
      ).run()
      return json({ id, ...body })
    }

    // ── AI STYLIST ─────────────────────────────────────────
    if (path === '/ai/chat' && method === 'POST') {
      const body = await request.json()
      const { messages, context } = body

      const systemPrompt = buildSystemPrompt(context)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        }),
      })

      const data = await response.json()
      return json({ reply: data.content[0].text })
    }

    if (path === '/ai/analyze-item' && method === 'POST') {
      const body = await request.json()
      const { item, wardrobe, colorProfile, moodboards } = body

      const prompt = `You are a personal stylist analyzing a wardrobe item.

Item: ${JSON.stringify(item)}
Active moodboards: ${moodboards.filter(m=>m.is_active).map(m=>m.name).join(', ')}
Color season: ${colorProfile?.season || 'unknown'}
Priority colors: ${colorProfile?.priority_colors ? JSON.parse(colorProfile.priority_colors).join(', ') : 'none set'}

Analyze this item and respond with JSON only:
{
  "status": "keep" | "donate" | "maybe",
  "reason": "one sentence why",
  "is_staple": true | false,
  "is_unique": true | false,
  "palette_match": true | false,
  "style_match": true | false,
  "styling_tips": ["tip1", "tip2"],
  "pairs_with": ["category or item type it goes well with"]
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      try {
        const parsed = JSON.parse(data.content[0].text)
        return json(parsed)
      } catch {
        return json({ status: 'keep', reason: data.content[0].text })
      }
    }

    if (path === '/ai/outfit' && method === 'POST') {
      const body = await request.json()
      const { occasion, vibe, weather, wardrobe, colorProfile, moodboards } = body

      const availableItems = wardrobe.filter(i => !i.in_laundry && i.status !== 'donate')

      const prompt = `You are a personal stylist building an outfit from someone's actual wardrobe.

Available items: ${JSON.stringify(availableItems.map(i => ({ id: i.id, name: i.name, category: i.category, colors: i.colors })))}
Occasion: ${occasion || 'casual'}
Vibe: ${vibe || 'everyday'}
Weather: ${weather || 'mild'}
Active style boards: ${moodboards?.filter(m=>m.is_active).map(m=>m.name).join(', ') || 'none'}
Color season: ${colorProfile?.season || 'unknown'}

Build ONE complete outfit. Respond with JSON only:
{
  "item_ids": ["id1", "id2", "id3"],
  "name": "outfit name",
  "reasoning": "why this works",
  "occasion_fit": "how it suits the occasion",
  "styling_note": "one key styling tip"
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      try {
        return json(JSON.parse(data.content[0].text))
      } catch {
        return json({ error: 'Could not parse outfit' }, 500)
      }
    }

    if (path === '/ai/shop' && method === 'POST') {
      const body = await request.json()
      const { url, wardrobe, colorProfile, moodboards } = body

      const prompt = `You are a personal stylist giving shopping advice.

Product URL: ${url}
Wardrobe has ${wardrobe.length} items.
Categories: ${[...new Set(wardrobe.map(i=>i.category))].join(', ')}
Color season: ${colorProfile?.season || 'unknown'}
Priority colors: ${colorProfile?.priority_colors ? JSON.parse(colorProfile.priority_colors).join(', ') : 'none set'}
Avoid colors: ${colorProfile?.avoid_colors ? JSON.parse(colorProfile.avoid_colors).join(', ') : 'none'}
Active style: ${moodboards?.filter(m=>m.is_active).map(m=>m.name).join(', ') || 'none set'}

Based on this context, give shopping advice. You can't actually see the URL so ask the user to describe the item, or give general advice about what to look for. Respond with JSON:
{
  "verdict": "buy" | "pass" | "wait",
  "reason": "2-3 sentence explanation",
  "questions": ["question to ask user about the item if needed"],
  "what_to_look_for": "advice on what would work for their palette/style"
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      try {
        return json(JSON.parse(data.content[0].text))
      } catch {
        return json({ verdict: 'wait', reason: data.content[0].text })
      }
    }

    if (path === '/ai/pack' && method === 'POST') {
      const body = await request.json()
      const { trip, wardrobe, colorProfile, moodboards } = body

      const availableItems = wardrobe.filter(i => !i.in_laundry && i.status !== 'donate')
      const days = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000*60*60*24))

      const prompt = `You are a personal stylist helping pack for a trip using someone's actual wardrobe.

TRIP DETAILS:
- Destination: ${trip.destination}
- Dates: ${trip.start_date} to ${trip.end_date} (${days} days)
- Purpose: ${trip.purpose || 'mixed'}
- Vibe: ${trip.vibe || 'casual'}
- Co-travelers: ${trip.co_travelers ? JSON.parse(trip.co_travelers).join(', ') : 'solo'}
- Occasions: ${trip.occasions ? JSON.parse(trip.occasions).map(o=>o.name+': '+o.dress_code).join('; ') : 'general'}
- Notes: ${trip.notes || 'none'}

THEIR WARDROBE (${availableItems.length} available items):
${JSON.stringify(availableItems.map(i => ({ id: i.id, name: i.name, category: i.category, colors: JSON.parse(i.colors||'[]'), seasons: JSON.parse(i.seasons||'[]'), occasions: JSON.parse(i.occasions||'[]') })))}

Color season: ${colorProfile?.season || 'unknown'}
Active style: ${moodboards?.filter(m=>m.is_active).map(m=>m.name).join(', ') || 'none'}

Build a capsule packing list from their actual wardrobe. Maximize outfit re-use. Respond with JSON only:
{
  "item_ids": ["id1", "id2"],
  "suggested_outfits": [
    { "name": "Day 1 — travel day", "item_ids": ["id1","id2"], "occasion": "travel" }
  ],
  "packing_strategy": "2-3 sentence strategy note",
  "gaps": ["item type they're missing for this trip"],
  "carry_on_only": true | false,
  "total_outfits_possible": 8
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      try {
        return json(JSON.parse(data.content[0].text))
      } catch {
        return json({ error: 'Could not generate packing list' }, 500)
      }
    }

    // ── URL IMPORT ─────────────────────────────────────────
    if (path === '/ai/import-url' && method === 'POST') {
      const body = await request.json()
      const { url: productUrl } = body

      // Fetch the page HTML
      let pageText = ''
      try {
        const pageRes = await fetch(productUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' }
        })
        const html = await pageRes.text()
        // Extract readable text — strip tags, limit length
        pageText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 6000)
      } catch(e) {
        pageText = `URL: ${productUrl}`
      }

      const prompt = `You are helping import a clothing item from a product webpage into a wardrobe app.

PAGE CONTENT:
${pageText}

Extract the product details and respond with JSON only — no other text:
{
  "name": "product name (short, descriptive)",
  "brand": "brand name or null",
  "category": "one of: tops, bottoms, dresses, outerwear, shoes, accessories, bags",
  "colors": ["color1", "color2"],
  "price": 99.99 or null,
  "description": "one short phrase describing the style/cut e.g. oversized blazer, slip dress",
  "image_url": "best product image URL from the page or null"
}

For image_url, look for og:image meta tag content or the main product image src. Must be a full URL starting with https://`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      try {
        const text = data.content[0].text.replace(/```json|```/g, '').trim()
        return json(JSON.parse(text))
      } catch {
        return json({ name: '', brand: null, category: null, colors: [], price: null, image_url: null })
      }
    }

    // ── WEATHER ────────────────────────────────────────────
    if (path === '/weather' && method === 'GET') {
      const lat = url.searchParams.get('lat') || '32.72'
      const lon = url.searchParams.get('lon') || '-117.15'
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`
      )
      const weatherData = await weatherRes.json()
      return json(weatherData)
    }

    return json({ error: 'Not found' }, 404)

  } catch (err) {
    console.error(err)
    return json({ error: err.message }, 500)
  }
}

function buildSystemPrompt(context) {
  const { wardrobe, colorProfile, moodboards, trips } = context || {}
  return `You are a personal AI stylist with deep knowledge of this person's wardrobe.

WARDROBE SUMMARY:
${wardrobe ? `${wardrobe.length} items across categories: ${[...new Set(wardrobe.map(i=>i.category))].join(', ')}` : 'No wardrobe data yet.'}

COLOR PROFILE:
Season: ${colorProfile?.season || 'not set'}
Priority colors: ${colorProfile?.priority_colors ? JSON.parse(colorProfile.priority_colors).join(', ') : 'not set'}
Avoid: ${colorProfile?.avoid_colors ? JSON.parse(colorProfile.avoid_colors).join(', ') : 'none'}

ACTIVE STYLE BOARDS:
${moodboards?.filter(m=>m.is_active).map(m=>`• ${m.name}: ${m.description}`).join('\n') || 'None active'}

UPCOMING TRIPS:
${trips?.filter(t=>t.status!=='completed').map(t=>`• ${t.name} → ${t.destination} (${t.start_date})`).join('\n') || 'None planned'}

You give direct, specific, personalized advice. You reference actual items in their wardrobe when possible. You balance keeping staples and unique/interesting pieces while gently flagging things that don't serve them. You factor in their color season and active moodboards in every recommendation. Be warm, direct, and a little fun — like a friend who happens to be a great stylist.`
}

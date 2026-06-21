-- Run this in your Cloudflare D1 dashboard or via wrangler
-- wrangler d1 execute closet-db --file=schema.sql

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,       -- tops, bottoms, dresses, outerwear, shoes, accessories, bags
  subcategory TEXT,             -- blazer, tee, jeans, etc.
  colors TEXT NOT NULL,         -- JSON array of color names
  vibes TEXT,                   -- JSON array: casual, work, evening, weekend, etc.
  occasions TEXT,               -- JSON array: dinner, beach, office, etc.
  seasons TEXT,                 -- JSON array: spring, summer, fall, winter
  brand TEXT,
  size TEXT,
  photo_url TEXT,
  purchase_url TEXT,
  purchase_price REAL,
  date_added TEXT DEFAULT (datetime('now')),
  last_worn TEXT,
  wear_count INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  in_laundry INTEGER DEFAULT 0,
  status TEXT DEFAULT 'keep',   -- keep, donate, sell, maybe
  ai_notes TEXT,                -- AI stylist observations
  tags TEXT                     -- JSON array of freeform tags
);

CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY,
  name TEXT,
  item_ids TEXT NOT NULL,       -- JSON array of item IDs
  occasion TEXT,
  vibe TEXT,
  season TEXT,
  weather TEXT,
  notes TEXT,
  photo_url TEXT,               -- mirror selfie
  date_created TEXT DEFAULT (datetime('now')),
  date_worn TEXT,
  worn_count INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual'  -- manual, ai, chaos, trip
);

CREATE TABLE IF NOT EXISTS moodboards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  colors TEXT,                  -- JSON array of hex colors
  keywords TEXT,                -- JSON array of style words
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS color_profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  season TEXT,                  -- spring, summer, autumn, winter
  tone TEXT,                    -- warm, cool, neutral
  priority_colors TEXT,         -- JSON array of color names
  avoid_colors TEXT,            -- JSON array of color names
  notes TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  purpose TEXT,                 -- vacation, work, wedding, etc.
  vibe TEXT,
  notes TEXT,
  co_travelers TEXT,            -- JSON array of names
  occasions TEXT,               -- JSON array: {name, date, dress_code, notes}
  packed_item_ids TEXT,         -- JSON array of item IDs
  packed_outfit_ids TEXT,       -- JSON array of outfit IDs
  ai_packing_notes TEXT,
  status TEXT DEFAULT 'planning', -- planning, packed, completed
  date_created TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shopping_history (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  product_name TEXT,
  product_image_url TEXT,
  original_price REAL,
  best_price REAL,
  best_price_url TEXT,
  verdict TEXT,                 -- buy, pass, wait
  verdict_reason TEXT,
  wardrobe_match_count INTEGER,
  date_analyzed TEXT DEFAULT (datetime('now'))
);

-- Seed default moodboards
INSERT OR IGNORE INTO moodboards (id, name, description, colors, keywords, sort_order) VALUES
  ('quiet-luxury', 'Quiet Luxury', 'Neutral, understated, expensive-feeling', '["#2C2C2A","#B4B2A9","#FAE8D4"]', '["minimal","tailored","neutral","timeless","quality"]', 1),
  ('dark-feminine', 'Dark Feminine', 'Moody, elegant, romantic edge', '["#2C1420","#D4537E","#FBEAF0"]', '["romantic","moody","silk","lace","dramatic"]', 2),
  ('earthy-editorial', 'Earthy Editorial', 'Textured, organic, unexpected', '["#3B6D11","#BA7517","#F4EFE6"]', '["earthy","textured","organic","unexpected","artsy"]', 3),
  ('clean-minimalism', 'Clean Minimalism', 'White, crisp, architectural', '["#FFFFFF","#E8E8E8","#1A1A1A"]', '["clean","crisp","architectural","structured","white"]', 4),
  ('vintage-eclectic', 'Vintage Eclectic', 'Retro silhouettes, mixed prints', '["#993C1D","#FAC775","#04342C"]', '["vintage","retro","pattern","mixed","bold"]', 5),
  ('soft-drama', 'Soft Drama', 'Dreamy pastels, bold silhouettes', '["#ED93B1","#7F77DD","#FBEAF0"]', '["dreamy","pastel","romantic","flowy","ethereal"]', 6);

import crypto from 'crypto'

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '515336'
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'KZgmteUFRQXrhcRXwdEqcIwGLDfkSoT3'
const TRACKING_ID = 'default'
const API_URL = 'https://api-sg.aliexpress.com/sync'

function getTimestamp() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const sh = new Date(utc + 8 * 3600000)
  const p = n => String(n).padStart(2,'0')
  return `${sh.getFullYear()}-${p(sh.getMonth()+1)}-${p(sh.getDate())} ${p(sh.getHours())}:${p(sh.getMinutes())}:${p(sh.getSeconds())}`
}

function sign(params) {
  const s = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()
}

// 20 categories, 3 keywords each - grouped into 5 visual groups for neon accent colors
export const CATEGORIES = {
  'neon-glow':       ['LED neon party sign','glow stick party pack','LED light up necklace'],
  'atmosphere-fx':   ['fog machine party','bubble machine party','laser light party projector'],
  'smart-lighting':  ['smart party light bluetooth','LED disco ball light','sound activated party light'],
  'theme-decor':     ['party backdrop banner','themed party balloon set','party hanging decoration'],
  'drinking-games':  ['beer pong set party','drinking game cards adult','party dice game set'],
  'bar-gadgets':     ['cocktail shaker set bar','bottle opener gadget bar','bar tool kit creative'],
  'ice-chill':       ['ice mold party shapes','whiskey stone gift set','beverage cooler party'],
  'drinkware':       ['novelty shot glass set','funny cocktail glass','party cup reusable'],
  'photo-booth':     ['photo booth props party','selfie ring light party','instant camera party'],
  'interactive-games':['party game adults group','giant inflatable game','party board game fun'],
  'audio-karaoke':   ['karaoke microphone bluetooth','portable party speaker','karaoke machine party'],
  'gag-prank':       ['party gag gift adult','prank toy party favor','funny party joke gift'],
  'party-wearables': ['light up party glasses','party costume accessory','LED party hat'],
  'festival-gear':   ['festival fanny pack','rave accessory glow','festival sunglasses led'],
  'costume-accents': ['costume wig party','face paint party kit','costume accessory set'],
  'tableware':       ['party tableware set disposable','themed paper plate set','party napkin set'],
  'serving-gadgets': ['party serving tray creative','chip dip platter party','drink dispenser party'],
  'cleanup-prep':    ['party cleanup kit','table cover party','party prep tool'],
  'party-favors':    ['party favor bag set','goodie bag party kids','party gift bag set'],
  'outdoor-party':   ['outdoor party string light','backyard party game','outdoor party cooler'],
}

export const CAT_GROUPS = {
  lighting: ['neon-glow','atmosphere-fx','smart-lighting'],
  decor: ['theme-decor','tableware','serving-gadgets','cleanup-prep'],
  games: ['drinking-games','interactive-games','gag-prank'],
  bar: ['bar-gadgets','ice-chill','drinkware'],
  experience: ['photo-booth','audio-karaoke','party-wearables','festival-gear','costume-accents','party-favors','outdoor-party'],
}

export const GROUP_COLORS = {
  lighting: '#00f0ff',
  decor: '#ff00e5',
  games: '#ffe600',
  bar: '#00ff88',
  experience: '#ff6b00',
}

export const CAT_LABELS = {
  'neon-glow':'Neon & Glow','atmosphere-fx':'Atmosphere FX','smart-lighting':'Smart Lighting',
  'theme-decor':'Theme Decor','drinking-games':'Drinking Games','bar-gadgets':'Bar Gadgets',
  'ice-chill':'Ice & Chill','drinkware':'Drinkware','photo-booth':'Photo Booth Props',
  'interactive-games':'Interactive Games','audio-karaoke':'Audio & Karaoke','gag-prank':'Gag & Prank',
  'party-wearables':'Party Wearables','festival-gear':'Festival Gear','costume-accents':'Costume Accents',
  'tableware':'Tableware','serving-gadgets':'Serving Gadgets','cleanup-prep':'Cleanup & Prep',
  'party-favors':'Party Favors','outdoor-party':'Outdoor Party',
}

function groupOf(cat) {
  for (const [g, cats] of Object.entries(CAT_GROUPS)) if (cats.includes(cat)) return g
  return 'experience'
}
export function colorForCategory(cat) { return GROUP_COLORS[groupOf(cat)] }

// Blacklist - block "simple disposable" per Kostya spec
const BLACKLIST_WORDS = [
  'office','stationary','stationery','tool','replacement','parts','furniture',
  'storage','single plain','plain balloon','plain napkin','wholesale',
  'anime wig','cosplay wig','for kids','boys costume','girls costume',
  'kitchen sealing','wine sealing','vacuum sealer',
]
function hasBlacklistedWord(title) {
  const lower = title.toLowerCase()
  return BLACKLIST_WORDS.some(w => lower.includes(w))
}
function isBulkListing(title) {
  const lower = title.toLowerCase()
  if (/\d+\s*(pcs|pzs|units|pieces?)\s*(?!\$|usd)/i.test(lower) && /\d{2,}\s*pcs/.test(lower)) return true
  if (/\bwholesale\b/.test(lower)) return true
  if (/(\d)\1{4,}/.test(title)) return true
  return false
}

function titleSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const w of setA) if (setB.has(w)) intersection++
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}
function isDuplicate(title, existingTitles, threshold = 0.78) {
  for (const existing of existingTitles) if (titleSimilarity(title, existing) >= threshold) return true
  return false
}

function cleanTitle(title) {
  return title
    .replace(/\*\*/g, '')
    .replace(/\(\d+\s*characters?\)/gi, '')
    .replace(/\$/g, '')
    .replace(/^\d+\s*(pcs?|pieces?)\s*\/?\s*/i, '') // strip leading "1PC " / "2Pcs/" etc
    .trim()
}

// Viral Title Generator - Hook + Party Vibe templates per category group
const HOOKS = {
  lighting: ['Light up the night:', 'Turn your party into a rave:', 'Instant dance-floor energy:'],
  decor: ['Transform any room into a party zone:', 'The decor that gets all the likes:', 'Set the scene:'],
  games: ['The game that never gets old:', 'Warning - this gets competitive:', 'Party starter, guaranteed:'],
  bar: ['Bartender mode: activated.', 'Level up your home bar:', 'Mix it like a pro:'],
  experience: ['The thing everyone will ask about:', 'Instant main character energy:', 'Photos? Guaranteed.'],
}

function viralTitle(rawTitle, cat) {
  const g = groupOf(cat)
  const hooks = HOOKS[g] || HOOKS.experience
  const hook = hooks[Math.floor(Math.random() * hooks.length)]
  // Extract a short, clean core noun-phrase from the raw title (first 6-8 meaningful words)
  const words = cleanTitle(rawTitle).split(/\s+/).filter(w => w.length > 1).slice(0, 7)
  const core = words.join(' ')
  return `${hook} ${core}`
}

export function filterProducts(rawProducts, existingTitles = []) {
  const seenInBatch = []
  const clean = []
  let acceptedCount = 0
  const MAX_PER_QUERY = 6

  for (const p of rawProducts) {
    const title = cleanTitle(p.product_title || '')
    if (!title) continue
    const rate = parseFloat(p.evaluate_rate) || 0
    const vol = parseInt(p.lastest_volume) || 0

    if (vol <= 0) continue
    if (rate > 0 && rate < 90) continue // 4.5+ rating requirement (evaluate_rate is 0-100 scale)
    if (title.length < 15 || title.length > 150) continue
    if (hasBlacklistedWord(title)) continue
    if (isBulkListing(title)) continue
    if (isDuplicate(title, existingTitles)) continue
    if (isDuplicate(title, seenInBatch)) continue
    if (acceptedCount >= MAX_PER_QUERY) continue

    seenInBatch.push(title)
    clean.push(p)
    acceptedCount++
  }
  return clean
}

async function rawQuery(keywords, page) {
  const params = {
    app_key: APP_KEY, method: 'aliexpress.affiliate.product.query', sign_method: 'md5',
    timestamp: getTimestamp(), v: '2.0', keywords, page_no: String(page), page_size: '20',
    sort: 'LAST_VOLUME_DESC', tracking_id: TRACKING_ID, target_currency: 'USD', target_language: 'EN',
  }
  params.sign = sign(params)
  const r = await fetch(API_URL, {
    method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'},
    body: new URLSearchParams(params).toString(),
  })
  const data = JSON.parse(await r.text())
  const resp = data?.aliexpress_affiliate_product_query_response?.resp_result
  if (!resp || resp.resp_code !== 200) return []
  return resp?.result?.products?.product || []
}

export async function queryAPI(keywords, cat, page=1, existingTitles=[]) {
  let rawProducts = await rawQuery(keywords, page)
  let clean = filterProducts(rawProducts, existingTitles)

  if (clean.length === 0 && rawProducts.length > 0) {
    const broadKw = keywords.split(' ').slice(0,2).join(' ')
    if (broadKw !== keywords) {
      const fallbackRaw = await rawQuery(broadKw, page)
      clean = filterProducts(fallbackRaw, existingTitles)
    }
  }

  return clean.map(p => ({
    id: String(p.product_id),
    title: viralTitle(p.product_title, cat),
    title_en: cleanTitle(p.product_title),
    rating: Math.round((parseFloat(p.evaluate_rate)||0)/20*10)/10,
    orders: parseInt(p.lastest_volume)||0,
    image: p.product_main_image_url,
    video_url: p.product_video_url || null,
    affiliate_url: p.promotion_link || p.product_detail_url,
    category: p.second_level_category_name || '',
  }))
}

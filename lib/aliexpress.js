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
  'neon-signs':        ['custom wall neon art'],
  'disco-balls':       ['mirrored disco party ball'],
  'led-strips':        ['music sync rgb strip light'],
  'laser-projectors':  ['dj stage laser projector'],
  'fog-machines':      ['portable party fog machine'],
  'bubble-machines':   ['automatic bubble blower machine'],
  'starry-projectors': ['galaxy night light projector'],
  'glow-decor':        ['neon fluorescent party paint'],
  'sensory-lighting':  ['sound reactive ambient light'],
  'smoke-fluids':      ['fog machine special effect liquid'],

  'beer-pong':         ['inflatable beer pong set','beer pong table set'],
  'shot-roulette':     ['drinking game roulette wheel'],
  'electric-openers':  ['automatic rechargeable bottle opener'],
  'dispensers':        ['liquor gravity dispenser'],
  'ice-molds':         ['skull ice mold tray'],
  'led-ice':           ['waterproof led ice cube'],
  'custom-straws':     ['reusable party straw kit'],
  'bar-gadgets':       ['professional bar shaker set'],
  'flasks':            ['hidden stainless steel flask'],
  'drink-markers':     ['colorful glass drink marker'],

  'card-games':        ['hilarious party card game'],
  'tabletop-games':    ['board game for adult party'],
  'interactive':       ['group interactive party gadget','party icebreaker gadget'],
  'voice-changers':    ['handheld megaphone voice changer'],
  'karaoke':           ['portable bluetooth karaoke mic'],
  'prank-items':       ['fun harmless prank kit','funny prank toy gift'],
  'riddles':           ['party trivia card game'],
  'arcade':            ['mini tabletop arcade game'],
  'spin-the-wheel':    ['prize spin wheel for events'],
  'challenges':        ['party challenge box'],

  'photo-props':       ['trendy photo booth accessory'],
  'led-costumes':      ['glowing led party mask'],
  'headwear':          ['light up party hat'],
  'festival-fanny':    ['transparent festival waist bag'],
  'confetti':          ['party confetti air launcher'],
  'party-favors':      ['creative small party favor'],
  'tableware':         ['luxury metallic disposable plate','gold rim party plate'],
  'cake-toppers':      ['custom led cake topper','birthday cake topper decoration'],
  'outdoor-lights':    ['waterproof solar string light'],
  'emergency-kit':     ['party survival quick kit','hangover recovery kit'],
}

// Stable ordered array for index-based batching (CATEGORIES object key order
// isn't guaranteed stable across engines/edits, so this is the source of truth
// for fetchCategoryBatch start/end indices).
export const CATEGORY_ENTRIES = Object.entries(CATEGORIES)

export const CAT_GROUPS = {
  vibe: ['neon-signs','disco-balls','led-strips','laser-projectors','fog-machines','bubble-machines','starry-projectors','glow-decor','sensory-lighting','smoke-fluids'],
  drinks: ['beer-pong','shot-roulette','electric-openers','dispensers','ice-molds','led-ice','custom-straws','bar-gadgets','flasks','drink-markers'],
  games: ['card-games','tabletop-games','interactive','voice-changers','karaoke','prank-items','riddles','arcade','spin-the-wheel','challenges'],
  style: ['photo-props','led-costumes','headwear','festival-fanny','confetti','party-favors','tableware','cake-toppers','outdoor-lights','emergency-kit'],
}

export const GROUP_COLORS = {
  vibe: '#00f0ff',
  drinks: '#00ff88',
  games: '#ffe600',
  style: '#ff6b00',
}

export const EVENTS = ['christmas','halloween','bachelorette','bachelor','nye','birthday','kids','romance','anniversary','surprise']

export const EVENT_LABELS = {
  christmas:'Christmas', halloween:'Halloween', bachelorette:'Bachelorette',
  bachelor:'Bachelor', nye:'New Year\'s Eve', birthday:'Birthday',
  kids:'Kids Party', romance:'Romance', anniversary:'Anniversary', surprise:'Surprise Party',
}

export const CAT_LABELS = {
  'neon-signs':'Neon Signs','disco-balls':'Disco Balls','led-strips':'LED Strips',
  'laser-projectors':'Laser Projectors','fog-machines':'Fog Machines','bubble-machines':'Bubble Machines',
  'starry-projectors':'Starry Projectors','glow-decor':'Glow Decor','sensory-lighting':'Sensory Lighting',
  'smoke-fluids':'Smoke Fluids',
  'beer-pong':'Beer Pong','shot-roulette':'Shot Roulette','electric-openers':'Electric Openers',
  'dispensers':'Dispensers','ice-molds':'Ice Molds','led-ice':'LED Ice','custom-straws':'Custom Straws',
  'bar-gadgets':'Bar Gadgets','flasks':'Flasks','drink-markers':'Drink Markers',
  'card-games':'Card Games','tabletop-games':'Tabletop Games','interactive':'Interactive',
  'voice-changers':'Voice Changers','karaoke':'Karaoke','prank-items':'Prank Items','riddles':'Riddles',
  'arcade':'Arcade','spin-the-wheel':'Spin-the-Wheel','challenges':'Challenges',
  'photo-props':'Photo Props','led-costumes':'LED Costumes','headwear':'Headwear',
  'festival-fanny':'Festival Fanny','confetti':'Confetti','party-favors':'Party Favors',
  'tableware':'Tableware','cake-toppers':'Cake Toppers','outdoor-lights':'Outdoor Lights',
  'emergency-kit':'Emergency Kit',
}

function groupOf(cat) {
  for (const [g, cats] of Object.entries(CAT_GROUPS)) if (cats.includes(cat)) return g
  return 'style'
}
const EVENT_SIGNALS = {
  christmas: ['christmas','xmas','santa','snowman','reindeer'],
  halloween: ['halloween','pumpkin','skeleton','witch','spooky','ghost','zombie'],
  bachelorette: ['bachelorette','bride','hen party','bridal','bride to be','bride tribe'],
  bachelor: ['bachelor party','groom','stag','groomsm'],
  nye: ['new year','nye','countdown','2026','2027'],
  birthday: ['birthday','bday'],
  kids: ['kids','children','child','toddler'],
  romance: ['romantic','romance','valentine','couple','date night','heart shape'],
  anniversary: ['anniversary'],
  surprise: ['surprise'],
}

const CATEGORY_EVENT_FALLBACK = {
  'beer-pong': ['bachelor','bachelorette'],
  'shot-roulette': ['bachelor','bachelorette'],
  'bar-gadgets': ['bachelor','anniversary'],
  'flasks': ['bachelor'],
  'photo-props': ['bachelorette','birthday'],
  'led-costumes': ['bachelorette','nye'],
  'headwear': ['nye','birthday'],
  'festival-fanny': ['bachelorette'],
  'drink-markers': ['anniversary','romance'],
  'led-ice': ['anniversary','romance'],
  'sensory-lighting': ['nye','romance','surprise'],
  'disco-balls': ['nye','surprise'],
  'confetti': ['surprise','birthday','nye'],
  'interactive': ['surprise'],
  'party-favors': ['surprise','birthday'],
  'cake-toppers': ['birthday','anniversary'],
  'ice-molds': ['anniversary'],
  'tableware': ['nye','birthday'],
  'card-games': ['bachelor','bachelorette'],
  'tabletop-games': ['surprise','kids'],
}

function tagEvents(title, cat) {
  const lower = title.toLowerCase()
  const tags = []
  for (const [event, signals] of Object.entries(EVENT_SIGNALS)) {
    if (signals.some(s => lower.includes(s))) tags.push(event)
  }
  if (tags.length === 0 && cat && CATEGORY_EVENT_FALLBACK[cat]) {
    tags.push(...CATEGORY_EVENT_FALLBACK[cat])
  }
  return tags
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
  vibe: ['Light up the night:', 'Turn your party into a rave:', 'Instant dance-floor energy:'],
  drinks: ['Bartender mode activated:', 'Level up your home bar:', 'Mix it like a pro:'],
  games: ['The game that never gets old:', 'Warning, this gets competitive:', 'Party starter, guaranteed:'],
  style: ['The thing everyone will ask about:', 'Instant main character energy:', 'Photos guaranteed:'],
}

function viralTitle(rawTitle, cat) {
  const g = groupOf(cat)
  const hooks = HOOKS[g] || HOOKS.style
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
  const MAX_PER_QUERY = 15

  for (const p of rawProducts) {
    const rawTitle = p.product_title || ''
    if (/\$[a-zA-Z]/.test(rawTitle)) continue // broken AliExpress title (e.g. "$peaker" for "Speaker")
    const title = cleanTitle(rawTitle)
    if (!title) continue
    const rate = parseFloat(p.evaluate_rate) || 0
    const vol = parseInt(p.lastest_volume) || 0

    if (vol <= 0) continue
    if (rate > 0 && rate < 85) continue // 4.5+ rating requirement (evaluate_rate is 0-100 scale)
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
    timestamp: getTimestamp(), v: '2.0', keywords, page_no: String(page), page_size: '50',
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
  const products = resp?.result?.products?.product || []
  // Sort by sales volume descending before filtering - hottest items get first claim
  // on the MAX_PER_QUERY cap, per Kostya's consistency requirement.
  return products.sort((a, b) => (parseInt(b.lastest_volume)||0) - (parseInt(a.lastest_volume)||0))
}

const MIN_RESULTS_PER_QUERY = 10

export async function queryAPI(keywords, cat, page=1, existingTitles=[]) {
  let rawProducts = await rawQuery(keywords, page)
  let clean = filterProducts(rawProducts, existingTitles)

  // If page 1 (50 results) didn't yield enough after filtering, pull page 2
  // before giving up on this keyword - per Kostya's pagination requirement.
  if (clean.length < MIN_RESULTS_PER_QUERY) {
    const page2Raw = await rawQuery(keywords, 2)
    const seenIds = new Set(clean.map(p => String(p.product_id)))
    const page2New = page2Raw.filter(p => !seenIds.has(String(p.product_id)))
    const page2Clean = filterProducts(page2New, [...existingTitles, ...clean.map(p => p.product_title)])
    clean = [...clean, ...page2Clean]
  }

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
    price: parseFloat(p.target_sale_price || p.sale_price || 0) || null,
    image: p.product_main_image_url,
    video_url: p.product_video_url || null,
    affiliate_url: p.promotion_link || p.product_detail_url,
    category: p.second_level_category_name || '',
    event_tags: tagEvents(p.product_title || '', cat),
  }))
}

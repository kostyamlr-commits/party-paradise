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

  'beer-pong':         ['inflatable beer pong set'],
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
  'interactive':       ['group interactive party gadget'],
  'voice-changers':    ['handheld megaphone voice changer'],
  'karaoke':           ['portable bluetooth karaoke mic'],
  'prank-items':       ['fun harmless prank kit'],
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
  'tableware':         ['luxury metallic disposable plate'],
  'cake-toppers':      ['custom led cake topper'],
  'outdoor-lights':    ['waterproof solar string light'],
  'emergency-kit':     ['party survival quick kit'],
}

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
    price: parseFloat(p.target_sale_price || p.sale_price || 0) || null,
    image: p.product_main_image_url,
    video_url: p.product_video_url || null,
    affiliate_url: p.promotion_link || p.product_detail_url,
    category: p.second_level_category_name || '',
    event_tags: tagEvents(p.product_title || '', cat),
  }))
}

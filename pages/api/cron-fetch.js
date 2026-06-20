import { queryAPI, CATEGORY_ENTRIES } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'

// Vercel Cron calls this once a day. With 40 categories x up to 2 pages each,
// a single run risks the serverless timeout, so this processes one batch of
// 10 categories per invocation based on day-of-month, cycling through all 40
// roughly every 4 days. For an immediate full refresh, call fetch-products.js
// directly in 4 manual batches instead.
const BATCH_SIZE = 10

export default async function handler(req, res) {
  const authHeader = req.headers['authorization']
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManualTrigger = req.query.secret === process.env.CRON_SECRET
  if (!isVercelCron && !isManualTrigger) return res.status(401).json({ error: 'Unauthorized' })

  const cycleDay = new Date().getDate() % Math.ceil(CATEGORY_ENTRIES.length / BATCH_SIZE)
  const start = cycleDay * BATCH_SIZE
  const end = start + BATCH_SIZE
  const batch = CATEGORY_ENTRIES.slice(start, end)

  const { data: existing } = await supabase.from('products').select('title_en')
  const existingTitles = (existing || []).map(p => p.title_en)

  const all = []
  const seenIds = new Set()
  const log = {}

  for (const [cat, kws] of batch) {
    log[cat] = []
    for (const kw of kws) {
      try {
        const products = await queryAPI(kw, cat, 1, [...existingTitles, ...all.map(p => p.title_en)])
        let added = 0
        for (const p of products) {
          if (seenIds.has(p.id)) continue
          seenIds.add(p.id)
          all.push({...p, cat_tag: cat, active: true, created_at: new Date().toISOString(), last_checked: new Date().toISOString()})
          added++
        }
        log[cat].push({kw, added})
        await new Promise(r => setTimeout(r, 300))
      } catch(e) { log[cat].push({kw, error: e.message}) }
    }
  }

  if (!all.length) return res.status(200).json({success: false, message: 'No new products found', batchRange: [start, end], log})

  const { error } = await supabase.from('products').upsert(all, {onConflict: 'id'})
  if (error) return res.status(500).json({error: error.message})

  return res.status(200).json({success: true, count: all.length, batchRange: [start, end], log})
}

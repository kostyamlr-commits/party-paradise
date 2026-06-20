import { queryAPI, CATEGORY_LIST } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'

// Accepts ?start=0&end=5 to process only CATEGORY_LIST[start:end].
// Defaults to the full list when no range is given.
// Run in batches of 5 to stay well under serverless timeout, e.g.:
//   /api/fetch-products?secret=...&start=0&end=5
//   /api/fetch-products?secret=...&start=5&end=10
//   ...up to start=35&end=40
export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['authorization']?.replace('Bearer ','')
  if (secret !== (process.env.CRON_SECRET || 'party_secret_2026')) return res.status(401).json({error:'Unauthorized'})

  const start = parseInt(req.query.start) || 0
  const end = req.query.end ? parseInt(req.query.end) : CATEGORY_LIST.length
  const targetCategories = CATEGORY_LIST.slice(start, end)

  const { data: existing } = await supabase.from('products').select('title_en')
  const existingTitles = (existing || []).map(p => p.title_en)

  const all = []
  const seenIds = new Set()
  const log = {}

  for (const { id: cat, keywords: kws } of targetCategories) {
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

  if (!all.length) return res.status(200).json({success: false, message: 'No new products found', range: [start, end], log})

  const { error } = await supabase.from('products').upsert(all, {onConflict: 'id'})
  if (error) return res.status(500).json({error: error.message})

  return res.status(200).json({
    success: true, count: all.length, range: [start, end],
    coveredCategories: targetCategories.map(c => c.id),
    nextBatch: end < CATEGORY_LIST.length ? `?start=${end}&end=${Math.min(end+5, CATEGORY_LIST.length)}` : null,
    log,
  })
}

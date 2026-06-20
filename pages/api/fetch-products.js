import { queryAPI, CATEGORY_ENTRIES } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'

// Batched fetch endpoint: call with ?start=0&end=10, ?start=10&end=20, etc.
// to process the 40 categories in chunks and stay under Vercel's serverless
// function timeout. Defaults to all 40 if no range is given (use with caution
// on Hobby plan - may time out; batching is the recommended path).
export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['authorization']?.replace('Bearer ','')
  if (secret !== (process.env.CRON_SECRET || 'party_secret_2026')) return res.status(401).json({error:'Unauthorized'})

  const start = req.query.start !== undefined ? parseInt(req.query.start) : 0
  const end = req.query.end !== undefined ? parseInt(req.query.end) : CATEGORY_ENTRIES.length
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

  if (!all.length) return res.status(200).json({success: false, message: 'No new products found', range: [start, end], log})

  const { error } = await supabase.from('products').upsert(all, {onConflict: 'id'})
  if (error) return res.status(500).json({error: error.message})

  return res.status(200).json({success: true, count: all.length, range: [start, end], categoriesProcessed: batch.length, log})
}

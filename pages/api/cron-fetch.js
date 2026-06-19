import { queryAPI, CATEGORIES } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'

// Vercel Cron calls this automatically once a day (see vercel.json).
// Vercel signs cron requests with the CRON_SECRET as a Bearer token automatically
// when CRON_SECRET env var is set - https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export default async function handler(req, res) {
  const authHeader = req.headers['authorization']
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManualTrigger = req.query.secret === process.env.CRON_SECRET

  if (!isVercelCron && !isManualTrigger) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: existing } = await supabase.from('products').select('title_en')
  const existingTitles = (existing || []).map(p => p.title_en)

  const all = []
  const seenIds = new Set()
  const log = {}

  for (const [cat, kws] of Object.entries(CATEGORIES)) {
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

  if (!all.length) return res.status(200).json({success: false, message: 'No new products found', log})

  const { error } = await supabase.from('products').upsert(all, {onConflict: 'id'})
  if (error) return res.status(500).json({error: error.message})

  return res.status(200).json({success: true, count: all.length, log})
}

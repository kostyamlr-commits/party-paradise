import { queryAPI, CATEGORY_LIST } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'

// Vercel Cron calls this automatically once a day (see vercel.json).
// Vercel signs cron requests with CRON_SECRET as a Bearer token automatically -
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
//
// This runs server-side only - no browser is waiting on the response, so it
// is not subject to browser/connection timeouts. It is still subject to the
// Vercel serverless function execution limit, so categories are still
// processed in small internal batches sequentially to keep each batch fast
// and to checkpoint progress to Supabase as it goes (partial progress is
// saved even if a later batch in the run fails).
export default async function handler(req, res) {
  const authHeader = req.headers['authorization']
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManualTrigger = req.query.secret === process.env.CRON_SECRET

  if (!isVercelCron && !isManualTrigger) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const BATCH_SIZE = 5
  const overallLog = {}
  let totalAdded = 0

  const { data: existing } = await supabase.from('products').select('title_en')
  let existingTitles = (existing || []).map(p => p.title_en)

  for (let start = 0; start < CATEGORY_LIST.length; start += BATCH_SIZE) {
    const batch = CATEGORY_LIST.slice(start, start + BATCH_SIZE)
    const batchProducts = []
    const seenIds = new Set()

    for (const { id: cat, keywords: kws } of batch) {
      overallLog[cat] = []
      for (const kw of kws) {
        try {
          const products = await queryAPI(kw, cat, 1, [...existingTitles, ...batchProducts.map(p => p.title_en)])
          let added = 0
          for (const p of products) {
            if (seenIds.has(p.id)) continue
            seenIds.add(p.id)
            batchProducts.push({...p, cat_tag: cat, active: true, created_at: new Date().toISOString(), last_checked: new Date().toISOString()})
            added++
          }
          overallLog[cat].push({ kw, added })
          await new Promise(r => setTimeout(r, 200))
        } catch (e) {
          overallLog[cat].push({ kw, error: e.message })
        }
      }
    }

    // Checkpoint: write this batch to Supabase before moving to the next one,
    // so partial progress survives even if a later batch errors or the
    // function times out.
    if (batchProducts.length) {
      const { error } = await supabase.from('products').upsert(batchProducts, { onConflict: 'id' })
      if (!error) {
        totalAdded += batchProducts.length
        existingTitles = [...existingTitles, ...batchProducts.map(p => p.title_en)]
      } else {
        overallLog[`_batch_${start}_error`] = error.message
      }
    }
  }

  return res.status(200).json({ success: totalAdded > 0, totalAdded, log: overallLog })
}

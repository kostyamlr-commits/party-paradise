import { supabase } from '../../lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const page=parseInt(req.query.page)||1, limit=parseInt(req.query.limit)||8
    const q=req.query.q||'', cat=req.query.cat||''
    const from=(page-1)*limit, to=from+limit-1
    let query = supabase.from('products').select('*',{count:'exact'}).eq('active',true)
    if (q) query=query.or(`title.ilike.%${q}%,title_en.ilike.%${q}%`)
    else if (cat) query=query.eq('cat_tag',cat)
    query=query.order('orders',{ascending:false}).range(from,to)
    const {data,error,count}=await query
    if (error) throw error
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({products:data||[], total:count||0, hasMore:to<(count-1), page})
  } catch(e) { return res.status(500).json({error:e.message}) }
}

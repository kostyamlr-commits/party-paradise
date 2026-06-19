import { supabase } from '../../lib/supabase'
export default async function handler(req, res) {
  try { await supabase.from('products').select('id').limit(1); return res.status(200).json({ok:true}) }
  catch(e) { return res.status(200).json({ok:false}) }
}

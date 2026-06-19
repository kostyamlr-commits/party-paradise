import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import { CAT_LABELS } from '../lib/aliexpress'

function Skeleton() {
  return (
    <div className="glass-card" style={{overflow:'hidden'}}>
      <div style={{width:'100%',aspectRatio:'1/1',background:'linear-gradient(90deg,#1c1c20 25%,#26262c 50%,#1c1c20 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
      <div style={{padding:'14px 16px 18px',display:'flex',flexDirection:'column',gap:10}}>
        <div style={{height:42,borderRadius:8,background:'linear-gradient(90deg,#1c1c20 25%,#26262c 50%,#1c1c20 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:40,borderRadius:12,marginTop:4,background:'#1c1c20',animation:'shimmer 1.5s infinite'}}/>
      </div>
    </div>
  )
}

export default function ProductGrid({ initialProducts=[], total=0 }) {
  const [products, setProducts] = useState(initialProducts)
  const [hasMore, setHasMore] = useState(total > initialProducts.length)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('🎉 All Products')
  const seen = useRef(new Set(initialProducts.map(p=>p.id)))
  const busy = useRef(false)
  const sentinel = useRef(null)
  const page = useRef(1)
  const params = useRef({cat:'',q:''})

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const cat = p.get('cat')||'', q = p.get('q')||''
    params.current = {cat,q}
    setTitle(q ? `Results: "${q}"` : (CAT_LABELS[cat]||'🎉 All Products'))
    if (cat||q) { seen.current=new Set(); setProducts([]); setHasMore(true); page.current=1; load(1,cat,q) }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !busy.current) load(page.current+1, params.current.cat, params.current.q)
    }, {rootMargin:'400px'})
    if (sentinel.current) obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [hasMore])

  async function load(p, cat, q) {
    if (busy.current) return
    busy.current = true; setLoading(true)
    try {
      let url = `/api/products?page=${p}&limit=8`
      if (q) url += `&q=${encodeURIComponent(q)}`
      else if (cat) url += `&cat=${cat}`
      const r = await fetch(url)
      const d = await r.json()
      const fresh = (d.products||[]).filter(p => { if(seen.current.has(p.id)) return false; seen.current.add(p.id); return true })
      setProducts(prev => p===1 ? fresh : [...prev,...fresh])
      setHasMore(d.hasMore && fresh.length>0)
      page.current = p
    } catch(e) { console.error(e) }
    busy.current=false; setLoading(false)
  }

  return (
    <section id="products" style={{padding:'40px 16px',maxWidth:1280,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:4}}>
        <h2 style={{color:'#fff'}}>{title}</h2>
        <span style={{color:'#5a5a62',fontSize:13,fontWeight:600}}>{total} items</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20,marginTop:24}}>
        {products.map(p=><ProductCard key={p.id} product={p}/>)}
        {loading && products.length===0 && [1,2,3,4,5,6,7,8].map(i=><Skeleton key={i}/>)}
      </div>
      {products.length===0 && !loading && (
        <div style={{textAlign:'center',padding:'80px 20px',color:'#5a5a62'}}>
          <div style={{fontSize:56,marginBottom:16}}>🔍</div>
          <p style={{fontSize:18,fontWeight:600}}>No products found</p>
          <a href="/" style={{color:'#ff00e5',fontWeight:800,fontSize:16}}>← All products</a>
        </div>
      )}
      {loading && products.length>0 && (
        <div style={{textAlign:'center',padding:'32px 0'}}>
          <div style={{display:'inline-block',width:30,height:30,border:'3px solid rgba(255,255,255,0.1)',borderTop:'3px solid #ff00e5',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        </div>
      )}
      {!hasMore && !loading && products.length>0 && <p style={{textAlign:'center',color:'#3a3a40',padding:'32px 0',fontSize:14,fontWeight:600}}>🎉 You've seen it all!</p>}
      <div ref={sentinel} style={{height:1}}/>
    </section>
  )
}

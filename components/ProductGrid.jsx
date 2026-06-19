import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import ProductCard from './ProductCard'
import { CAT_LABELS } from '../lib/aliexpress'

const fetcher = url => fetch(url).then(r => r.json())

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

// SWR cache config: dedupingInterval keeps identical requests from re-fetching
// for 2 hours, so navigating back to a category already visited is instant
// and doesn't hit Supabase again - per Kostya's caching requirement.
const SWR_CONFIG = {
  dedupingInterval: 1000 * 60 * 60 * 2, // 2h
  revalidateOnFocus: false,
  revalidateIfStale: false,
}

export default function ProductGrid({ initialProducts=[], total=0 }) {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [allLoaded, setAllLoaded] = useState(initialProducts)
  const [page, setPage] = useState(1)
  const sentinel = useRef(null)
  const isFiltered = useRef(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const c = p.get('cat')||'', query = p.get('q')||''
    setCat(c); setQ(query)
    isFiltered.current = !!(c || query)
  }, [])

  const swrKey = (isFiltered.current || page > 1)
    ? `/api/products?page=${page}&limit=8${q?`&q=${encodeURIComponent(q)}`:cat?`&cat=${cat}`:''}`
    : null // page 1 unfiltered uses SSR initialProducts, no extra fetch needed

  const { data, isLoading } = useSWR(swrKey, fetcher, SWR_CONFIG)

  useEffect(() => {
    if (!data) return
    setAllLoaded(prev => page === 1 ? (data.products||[]) : [...prev, ...(data.products||[])])
  }, [data])

  useEffect(() => {
    // filtered/search view starts fresh
    if (isFiltered.current) { setAllLoaded([]); setPage(1) }
  }, [cat, q])

  const hasMore = data ? data.hasMore : total > initialProducts.length
  const loading = isLoading

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !loading) setPage(p => p + 1)
    }, {rootMargin:'400px'})
    if (sentinel.current) obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [hasMore, loading])

  const title = q ? `Results: "${q}"` : (CAT_LABELS[cat]||'🎉 All Products')

  return (
    <section id="products" style={{padding:'40px 16px',maxWidth:1280,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:4}}>
        <h2 style={{color:'#fff'}}>{title}</h2>
        <span style={{color:'#5a5a62',fontSize:13,fontWeight:600}}>{total} items</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20,marginTop:24}}>
        {allLoaded.map(p=><ProductCard key={p.id} product={p}/>)}
        {loading && allLoaded.length===0 && [1,2,3,4,5,6,7,8].map(i=><Skeleton key={i}/>)}
      </div>
      {allLoaded.length===0 && !loading && (
        <div style={{textAlign:'center',padding:'80px 20px',color:'#5a5a62'}}>
          <div style={{fontSize:56,marginBottom:16}}>🔍</div>
          <p style={{fontSize:18,fontWeight:600}}>No products found</p>
          <a href="/" style={{color:'#ff00e5',fontWeight:800,fontSize:16}}>← All products</a>
        </div>
      )}
      {loading && allLoaded.length>0 && (
        <div style={{textAlign:'center',padding:'32px 0'}}>
          <div style={{display:'inline-block',width:30,height:30,border:'3px solid rgba(255,255,255,0.1)',borderTop:'3px solid #ff00e5',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        </div>
      )}
      {!hasMore && !loading && allLoaded.length>0 && <p style={{textAlign:'center',color:'#3a3a40',padding:'32px 0',fontSize:14,fontWeight:600}}>🎉 You\'ve seen it all!</p>}
      <div ref={sentinel} style={{height:1}}/>
    </section>
  )
}

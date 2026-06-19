import { useState } from 'react'
import { colorForCategory } from '../lib/aliexpress'

const BADGES = ['🔥 Party Hit!', '⭐ Must Have!', '🚀 Trending', '💯 Crowd Favorite']

export default function ProductCard({ product }) {
  const [hover, setHover] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const color = colorForCategory(product.cat_tag)
  const badge = BADGES[Math.abs((product.id||'').length + (product.orders||0)) % BADGES.length]

  return (
    <article
      className="glass-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ overflow: 'hidden', position: 'relative', borderColor: hover ? `${color}66` : 'rgba(255,255,255,0.1)' }}
    >
      <div style={{ position:'absolute', top:10, left:10, zIndex:3, background:`${color}22`, border:`1px solid ${color}55`, color, fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:8, backdropFilter:'blur(6px)' }}>
        {badge}
      </div>

      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
        style={{ display:'block', width:'100%', aspectRatio:'1/1', background:'#0c0c0e', overflow:'hidden' }}>
        {!imgErr && product.image
          ? <img src={product.image} alt={product.title} loading="lazy"
              style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s', transform: hover?'scale(1.06)':'scale(1)' }}
              onError={() => setImgErr(true)} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>🎉</div>
        }
      </a>

      <div style={{ padding:'14px 16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
        <p style={{ margin:0, fontSize:14.5, fontWeight:700, color:'#f4f4f5', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:58 }}>
          {product.title}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:1 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize:13, color: i<=Math.round(product.rating||4.5) ? '#ffd23f' : '#3a3a40' }}>★</span>)}
          </div>
          <span style={{ fontSize:11.5, color:'#9a9aa2', fontWeight:600 }}>
            {(product.orders||0) >= 1000 ? `${Math.round(product.orders/1000*10)/10}K sold` : `${product.orders||0} sold`}
          </span>
        </div>
        <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:color, color:'#0a0a0a', fontSize:14, fontWeight:800, padding:'12px 0', borderRadius:12, transition:'all 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.filter='brightness(1.15)'}
          onMouseLeave={e=>e.currentTarget.style.filter='none'}
        >
          Get It Now →
        </a>
        <p style={{ margin:0, fontSize:10.5, color:'#5a5a62', textAlign:'center' }}>🚚 Fast worldwide shipping</p>
      </div>
    </article>
  )
}

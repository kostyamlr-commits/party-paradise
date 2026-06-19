import { useState } from 'react'
import { CAT_LABELS, CAT_GROUPS, GROUP_COLORS } from '../lib/aliexpress'

export default function Header() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) window.location.href = `/?q=${encodeURIComponent(q.trim())}`
  }

  return (
    <header style={{background:'#0a0a0a',borderBottom:'1px solid rgba(255,255,255,0.08)',position:'sticky',top:0,zIndex:100}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 16px',height:60,display:'flex',alignItems:'center',gap:12}}>
        <a href="/" style={{flexShrink:0}}>
          <span style={{fontSize:21,fontWeight:900,color:'#fff'}}>
            🎉 Party <span style={{color:'#ff00e5'}}>Paradise</span>
          </span>
        </a>
        <form onSubmit={handleSearch} style={{flex:1,maxWidth:400,display:'flex',gap:8,marginRight:'auto'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search party supplies..."
            style={{flex:1,height:38,padding:'0 14px',borderRadius:12,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',backdropFilter:'blur(8px)',color:'#fff',fontSize:14,outline:'none'}}/>
          <button type="submit" style={{height:38,padding:'0 18px',background:'#ff00e5',border:'none',borderRadius:12,color:'#fff',fontWeight:800,cursor:'pointer',fontSize:14}}>Go</button>
        </form>
        <button onClick={()=>setOpen(o=>!o)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#fff',padding:'8px 14px',cursor:'pointer',fontSize:14,fontWeight:700}}>
          ☰ Categories
        </button>
      </div>
      {open && (
        <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'20px 16px',maxWidth:1280,margin:'0 auto'}}>
          {Object.entries(CAT_GROUPS).map(([group, cats]) => (
            <div key={group} style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:GROUP_COLORS[group],textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>
                {group}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {cats.map(cat => (
                  <a key={cat} href={`/?cat=${cat}`}
                    style={{padding:'6px 14px',borderRadius:10,fontSize:13,fontWeight:600,color:'#e4e4e7',
                      background:'rgba(255,255,255,0.03)',border:`1px solid ${GROUP_COLORS[group]}33`}}
                  >{CAT_LABELS[cat]}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}

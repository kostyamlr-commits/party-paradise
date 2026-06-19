export default function Hero() {
  return (
    <section style={{ position:'relative', padding:'56px 16px 48px', borderBottom:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', background:'#0a0a0a' }}>
      <div style={{ position:'absolute', top:-60, left:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,#ff00e533,transparent 70%)' }}/>
      <div style={{ position:'absolute', bottom:-80, right:-40, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,#00f0ff22,transparent 70%)' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', textAlign:'center', position:'relative' }}>
        <h1 style={{ color:'#fff', marginBottom:14 }}>
          Party <span style={{ color:'#ff00e5' }}>Paradise</span>
        </h1>
        <p style={{ margin:'0 auto 30px', fontSize:18, color:'#9a9aa2', maxWidth:560, fontWeight:500 }}>
          The ultimate gear to turn any night into a legendary one.
        </p>
        <a href="#products" style={{ background:'#ff00e5', color:'#0a0a0a', fontSize:16, fontWeight:800, padding:'13px 30px', borderRadius:14, display:'inline-block' }}>
          Shop the Vibe →
        </a>
      </div>
    </section>
  )
}

import Head from 'next/head'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import { supabase } from '../../lib/supabase'
import { EVENTS, EVENT_LABELS, CAT_LABELS, CAT_GROUPS, GROUP_COLORS } from '../../lib/aliexpress'

const EVENT_GUIDES = {
  christmas: {
    title: "The Ultimate Guide to Christmas Party Supplies",
    description: "Find the best unique Christmas party decor, lighting, and gear to make your holiday gathering unforgettable. Curated picks for festive nights.",
    guide: "Christmas parties deserve more than string lights and a tree. The best holiday gatherings mix classic warmth with a few surprising touches \u2014 think smart LED lighting that syncs to music, novelty drinkware for mulled wine, and tabletop decor that photographs well for the group chat. Whether you're hosting an office party, a family get-together, or a cozy night with friends, the right party gear sets the tone before anyone says a word. Below you'll find our curated picks across lighting, bar gadgets, decor, and games \u2014 all selected for that unique Christmas party decor feel that goes beyond the basics.",
    relatedCats: ['neon-glow','theme-decor','smart-lighting','tableware','drinkware'],
  },
  halloween: {
    title: "Halloween Party Essentials: Decor, Props & Gear",
    description: "Spooky-good Halloween party supplies \u2014 atmosphere effects, costume accents, and gag gifts that turn any room into a haunted house.",
    guide: "A great Halloween party lives or dies on atmosphere. Fog machines and laser lighting do more heavy lifting than any amount of plastic cobwebs, and the right costume accents can turn a thrown-together outfit into something genuinely memorable. We've grouped the essentials \u2014 atmosphere FX, costume accents, gag and prank gear, and themed decor \u2014 so you can build a haunted house vibe without fifteen separate searches.",
    relatedCats: ['atmosphere-fx','costume-accents','gag-prank','theme-decor'],
  },
  bachelorette: {
    title: "Bachelorette Party Ideas: Supplies That Actually Slap",
    description: "Unique bachelorette party supplies \u2014 sashes, games, photo props, and drinkware the whole crew will actually want to use.",
    guide: "The best bachelorette party ideas balance a little chaos with photos you'll actually want to post. That means photo booth props that don't look cheap, drinking games people remember, and party wearables (sashes, glasses, the works) that read as fun rather than forced. Mix in some festival-gear energy if the night includes dancing, and you've got a night the bride won't forget.",
    relatedCats: ['photo-booth','drinking-games','party-wearables','drinkware','festival-gear'],
  },
  bachelor: {
    title: "Bachelor Party Gear & Game Night Essentials",
    description: "Bar gadgets, drinking games, and audio gear for a bachelor party that doesn't feel like a rerun.",
    guide: "Bachelor parties run on good drinks, good games, and sound that doesn't cut out at 11pm. A solid bar gadget setup elevates the night more than people expect, and a portable speaker with real bass beats a phone on a table every time. Pair that with a drinking game or two and you've got the foundation covered.",
    relatedCats: ['bar-gadgets','drinking-games','audio-karaoke','ice-chill'],
  },
  nye: {
    title: "New Year's Eve Party Supplies & Countdown Decor",
    description: "Ring in the new year right \u2014 NYE lighting, tableware, and party favors built for the countdown.",
    guide: "NYE is a one-night-a-year event, so the decor should feel like it. Smart lighting that can shift colors at midnight, festive tableware, and small party favors for guests to take home all add up to a countdown people remember. Outdoor-party gear is worth a look too if you're stepping outside for fireworks.",
    relatedCats: ['smart-lighting','tableware','party-favors','outdoor-party','neon-glow'],
  },
  birthday: {
    title: "Birthday Party Decor & Game Ideas for Every Age",
    description: "From theme decor to interactive games \u2014 birthday party supplies that work for kids and adults alike.",
    guide: "Birthday parties span every age, which is exactly why theme decor and interactive games are the two categories that matter most. A strong backdrop does most of the visual work, and a couple of genuinely fun group games will outlast any amount of balloons. Add serving gadgets if food's involved, and you're set.",
    relatedCats: ['theme-decor','interactive-games','serving-gadgets','tableware'],
  },
  kids: {
    title: "Kids Party Supplies Parents Actually Approve Of",
    description: "Safe, fun kids party gear \u2014 games, favors, and decor that keep the whole group entertained.",
    guide: "Kids parties need durable, simple-to-use gear more than anything flashy. Interactive games that don't require constant adult refereeing, party favors that won't end up in the trash by Tuesday, and decor that's colorful without being chaotic \u2014 that's the formula.",
    relatedCats: ['interactive-games','party-favors','theme-decor'],
  },
  romance: {
    title: "Romantic Night-In Setup: Lighting, Drinkware & Decor",
    description: "Romantic party and date-night supplies \u2014 ambient lighting, drinkware, and decor for two.",
    guide: "Romance is mostly a lighting problem. Warm, dimmable, ambient \u2014 smart lighting solves most of it instantly. Pair that with nicer drinkware than your everyday glasses and a little theme decor, and a regular evening starts to feel like an occasion.",
    relatedCats: ['smart-lighting','drinkware','theme-decor','ice-chill'],
  },
  anniversary: {
    title: "Anniversary Celebration Supplies & Decor",
    description: "Elevated anniversary party decor and drinkware for milestone celebrations.",
    guide: "Anniversaries call for a step up from the everyday \u2014 elegant drinkware, ambient lighting, and decor that feels intentional rather than thrown together. A few well-chosen pieces go further than a room full of generic decorations.",
    relatedCats: ['drinkware','smart-lighting','theme-decor','serving-gadgets'],
  },
  surprise: {
    title: "Surprise Party Planning: Decor & Setup Essentials",
    description: "Everything for a surprise party that actually surprises \u2014 quick-setup decor, lighting, and games.",
    guide: "Surprise parties are a logistics problem disguised as a party. You need decor that sets up fast and quietly, lighting that can switch on dramatically at the right moment, and a game or two ready to go the second the surprise lands. Keep it simple and keep it ready.",
    relatedCats: ['theme-decor','smart-lighting','interactive-games','party-favors'],
  },
}

export default function EventHub({ event, guide, products }) {
  if (!guide) return null
  const color = '#ff00e5'

  return (
    <>
      <Head>
        <title>{guide.title} | Party Paradise</title>
        <meta name="description" content={guide.description} />
        <meta property="og:title" content={guide.title} />
        <meta property="og:description" content={guide.description} />
      </Head>
      <Header />
      <main>
        <section style={{ padding: '48px 16px 32px', maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ color: '#fff', marginBottom: 16 }}>{EVENT_LABELS[event]} Party Supplies</h1>
          <p style={{ color: '#b4b4ba', fontSize: 16, lineHeight: 1.7, maxWidth: 760 }}>{guide.guide}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '24px 0 40px' }}>
            <span style={{ fontSize: 12, color: '#9a9aa2', fontWeight: 700, marginLeft: 4, marginTop: 6 }}>Recommended Categories:</span>
            {guide.relatedCats.map(cat => (
              <a key={cat} href={`/?cat=${cat}`} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#e4e4e7', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}44` }}>
                {CAT_LABELS[cat]}
              </a>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {products.length === 0 && (
            <p style={{ color: '#5a5a62', textAlign: 'center', padding: '40px 0' }}>
              No tagged products yet for this event \u2014 check back soon, or browse the categories above.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export async function getStaticPaths() {
  return { paths: EVENTS.map(event => ({ params: { event } })), fallback: false }
}

export async function getStaticProps({ params }) {
  const event = params.event
  const guide = EVENT_GUIDES[event]
  if (!guide) return { notFound: true }

  try {
    const { data, error } = await supabase
      .from('products').select('*').eq('active', true)
      .contains('event_tags', [event])
      .order('orders', { ascending: false })
      .limit(16)
    if (error) throw error
    return { props: { event, guide, products: data || [] }, revalidate: 60 }
  } catch (e) {
    console.error('event getStaticProps error:', e.message)
    return { props: { event, guide, products: [] }, revalidate: 60 }
  }
}

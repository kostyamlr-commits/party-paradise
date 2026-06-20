import '../styles/globals.css'
import BackToTop from '../components/BackToTop'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <BackToTop />
    </>
  )
}

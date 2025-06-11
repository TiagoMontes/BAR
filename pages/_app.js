import '../styles/globals.css'
import { AtendentesProvider } from '../contexts/AtendentesContext'
import { PrintProvider } from '../contexts/PrintContext'

function MyApp({ Component, pageProps }) {
  return (
    <AtendentesProvider>
      <PrintProvider>
        <Component {...pageProps} />
      </PrintProvider>
    </AtendentesProvider>
  )
}

export default MyApp 
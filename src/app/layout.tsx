import '@/styles/globals.css'
import { Roboto_Mono } from "next/font/google"
import { UserProvider } from '@/components/UserProvider'
import { Meta } from './Meta'

export const metadata = Meta

const fonts = Roboto_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <link rel='manifest' href='/manifest.json' />
      <body className={`${fonts.className} antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}

import dynamic from 'next/dynamic'
import Footer from "@/components/shared/Footer"

const Header = dynamic(() => import('@/components/shared/Header'), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

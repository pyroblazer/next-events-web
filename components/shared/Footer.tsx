import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t px-8">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href='/'>
          <Image 
            src="/assets/images/logo.svg"
            alt="logo"
            width={256}
            height={76}
          />
        </Link>

        <p>© {currentYear} CelebrateConnect. All Rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
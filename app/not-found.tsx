import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrapper flex-center min-h-[60vh] flex-col gap-4">
      <h2 className="h2-bold">Page not found</h2>
      <Link href="/" className="text-primary-500 underline">Back to events</Link>
    </div>
  )
}

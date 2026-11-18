'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrapper flex-center min-h-[40vh] flex-col gap-4" role="alert">
      <h2 className="h3-bold">Something went wrong</h2>
      <button onClick={reset} className="button rounded-full px-6 py-3">Try again</button>
    </div>
  )
}

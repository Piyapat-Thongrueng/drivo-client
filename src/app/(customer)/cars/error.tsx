"use client"

import { useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"

interface CarsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CarsError({ error, reset }: CarsErrorProps): React.JSX.Element {
  useEffect(() => {
    // log error เพื่อ debug (ไม่ส่งขึ้น production monitoring ในตอนนี้)
    console.error("[CarsPage] Error:", error)
  }, [error])

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-5xl">🚗</p>
          <h1 className="headline-2 font-bold text-brand-gray-900">Something went wrong</h1>
          <p className="body-2 max-w-md text-brand-gray-600">
            We couldn&apos;t load the available vehicles. Please try again or go back to search.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="primary" size="md" onClick={reset}>
            Try Again
          </Button>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-gray-300 bg-brand-white px-4 py-2.5 text-sm font-medium text-brand-gray-700 transition-colors hover:bg-brand-gray-50"
          >
            Back to Search
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

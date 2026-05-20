"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import BranchSidebar from "@/components/branch/BranchSidebar"
import { useAuth } from "@/contexts/auth-context"
import { getBranchMe } from "@/lib/api/branch-handover"

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { signOut, session } = useAuth()
  const router = useRouter()
  const [branchName, setBranchName] = useState<string | undefined>()

  useEffect(() => {
    if (!session?.access_token) return
    getBranchMe(session.access_token)
      .then((me) => setBranchName(me.branchName))
      .catch(() => {})
  }, [session?.access_token])

  const handleLogout = useCallback(async () => {
    await signOut()
    router.push("/")
  }, [signOut, router])

  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray-50">
      <BranchSidebar branchName={branchName} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

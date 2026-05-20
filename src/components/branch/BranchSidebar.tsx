"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

interface NavItem {
  label: string
  href: string
  Icon: typeof ArrowDownToLine
}

const NAV_ITEMS: NavItem[] = [
  { label: "Pick-up Queue", href: "/branch/pickup", Icon: ArrowDownToLine },
  { label: "Return Queue", href: "/branch/return", Icon: ArrowUpFromLine },
]

const rowBase =
  "body-3 relative flex w-full items-center gap-3 rounded-lg py-3 pl-3 pr-4 text-left font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200"
const rowInactive = `${rowBase} text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-gray-900`
const rowActive = `${rowBase} bg-brand-gray-50 text-brand-red-200`

export interface BranchSidebarProps {
  branchName?: string
  onLogout?: () => void
}

export default function BranchSidebar({
  branchName,
  onLogout,
}: BranchSidebarProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <aside
      className="flex w-60 shrink-0 flex-col border-r border-brand-gray-100 bg-brand-white"
      aria-label="Branch Staff navigation"
    >
      <div className="px-5 pb-4 pt-8">
        <p className="font-serif text-xl font-bold leading-tight text-brand-red-200">Drivo</p>
        <p className="body-3 mt-1 text-brand-gray-500">Branch Staff Portal</p>
        {branchName && (
          <p className="mt-1 truncate text-xs font-medium text-brand-gray-700">{branchName}</p>
        )}
      </div>

      <nav className="flex flex-1 flex-col px-3 pb-4" aria-label="Main">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={active ? rowActive : rowInactive}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span
                      className="absolute bottom-2 right-0 top-2 w-1 rounded-l-sm bg-brand-red-200"
                      aria-hidden
                    />
                  )}
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-auto border-t border-brand-gray-100 pt-4">
          <button
            type="button"
            onClick={onLogout}
            className={`${rowBase} text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-red-200`}
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}

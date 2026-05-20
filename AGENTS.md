<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Drivo — Frontend Agent Rules

## Project Overview

**Drivo** is a worldwide car rental booking platform built for a job application assessment.
Code quality is evaluated on 4 criteria — treat every file as if a senior engineer is reviewing it:

1. **Code Structure** — File organization, Efficiency, Readability, Maintainability
2. **UI/UX** — Beautiful, clean, intuitive design
3. **Security** — Safe usage patterns and secure code
4. **Feature Completeness** — Correct and complete implementation

---

## Tech Stack

```
Framework:      Next.js App Router (latest)
Styling:        Tailwind CSS
Auth:           Supabase Authentication (@supabase/supabase-js, @supabase/ssr)
Data Fetching:  Axios — ALWAYS use custom instance from @/lib/axios
State:          Zustand
Date/Time:      dayjs with timezone plugin
Payment:        Stripe (@stripe/stripe-js)
Realtime:       Supabase Realtime
Storage:        Supabase Storage
Backend:        Express.js on port 3001 (separate project)
```

---

## Readability Rules

- Write code as if a junior developer will read it tomorrow
- Prefer clear and descriptive variable names over short ones
- Break complex logic into small named functions with a single responsibility
- Add comments to explain WHY, not WHAT (the code already shows what)
- Avoid clever one-liners — split into multiple readable lines instead
- Each function should do one thing only

## Project Structure

```
src/
├── app/
│   ├── (customer)/               # Customer-facing pages
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page
│   │   ├── cars/
│   │   │   ├── page.tsx          # Car listing
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Car detail
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   ├── booking/
│   │   │   └── [carId]/
│   │   │       └── page.tsx      # Booking flow
│   │   ├── payment/
│   │   │   └── [bookingId]/
│   │   │       └── page.tsx
│   │   └── my-account/
│   │       └── page.tsx
│   │
│   ├── (admin)/                  # Back-office pages
│   │   ├── layout.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── cars/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── members/page.tsx
│   │   │   ├── branches/page.tsx
│   │   │   ├── countries/page.tsx
│   │   │   └── reports/page.tsx
│   │   └── branch/
│   │       └── queue/page.tsx    # Branch Staff page
│   │
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/                       # Reusable base components only
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── customer/
│   │   ├── SearchBar.tsx
│   │   ├── CarCard.tsx
│   │   ├── CarGrid.tsx
│   │   ├── PricingCalculator.tsx
│   │   ├── BookingFlow/
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── StepTripSummary.tsx
│   │   │   ├── StepAddons.tsx
│   │   │   ├── StepPersonalInfo.tsx
│   │   │   └── StepReview.tsx
│   │   ├── BookingCard.tsx
│   │   └── ChatBot.tsx
│   │
│   └── admin/
│       ├── BookingTable.tsx
│       ├── CarTable.tsx
│       ├── CarDrawer.tsx
│       ├── MemberTable.tsx
│       ├── StatCard.tsx
│       └── RevenueChart.tsx
│
├── lib/
│   ├── axios.ts                  # Custom Axios instances — import from here only
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   └── stripe.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── bookingStore.ts
│   └── searchStore.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useBooking.ts
│   └── useRealtime.ts
│
├── types/
│   ├── index.ts                  # Re-export all types
│   ├── booking.ts
│   ├── car.ts
│   ├── user.ts
│   └── api.ts
│
├── utils/
│   ├── pricing.ts                # Pricing calculation logic
│   ├── currency.ts               # Currency formatting
│   ├── date.ts                   # Date/timezone helpers (dayjs)
│   └── cn.ts                     # Tailwind className merger
│
└── middleware.ts                  # Route protection
```

---

## TypeScript Rules

- **NEVER use `any`** — use `unknown` and narrow the type, or define a proper interface
- All functions must have explicit return types
- All component props must have an explicit interface
- Use `interface` for object shapes, `type` for unions and primitives
- Use `as const` for constant objects

```typescript
// ✅ Good
interface CarCardProps {
  car: Car
  onSelect: (carId: number) => void
  className?: string
}

export default function CarCard({ car, onSelect, className }: CarCardProps): React.JSX.Element {
  // ...
}

// ❌ Bad — never do this
export default function CarCard(props: any) { }
const data: any = response.data
```

---

## Next.js App Router Rules

### Server vs Client Components

- **Default is Server Component** — do NOT add `'use client'` unless required
- Add `'use client'` ONLY when the component uses: `useState`, `useEffect`, event handlers (`onClick`, `onChange`), or browser APIs (`localStorage`, `window`)
- Never use `useEffect` to fetch data — use async Server Components instead

```typescript
// ✅ Server Component — fetch directly, no useEffect needed
export default async function CarsPage(): Promise<React.JSX.Element> {
  const cars = await fetchCars()
  return <CarGrid cars={cars} />
}

// ✅ Client Component — has state and event handler
'use client'
export default function SearchBar(): React.JSX.Element {
  const [query, setQuery] = useState<string>('')
  return <input onChange={(e) => setQuery(e.target.value)} />
}
```

### Required Files Per Route

Every route that fetches data MUST have these files:

```
app/cars/
  ├── page.tsx       # main page
  ├── loading.tsx    # shown while page.tsx is loading
  └── error.tsx      # shown if page.tsx throws an error
```

```typescript
// loading.tsx
export default function Loading(): React.JSX.Element {
  return <Skeleton />  // use skeleton component, not spinner text
}

// error.tsx — must be 'use client'
'use client'
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}): React.JSX.Element {
  return (
    <div>
      <p>Something went wrong</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Images and Navigation

```typescript
// ✅ Always use next/image — never raw <img>
import Image from 'next/image'
<Image src={car.image_url} alt={`${car.make} ${car.model}`} width={400} height={300} />

// ✅ Always use next/link for internal links — never raw <a>
import Link from 'next/link'
<Link href={`/cars/${car.id}`}>View Details</Link>

// ✅ <a> is allowed for external links only
<a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>
```

### Metadata

Every `page.tsx` MUST export metadata:

```typescript
import type { Metadata } from 'next'

// Static
export const metadata: Metadata = {
  title: 'Available Cars | Drivo',
  description: 'Browse rental cars worldwide'
}

// Dynamic (when title depends on data)
export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const car = await fetchCar(params.id)
  return {
    title: `${car.make} ${car.model} | Drivo`,
  }
}
```

---

## Axios Rules

**NEVER import axios directly** — always use the custom instances from `@/lib/axios`

```typescript
// src/lib/axios.ts

import axios from 'axios'

// For Client Components — reads token from localStorage
export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

clientApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// For Server Components — token passed as parameter
export const serverApi = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})
```

---

## Supabase Auth Rules

```typescript
// src/lib/supabase/client.ts — use in Client Components
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// src/lib/supabase/server.ts — use in Server Components and middleware
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## Route Protection (middleware.ts)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes — require super_admin role
  if (pathname.startsWith('/admin')) {
    // check role from session
    // redirect to /admin/login if unauthorized
  }

  // Branch routes — require branch_staff role
  if (pathname.startsWith('/branch')) {
    // check role from session
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/branch/:path*', '/my-account/:path*']
}
```

---

## Zustand Store Rules

```typescript
// stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  role: 'user' | 'branch_staff' | 'super_admin'
  firstName: string
  lastName: string
  branchId?: number
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'drivo-auth' }
  )
)
```

---

## Security Rules

- **NEVER expose** `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the client — server-only
- **NEVER store** sensitive data in `localStorage` — use httpOnly cookies for tokens
- **ALWAYS validate** user input before sending to API
- **ALWAYS use** `rel="noopener noreferrer"` on external `<a>` links
- **NEVER use** `dangerouslySetInnerHTML` unless absolutely necessary
- Use environment variables — never hardcode API keys or URLs
- All `NEXT_PUBLIC_` variables are exposed to browser — only put non-sensitive values

```typescript
// ✅ Safe — public values only
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_API_URL=http://localhost:3001

// ✅ Safe — server only (no NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...

// ❌ Never do this
const key = 'sk_live_hardcoded_stripe_key'
```

---

## Tailwind CSS Rules

- Use the `cn()` utility from `@/utils/cn` to merge conditional classes
- Never use inline `style={{}}` — use Tailwind classes instead
- Follow the design system colors defined in `tailwind.config.ts`
- Use responsive prefixes: `sm:`, `md:`, `lg:` for responsive design

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

---

## Component Rules

- Keep components under 200 lines — split into smaller components if longer
- One component per file
- File name must match component name: `CarCard.tsx` exports `CarCard`
- Extract repeated logic into custom hooks in `src/hooks/`
- Always handle loading, error, and empty states

```typescript
// ✅ Always handle all states
export default function BookingList(): React.JSX.Element {
  const { data, isLoading, error } = useBookings()

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage message={error.message} />
  if (!data?.length) return <EmptyState message="No bookings yet" />

  return <div>{data.map(booking => <BookingCard key={booking.id} booking={booking} />)}</div>
}
```

---

## Pricing Calculation Rules

The pricing engine MUST follow these rules exactly — this is a core feature evaluated by the reviewer:

- Two rates: **hourly** and **daily**
- If usage **exceeds 8 hours** → count as **1 full day**
- If return time is **after 14:00** (strictly past 14:00; **14:00 sharp does not count**) → that day counts as **1 full day**
- Multi-day: after each full day, hourly counting **resets at pickup time** on the next day (not midnight)

```typescript
// src/utils/pricing.ts

// Rule 1: Return AFTER 14:00 (not at 14:00) → 1 full day for that period
// Rule 2: Usage > 8 hours (strictly) → 1 full day
// Rule 3: Multi-day — hourly counter resets at pickup time each day (not midnight)

// Reviewer examples:
// 10:00 → 12:00 same day → 2 hours
// 10:00 → 15:00 same day → 1 day (return after 14:00)
// 10:00 → 14:00 same day → 4 hours (not after 14:00, under 8 h)
// 10:00 Day1 → 11:00 Day2 → 1 day + 1 hour

// All datetime calculations MUST use the branch's timezone (dayjs-timezone)
```

---

## Error Handling Rules

```typescript
// ✅ Always wrap API calls in try/catch with typed errors
async function fetchCar(id: number): Promise<Car> {
  try {
    const response = await clientApi.get<Car>(`/cars/${id}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? 'Failed to fetch car')
    }
    throw new Error('An unexpected error occurred')
  }
}
```

---

## Naming Conventions

```
Files:        PascalCase for components   → CarCard.tsx
              camelCase for utils/hooks   → usePricing.ts, pricing.ts
              camelCase for stores        → authStore.ts

Variables:    camelCase                   → const carList = []
Constants:    UPPER_SNAKE_CASE            → const MAX_RETRY = 3
Types:        PascalCase                  → interface BookingStatus {}
Enums:        PascalCase                  → type Role = 'user' | 'branch_staff'
```

---

## Import Order

Always follow this import order (enforced by ESLint):

```typescript
// 1. React and Next.js
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 2. Third-party libraries
import dayjs from 'dayjs'
import axios from 'axios'

// 3. Internal — absolute imports with @/
import { clientApi } from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { Car } from '@/types'

// 4. Components
import CarCard from '@/components/customer/CarCard'
import { Button } from '@/components/ui/Button'

// 5. Relative imports
import './styles.css'
```

---

## What NOT To Do

```typescript
// ❌ Never fetch data with useEffect in a component — use Server Component instead
useEffect(() => { fetchData() }, [])

// ❌ Never use raw <img> — use next/image
<img src={car.image_url} />

// ❌ Never use raw <a> for internal links — use next/link
<a href="/cars">Cars</a>

// ❌ Never use any
const data: any = response

// ❌ Never hardcode colors outside Tailwind config
style={{ color: '#ff3a3a' }}

// ❌ Never import axios directly in components
import axios from 'axios'
axios.get('/api/cars')

// ❌ Never expose secret keys with NEXT_PUBLIC_ prefix
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...
```



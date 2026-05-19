export interface UserProfile {
  id: number
  authId: string
  role: "user" | "super_admin" | "branch_staff"
  status: "active" | "suspended"
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  branchId: number | null
  createdAt: string
  updatedAt: string
}

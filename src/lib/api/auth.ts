import axios from "axios"
import type { UserProfile } from "@/types/user"
import { publicApiUrl } from "./base-url"

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/** GET /api/auth/me — โปรไฟล์ user ที่ login */
export async function getMyProfile(token: string): Promise<UserProfile> {
  const { data } = await axios.get<{ success: boolean; data: UserProfile }>(
    publicApiUrl("/api/auth/me"),
    { headers: authHeader(token) },
  )
  return data.data
}

/** PATCH /api/auth/me — อัปเดตโปรไฟล์ (phone, firstName, lastName) */
export async function updateMyProfile(
  payload: { firstName?: string; lastName?: string; phone?: string },
  token: string,
): Promise<UserProfile> {
  const { data } = await axios.patch<{ success: boolean; data: UserProfile }>(
    publicApiUrl("/api/auth/me"),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

import axios from "axios"
import type { Country, CreateCountryPayload, UpdateCountryPayload } from "@/types/country"
import { publicApiUrl } from "./base-url"

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// GET /api/countries — public, no token required
export async function fetchCountries(): Promise<Country[]> {
  const { data } = await axios.get<{ success: boolean; data: Country[] }>(
    publicApiUrl("/api/countries"),
  )
  return data.data
}

// GET /api/countries/:id — public, no token required
export async function fetchCountry(id: number): Promise<Country> {
  const { data } = await axios.get<{ success: boolean; data: Country }>(
    publicApiUrl(`/api/countries/${id}`),
  )
  return data.data
}

// POST /api/countries — super_admin only
export async function createCountry(
  payload: CreateCountryPayload,
  token: string,
): Promise<Country> {
  const { data } = await axios.post<{ success: boolean; data: Country }>(
    publicApiUrl("/api/countries"),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

// PATCH /api/countries/:id — super_admin only
export async function updateCountry(
  id: number,
  payload: UpdateCountryPayload,
  token: string,
): Promise<Country> {
  const { data } = await axios.patch<{ success: boolean; data: Country }>(
    publicApiUrl(`/api/countries/${id}`),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

// DELETE /api/countries/:id — super_admin only
export async function deleteCountry(id: number, token: string): Promise<void> {
  await axios.delete(publicApiUrl(`/api/countries/${id}`), {
    headers: authHeader(token),
  })
}

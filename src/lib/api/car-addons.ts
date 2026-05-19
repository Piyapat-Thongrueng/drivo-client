import axios from "axios"
import type { CarAddon, CreateCarAddonPayload, UpdateCarAddonPayload } from "@/types/car-addon"
import { publicApiUrl } from "./base-url"

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function num(v: unknown): number {
  if (typeof v === "bigint") return Number(v)
  return Number(v)
}

function normalizeAddon(row: CarAddon): CarAddon {
  return {
    ...row,
    id: num(row.id),
    carId: num(row.carId),
  }
}

/** GET /api/cars/:carId/addons — send Bearer so super_admin sees all addons */
export async function fetchCarAddons(carId: number, token: string): Promise<CarAddon[]> {
  const { data } = await axios.get<{ success: boolean; data: CarAddon[] }>(
    publicApiUrl(`/api/cars/${carId}/addons`),
    { headers: authHeader(token) },
  )
  return data.data.map(normalizeAddon)
}

/** GET /api/cars/:carId/addons — public (no token) — ลูกค้าและ guest ดูได้ */
export async function fetchCarAddonsPublic(carId: number): Promise<CarAddon[]> {
  const { data } = await axios.get<{ success: boolean; data: CarAddon[] }>(
    publicApiUrl(`/api/cars/${carId}/addons`),
  )
  return data.data.map(normalizeAddon)
}

export async function createCarAddon(
  carId: number,
  payload: CreateCarAddonPayload,
  token: string,
): Promise<CarAddon> {
  const { data } = await axios.post<{ success: boolean; data: CarAddon }>(
    publicApiUrl(`/api/cars/${carId}/addons`),
    payload,
    { headers: authHeader(token) },
  )
  return normalizeAddon(data.data)
}

export async function updateCarAddon(
  carId: number,
  addonId: number,
  payload: UpdateCarAddonPayload,
  token: string,
): Promise<CarAddon> {
  const { data } = await axios.patch<{ success: boolean; data: CarAddon }>(
    publicApiUrl(`/api/cars/${carId}/addons/${addonId}`),
    payload,
    { headers: authHeader(token) },
  )
  return normalizeAddon(data.data)
}

export async function deleteCarAddon(
  carId: number,
  addonId: number,
  token: string,
): Promise<void> {
  await axios.delete(publicApiUrl(`/api/cars/${carId}/addons/${addonId}`), {
    headers: authHeader(token),
  })
}

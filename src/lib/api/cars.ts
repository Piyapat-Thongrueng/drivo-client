import axios from "axios"
import type { Car, CarDetail, CreateCarPayload, UpdateCarPayload } from "@/types/car"
import { publicApiUrl } from "./base-url"

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function num(v: unknown): number {
  if (typeof v === "bigint") return Number(v)
  return Number(v)
}

/** Normalize API ids (bigint JSON) to number */
function normalizeCarDetail(raw: CarDetail): CarDetail {
  return {
    ...raw,
    id: num(raw.id),
    branchId: num(raw.branchId),
    currentBranchId: num(raw.currentBranchId),
    hasActiveBooking: Boolean(raw.hasActiveBooking),
  }
}

/** GET /api/cars — super_admin; optional ?branchId= */
export async function fetchCars(token: string, branchId?: number): Promise<Car[]> {
  const url = branchId
    ? publicApiUrl(`/api/cars?branchId=${branchId}`)
    : publicApiUrl("/api/cars")
  const { data } = await axios.get<{ success: boolean; data: Car[] }>(url, {
    headers: authHeader(token),
  })
  return data.data
}

/** GET /api/cars/:id — public; includes hasActiveBooking */
export async function fetchCar(id: number): Promise<CarDetail> {
  const { data } = await axios.get<{ success: boolean; data: CarDetail }>(
    publicApiUrl(`/api/cars/${id}`),
  )
  return normalizeCarDetail(data.data)
}

export async function createCar(payload: CreateCarPayload, token: string): Promise<Car> {
  const { data } = await axios.post<{ success: boolean; data: Car }>(
    publicApiUrl("/api/cars"),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

export async function updateCar(
  id: number,
  payload: UpdateCarPayload,
  token: string,
): Promise<Car> {
  const { data } = await axios.patch<{ success: boolean; data: Car }>(
    publicApiUrl(`/api/cars/${id}`),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

export async function deleteCar(id: number, token: string): Promise<void> {
  await axios.delete(publicApiUrl(`/api/cars/${id}`), {
    headers: authHeader(token),
  })
}

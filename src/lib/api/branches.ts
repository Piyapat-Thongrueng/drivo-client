import axios from "axios"
import type {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
  OneWayFee,
  CreateOneWayFeePayload,
  UpdateOneWayFeePayload,
} from "@/types/branch"
import { publicApiUrl } from "./base-url"

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// ─── Branches ───────────────────────────────────────────────────────────────

export async function fetchBranches(countryId?: number): Promise<Branch[]> {
  const url = countryId
    ? publicApiUrl(`/api/branches?countryId=${countryId}`)
    : publicApiUrl("/api/branches")
  const { data } = await axios.get<{ success: boolean; data: Branch[] }>(url)
  return data.data
}

export async function fetchBranch(id: number): Promise<Branch> {
  const { data } = await axios.get<{ success: boolean; data: Branch }>(
    publicApiUrl(`/api/branches/${id}`),
  )
  return data.data
}

export async function createBranch(
  payload: CreateBranchPayload,
  token: string,
): Promise<Branch> {
  const { data } = await axios.post<{ success: boolean; data: Branch }>(
    publicApiUrl("/api/branches"),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

export async function updateBranch(
  id: number,
  payload: UpdateBranchPayload,
  token: string,
): Promise<Branch> {
  const { data } = await axios.patch<{ success: boolean; data: Branch }>(
    publicApiUrl(`/api/branches/${id}`),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

export async function deleteBranch(id: number, token: string): Promise<void> {
  await axios.delete(publicApiUrl(`/api/branches/${id}`), {
    headers: authHeader(token),
  })
}

// ─── One-Way Fees ────────────────────────────────────────────────────────────

export async function fetchOneWayFees(fromBranchId?: number): Promise<OneWayFee[]> {
  const url = fromBranchId
    ? publicApiUrl(`/api/one-way-fees?fromBranchId=${fromBranchId}`)
    : publicApiUrl("/api/one-way-fees")
  const { data } = await axios.get<{ success: boolean; data: OneWayFee[] }>(url)
  return data.data
}

export async function createOneWayFee(
  payload: CreateOneWayFeePayload,
  token: string,
): Promise<OneWayFee> {
  const { data } = await axios.post<{ success: boolean; data: OneWayFee }>(
    publicApiUrl("/api/one-way-fees"),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

export async function updateOneWayFee(
  id: number,
  payload: UpdateOneWayFeePayload,
  token: string,
): Promise<OneWayFee> {
  const { data } = await axios.patch<{ success: boolean; data: OneWayFee }>(
    publicApiUrl(`/api/one-way-fees/${id}`),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

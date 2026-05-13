"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowRight, ArrowLeftRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Toggle } from "@/components/ui/Toggle"
import { Spinner } from "@/components/ui/spinner"
import { fetchBranches, fetchOneWayFees, createOneWayFee, updateOneWayFee } from "@/lib/api/branches"
import type { Branch, OneWayFee } from "@/types/branch"
import type { Country } from "@/types/country"

interface OneWayFeeSectionProps {
  currentBranch: Branch
  country: Country
  token: string
}

interface FeeRow {
  targetBranch: Branch
  forwardFee: OneWayFee | null   // currentBranch → target
  reverseFee: OneWayFee | null   // target → currentBranch
  forwardValue: string
  reverseValue: string
  reverseToggle: boolean          // true = ใช้ค่าเดียวกันทั้งสองทิศ
  isSaving: boolean
  saveError: string | null
}

export function OneWayFeeSection({ currentBranch, country, token }: OneWayFeeSectionProps) {
  const [rows, setRows] = useState<FeeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [allBranches, allFees] = await Promise.all([
        fetchBranches(currentBranch.countryId),
        fetchOneWayFees(),
      ])

      const siblings = allBranches.filter((b) => b.id !== currentBranch.id)

      const built: FeeRow[] = siblings.map((target) => {
        const forward = allFees.find(
          (f) => f.fromBranchId === currentBranch.id && f.toBranchId === target.id,
        ) ?? null
        const reverse = allFees.find(
          (f) => f.fromBranchId === target.id && f.toBranchId === currentBranch.id,
        ) ?? null

        return {
          targetBranch: target,
          forwardFee: forward,
          reverseFee: reverse,
          forwardValue: forward ? forward.fee : "",
          reverseValue: reverse ? reverse.fee : "",
          reverseToggle: false,
          isSaving: false,
          saveError: null,
        }
      })

      setRows(built)
    } catch {
      // error ไม่ critical — แสดง empty
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch.id, currentBranch.countryId])

  useEffect(() => {
    load()
  }, [load])

  function updateRow(idx: number, patch: Partial<FeeRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function handleForwardChange(idx: number, value: string) {
    const row = rows[idx]
    if (row.reverseToggle) {
      updateRow(idx, { forwardValue: value, reverseValue: value })
    } else {
      updateRow(idx, { forwardValue: value })
    }
  }

  function handleReverseChange(idx: number, value: string) {
    updateRow(idx, { reverseValue: value })
  }

  function handleToggleReverse(idx: number, checked: boolean) {
    const row = rows[idx]
    if (checked) {
      updateRow(idx, { reverseToggle: true, reverseValue: row.forwardValue })
    } else {
      updateRow(idx, { reverseToggle: false })
    }
  }

  async function handleSave(idx: number) {
    const row = rows[idx]
    const forwardNum = parseFloat(row.forwardValue)
    const reverseNum = parseFloat(row.reverseValue)

    if (isNaN(forwardNum) || forwardNum < 0) {
      updateRow(idx, { saveError: "Forward fee must be a valid non-negative number" })
      return
    }
    if (row.reverseValue !== "" && (isNaN(reverseNum) || reverseNum < 0)) {
      updateRow(idx, { saveError: "Reverse fee must be a valid non-negative number" })
      return
    }

    updateRow(idx, { isSaving: true, saveError: null })
    try {
      // บันทึก forward fee (A → B)
      if (row.forwardFee) {
        await updateOneWayFee(row.forwardFee.id, { fee: forwardNum }, token)
      } else {
        await createOneWayFee(
          { fromBranchId: currentBranch.id, toBranchId: row.targetBranch.id, fee: forwardNum },
          token,
        )
      }

      // หลังสร้าง forward fee ใหม่ backend จะ auto-สร้าง reverse (fee=0) ด้วย
      // ต้อง refetch ก่อนเพื่อหา id ของ reverse fee ที่ถูกสร้างอัตโนมัติ
      if (row.reverseValue !== "") {
        const latestFees = await fetchOneWayFees()
        const latestReverseFee =
          latestFees.find(
            (f) =>
              f.fromBranchId === row.targetBranch.id &&
              f.toBranchId === currentBranch.id,
          ) ?? row.reverseFee

        if (latestReverseFee) {
          await updateOneWayFee(latestReverseFee.id, { fee: reverseNum }, token)
        } else {
          await createOneWayFee(
            { fromBranchId: row.targetBranch.id, toBranchId: currentBranch.id, fee: reverseNum },
            token,
          )
        }
      }

      await load()
    } catch {
      updateRow(idx, { saveError: "Failed to save fee. Please try again." })
    } finally {
      updateRow(idx, { isSaving: false })
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-brand-gray-100 space-y-4">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-brand-gray-100">
      <div className="mb-6">
        <h2 className="headline-3 text-brand-gray-900">One-Way Fees</h2>
        <p className="body-3 mt-1 text-brand-gray-500">
          Set transfer fees for each branch pair. Currency:{" "}
          <span className="font-semibold text-brand-gray-700">{country.currencyCode}</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="body-3 text-brand-gray-400">
          No other branches found in {country.name}. Add more branches to configure one-way fees.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((row, idx) => (
            <div
              key={row.targetBranch.id}
              className="rounded-xl border border-brand-gray-100 bg-brand-gray-50 p-4"
            >
              {/* Branch pair header */}
              <div className="mb-3 flex items-center gap-2">
                <span className="body-3 font-semibold text-brand-gray-800">{currentBranch.name}</span>
                <ArrowLeftRight className="h-3.5 w-3.5 text-brand-gray-400" />
                <span className="body-3 font-semibold text-brand-gray-800">{row.targetBranch.name}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Forward fee: currentBranch → target */}
                <div className="flex flex-col gap-1">
                  <label className="body-3 text-brand-gray-600 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {currentBranch.name} → {row.targetBranch.name}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.forwardValue}
                      onChange={(e) => handleForwardChange(idx, e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-brand-gray-200 bg-white px-3 py-2 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent"
                    />
                    <span className="body-3 text-brand-gray-500 whitespace-nowrap">
                      {country.currencyCode}
                    </span>
                  </div>
                </div>

                {/* Reverse fee: target → currentBranch */}
                <div className="flex flex-col gap-1">
                  <label className="body-3 text-brand-gray-600 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 rotate-180" />
                    {row.targetBranch.name} → {currentBranch.name}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.reverseValue}
                      onChange={(e) => handleReverseChange(idx, e.target.value)}
                      disabled={row.reverseToggle}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-brand-gray-200 bg-white px-3 py-2 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent disabled:cursor-not-allowed disabled:bg-brand-gray-100 disabled:text-brand-gray-400"
                    />
                    <span className="body-3 text-brand-gray-500 whitespace-nowrap">
                      {country.currencyCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle reverse + Save */}
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Toggle
                    checked={row.reverseToggle}
                    onChange={(v) => handleToggleReverse(idx, v)}
                    size="sm"
                  />
                  <span className="body-3 text-brand-gray-600">Same fee both ways</span>
                </label>

                <button
                  onClick={() => handleSave(idx)}
                  disabled={row.isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red-200 px-3 py-1.5 body-3 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {row.isSaving ? (
                    <>
                      <Spinner className="size-3" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>

              {row.saveError && (
                <p className="mt-2 body-3 text-red-500">{row.saveError}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

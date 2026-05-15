"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/spinner"
import { Toggle } from "@/components/ui/Toggle"
import { ConfirmModal } from "@/components/admin/countries/ConfirmModal"
import { createCarAddon, deleteCarAddon, updateCarAddon } from "@/lib/api/car-addons"
import { carAddonFormSchema, type CarAddonFormValues } from "@/lib/validation/car-addon-form"
import type { CarAddon } from "@/types/car-addon"

interface CarAddonsPanelProps {
  carId: number
  token: string
  addons: CarAddon[]
  onAddonsChange: (next: CarAddon[]) => void
  onToast: (message: string, variant?: "success" | "error") => void
}

type AddonModalMode = "add" | "edit" | null

type FormErrors = Partial<Record<keyof CarAddonFormValues | "root", string>>

function AddonFormModal({
  title,
  initial,
  isOpen,
  isSaving,
  errorBanner,
  onClose,
  onSave,
}: {
  title: string
  initial: CarAddonFormValues | null
  isOpen: boolean
  isSaving: boolean
  errorBanner: string | null
  onClose: () => void
  onSave: (v: CarAddonFormValues) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [pricePerDay, setPricePerDay] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!isOpen) return
    if (initial) {
      setName(initial.name)
      setDescription(initial.description)
      setPricePerDay(String(initial.pricePerDay))
    } else {
      setName("")
      setDescription("")
      setPricePerDay("")
    }
    setErrors({})
  }, [isOpen, initial])

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const price = parseFloat(pricePerDay)
    const payload = {
      name: name.trim(),
      description: description.trim(),
      pricePerDay: price,
    }
    const parsed = carAddonFormSchema.safeParse(payload)
    if (!parsed.success) {
      const fe: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof CarAddonFormValues
        if (!fe[k]) fe[k] = issue.message
      }
      setErrors(fe)
      return
    }
    onSave(parsed.data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="headline-4 text-brand-gray-900">{title}</h3>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Addon name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`rounded-lg border px-3 py-2.5 body-3 ${
                errors.name ? "border-red-400" : "border-brand-gray-200"
              }`}
            />
            {errors.name && <p className="body-3 text-red-500">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={300}
              className={`resize-none rounded-lg border px-3 py-2.5 body-3 ${
                errors.description ? "border-red-400" : "border-brand-gray-200"
              }`}
            />
            <p className="body-3 text-brand-gray-400">{description.length} / 300</p>
            {errors.description && (
              <p className="body-3 text-red-500">{errors.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Price / day</label>
            <input
              type="text"
              inputMode="decimal"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className={`rounded-lg border px-3 py-2.5 body-3 ${
                errors.pricePerDay ? "border-red-400" : "border-brand-gray-200"
              }`}
            />
            {errors.pricePerDay && (
              <p className="body-3 text-red-500">{errors.pricePerDay}</p>
            )}
          </div>
          {errorBanner && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 body-3 text-red-600">
              {errorBanner}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Saving…
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CarAddonsPanel({
  carId,
  token,
  addons,
  onAddonsChange,
  onToast,
}: CarAddonsPanelProps) {
  const [modalMode, setModalMode] = useState<AddonModalMode>(null)
  const [editingAddon, setEditingAddon] = useState<CarAddon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CarAddon | null>(null)
  const [isSavingAddon, setIsSavingAddon] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [addonFormError, setAddonFormError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const formInitial: CarAddonFormValues | null =
    modalMode === "edit" && editingAddon
      ? {
          name: editingAddon.name,
          description: editingAddon.description ?? "",
          pricePerDay: parseFloat(editingAddon.pricePerDay),
        }
      : null

  function replaceAddon(updated: CarAddon) {
    onAddonsChange(addons.map((a) => (a.id === updated.id ? updated : a)))
  }

  async function handleToggleAvailable(addon: CarAddon) {
    setTogglingId(addon.id)
    try {
      const updated = await updateCarAddon(
        carId,
        addon.id,
        { isAvailable: !addon.isAvailable },
        token,
      )
      replaceAddon(updated)
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ?? "Failed to update addon."
        : "Failed to update addon."
      onToast(msg, "error")
    } finally {
      setTogglingId(null)
    }
  }

  async function handleSaveAddon(values: CarAddonFormValues) {
    setIsSavingAddon(true)
    setAddonFormError(null)
    try {
      if (modalMode === "add") {
        const created = await createCarAddon(
          carId,
          {
            name: values.name,
            description: values.description,
            pricePerDay: values.pricePerDay,
            isAvailable: true,
          },
          token,
        )
        onAddonsChange([...addons, created].sort((a, b) => a.name.localeCompare(b.name)))
        onToast("Addon added successfully", "success")
        setModalMode(null)
        return
      }
      if (modalMode === "edit" && editingAddon) {
        const updated = await updateCarAddon(
          carId,
          editingAddon.id,
          {
            name: values.name,
            description: values.description,
            pricePerDay: values.pricePerDay,
          },
          token,
        )
        replaceAddon(updated)
        onToast("Addon saved successfully", "success")
        setModalMode(null)
        setEditingAddon(null)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAddonFormError((err.response?.data?.message as string) ?? "Failed to save addon.")
      } else {
        setAddonFormError("Failed to save addon.")
      }
    } finally {
      setIsSavingAddon(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCarAddon(carId, deleteTarget.id, token)
      onAddonsChange(addons.filter((a) => a.id !== deleteTarget.id))
      onToast("Addon deleted successfully", "success")
      setDeleteTarget(null)
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ?? "Failed to delete addon."
        : "Failed to delete addon."
      onToast(msg, "error")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-brand-gray-100 bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="headline-3 text-brand-gray-900">Add-ons</h2>
          <p className="body-3 mt-1 text-brand-gray-500">
            Manage optional extras for this vehicle. Disabled addons are hidden from customers when
            booking.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setEditingAddon(null)
            setAddonFormError(null)
            setModalMode("add")
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Add-on
        </Button>
      </div>

      {addons.length === 0 ? (
        <p className="body-3 text-brand-gray-400">No add-ons yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-gray-100">
          <table className="min-w-full divide-y divide-brand-gray-100">
            <thead className="bg-brand-gray-50">
              <tr>
                {["Name", "Price / day", "Available", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left body-3 font-semibold text-brand-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-100">
              {addons.map((addon) => (
                <tr key={addon.id} className="hover:bg-brand-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="body-3 font-medium text-brand-gray-900">{addon.name}</p>
                    {addon.description && (
                      <p className="body-3 mt-0.5 line-clamp-2 text-brand-gray-500">
                        {addon.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 body-3 text-brand-gray-800 whitespace-nowrap">
                    {addon.pricePerDay}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={addon.isAvailable}
                        disabled={togglingId === addon.id}
                        onChange={() => void handleToggleAvailable(addon)}
                      />
                      <span className="body-3 text-brand-gray-500">
                        {addon.isAvailable ? "On" : "Off"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        title="Edit"
                        className="rounded-lg p-2 text-brand-gray-500 transition-colors hover:bg-brand-gray-100 hover:text-brand-gray-900"
                        onClick={() => {
                          setEditingAddon(addon)
                          setAddonFormError(null)
                          setModalMode("edit")
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="rounded-lg p-2 text-brand-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        onClick={() => setDeleteTarget(addon)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddonFormModal
        title={modalMode === "edit" ? "Edit Add-on" : "Add Add-on"}
        initial={formInitial}
        isOpen={modalMode !== null}
        isSaving={isSavingAddon}
        errorBanner={addonFormError}
        onClose={() => {
          if (!isSavingAddon) {
            setModalMode(null)
            setEditingAddon(null)
            setAddonFormError(null)
          }
        }}
        onSave={handleSaveAddon}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Add-on"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  )
}

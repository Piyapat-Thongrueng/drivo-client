"use client"

import { useRef } from "react"
import Image from "next/image"
import type { PhotoAngle } from "@/types/handover"
import { PHOTO_ANGLES } from "@/types/handover"
import type { PhotoRecord } from "@/lib/pickup-wizard"
import { validateHandoverPhotoFile } from "@/lib/supabase/upload-handover-photo"

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: "Front",
  back: "Back",
  left: "Left",
  right: "Right",
}

const ANGLE_ICONS: Record<PhotoAngle, string> = {
  front: "⬆",
  back: "⬇",
  left: "⬅",
  right: "➡",
}

interface PhotoUploadGridProps {
  record: PhotoRecord
  onFileSelected: (angle: PhotoAngle, file: File, previewUrl: string) => void
  onSlotError: (angle: PhotoAngle, error: string) => void
  disabled?: boolean
}

export function PhotoUploadGrid({
  record,
  onFileSelected,
  onSlotError,
  disabled = false,
}: PhotoUploadGridProps): React.JSX.Element {
  const inputRefs = useRef<Partial<Record<PhotoAngle, HTMLInputElement | null>>>({})

  function handleChange(angle: PhotoAngle, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validateHandoverPhotoFile(file)
    if (err) {
      onSlotError(angle, err)
      e.target.value = ""
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onFileSelected(angle, file, previewUrl)
    e.target.value = ""
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {PHOTO_ANGLES.map((angle) => {
        const slot = record[angle]
        const hasImage = slot.previewUrl !== null || slot.uploaded !== null
        const imgSrc = slot.previewUrl ?? slot.uploaded?.url

        return (
          <div key={angle} className="flex flex-col gap-1">
            {/* Click target */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && inputRefs.current[angle]?.click()}
              className={[
                "relative flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 transition",
                hasImage
                  ? "border-brand-green-400 bg-brand-gray-50"
                  : "border-dashed border-brand-gray-300 bg-brand-gray-50 hover:border-brand-red-200",
                slot.error ? "border-red-400 bg-red-50" : "",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`Upload ${ANGLE_LABELS[angle]} photo`}
            >
              {hasImage && imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={`${angle} view`}
                  fill
                  className="rounded-xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-brand-gray-400">
                  <span className="text-2xl">{ANGLE_ICONS[angle]}</span>
                  <span className="body-3 text-center text-xs">
                    {ANGLE_LABELS[angle]}
                    <br />
                    Tap to upload
                  </span>
                </div>
              )}

              {/* Change overlay when photo exists */}
              {hasImage && (
                <div className="absolute inset-0 flex items-end justify-end rounded-xl p-1.5">
                  <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                    Change
                  </span>
                </div>
              )}
            </button>

            {/* Angle label */}
            <p className="body-3 text-center text-xs text-brand-gray-500">
              {ANGLE_ICONS[angle]} {ANGLE_LABELS[angle]}
            </p>

            {/* Per-slot error */}
            {slot.error && (
              <p className="text-center text-xs text-red-500">{slot.error}</p>
            )}

            {/* Hidden file input */}
            <input
              ref={(el) => {
                inputRefs.current[angle] = el
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleChange(angle, e)}
              disabled={disabled}
            />
          </div>
        )
      })}
    </div>
  )
}

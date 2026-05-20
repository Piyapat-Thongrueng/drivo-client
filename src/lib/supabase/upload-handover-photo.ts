import type { PhotoAngle, HandoverType } from "@/types/handover"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const BUCKET = "handover-photos"
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export function validateHandoverPhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Please use JPG, PNG, or WEBP only."
  }
  if (file.size > MAX_BYTES) {
    return "Photo must be 10MB or smaller."
  }
  return null
}

export interface UploadedHandoverPhoto {
  storagePath: string
  url: string
}

/**
 * อัปโหลดรูปรถไปที่ Supabase Storage bucket `handover-photos`
 * path: bookings/{bookingId}/{pickup|return}/{angle}/{uuid}.{ext}
 */
export async function uploadHandoverPhoto(
  file: File,
  bookingId: number,
  handoverType: HandoverType,
  angle: PhotoAngle,
): Promise<UploadedHandoverPhoto> {
  const err = validateHandoverPhotoFile(file)
  if (err) throw new Error(err)

  const supabase = getSupabaseBrowserClient()
  const ext = file.name.split(".").pop()?.toLowerCase()
  const safeExt =
    ext === "jpg" || ext === "jpeg"
      ? "jpg"
      : ext === "png"
        ? "png"
        : ext === "webp"
          ? "webp"
          : "jpg"

  const storagePath = `bookings/${bookingId}/${handoverType}/${angle}/${crypto.randomUUID()}.${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    throw new Error(uploadError.message || "Photo upload failed")
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return { storagePath, url: data.publicUrl }
}

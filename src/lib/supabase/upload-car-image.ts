import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const BUCKET = "car-images"
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export function validateCarImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Please use JPG, PNG, or WEBP only."
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 5MB or smaller."
  }
  return null
}

/** อัปโหลดไป Supabase Storage bucket `car-images` แล้วคืน public URL */
export async function uploadCarImage(file: File): Promise<string> {
  const err = validateCarImageFile(file)
  if (err) throw new Error(err)

  const supabase = getSupabaseBrowserClient()
  const ext = file.name.split(".").pop()?.toLowerCase()
  const safeExt =
    ext === "jpg" || ext === "jpeg" ? "jpg" : ext === "png" ? "png" : ext === "webp" ? "webp" : "jpg"
  const path = `uploads/${crypto.randomUUID()}.${safeExt}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })

  if (uploadError) {
    throw new Error(uploadError.message || "Upload failed")
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

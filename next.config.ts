import type { NextConfig } from "next";

// ดึง hostname จาก Supabase URL สำหรับ next/image (รูปรถใน CarCard)
function getSupabaseImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return [];

  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSupabaseImagePatterns(),
  },
};

export default nextConfig;

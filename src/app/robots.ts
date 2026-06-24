import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/academy/my-courses/", "/academy/bookings/", "/academy/profile/"] },
    sitemap: `${process.env.NEXT_PUBLIC_URL || "https://bashar-academy.vercel.app"}/sitemap.xml`,
  };
}

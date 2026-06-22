import { ImageResponse } from "next/og";
import { pwaIconElement } from "@/lib/pwa-icon";

export async function GET() {
  return new ImageResponse(pwaIconElement(96), { width: 192, height: 192 });
}

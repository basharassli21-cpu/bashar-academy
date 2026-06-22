import { ImageResponse } from "next/og";
import { pwaIconElement } from "@/lib/pwa-icon";

export async function GET() {
  return new ImageResponse(pwaIconElement(256), { width: 512, height: 512 });
}

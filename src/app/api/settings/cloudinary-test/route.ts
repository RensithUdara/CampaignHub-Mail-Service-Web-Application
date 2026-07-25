import { NextResponse } from "next/server";
import { testCloudinaryConnection } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST() {
  const result = await testCloudinaryConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}

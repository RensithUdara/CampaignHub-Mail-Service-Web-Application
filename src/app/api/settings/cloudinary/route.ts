import { NextRequest, NextResponse } from "next/server";
import {
  getSmtpStatus,
  getCloudinaryStatus,
  saveCloudinaryCredentials,
  clearCloudinaryCredentials,
} from "@/lib/settings";

export const runtime = "nodejs";

async function fullStatus() {
  const [smtp, cloudinary] = await Promise.all([getSmtpStatus(), getCloudinaryStatus()]);
  return {
    ...smtp,
    ...cloudinary,
    mongoConfigured: Boolean(process.env.MONGODB_URI),
  };
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const cloudName = typeof body?.cloudName === "string" ? body.cloudName.trim() : "";
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
  const apiSecret = typeof body?.apiSecret === "string" ? body.apiSecret.trim() : "";

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloud Name, API Key and API Secret are all required." },
      { status: 400 }
    );
  }

  await saveCloudinaryCredentials(cloudName, apiKey, apiSecret);
  return NextResponse.json(await fullStatus());
}

export async function DELETE() {
  await clearCloudinaryCredentials();
  return NextResponse.json(await fullStatus());
}

import { NextRequest, NextResponse } from "next/server";
import {
  getSmtpStatus,
  saveSmtpCredentials,
  clearSmtpCredentials,
  getCloudinaryStatus,
} from "@/lib/settings";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";

async function fullStatus() {
  const [smtp, cloudinary] = await Promise.all([getSmtpStatus(), getCloudinaryStatus()]);
  return {
    ...smtp,
    ...cloudinary,
    mongoConfigured: Boolean(process.env.MONGODB_URI),
  };
}

export async function GET() {
  return NextResponse.json(await fullStatus());
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const smtpEmail = typeof body?.smtpEmail === "string" ? body.smtpEmail.trim() : "";
  const smtpAppPassword =
    typeof body?.smtpAppPassword === "string" ? body.smtpAppPassword.trim() : "";

  if (!smtpEmail || !isValidEmail(smtpEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!smtpAppPassword) {
    return NextResponse.json({ error: "Enter your Gmail App Password." }, { status: 400 });
  }

  await saveSmtpCredentials(smtpEmail, smtpAppPassword);
  return NextResponse.json(await fullStatus());
}

export async function DELETE() {
  await clearSmtpCredentials();
  return NextResponse.json(await fullStatus());
}

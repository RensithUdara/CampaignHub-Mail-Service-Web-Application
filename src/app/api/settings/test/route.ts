import { NextResponse } from "next/server";
import { testConnection } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST() {
  const result = await testConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}

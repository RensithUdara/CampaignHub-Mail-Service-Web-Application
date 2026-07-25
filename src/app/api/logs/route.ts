import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import EmailLog, { EmailStatus } from "@/models/EmailLog";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const status = request.nextUrl.searchParams.get("status");

    const filter: { status?: EmailStatus } =
      status && status !== "all" ? { status: status as EmailStatus } : {};

    const logs = await EmailLog.find(filter)
      .sort({ sentAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load logs" },
      { status: 500 }
    );
  }
}

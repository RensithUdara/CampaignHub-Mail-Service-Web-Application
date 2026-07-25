import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const log = await EmailLog.findById(params.id).lean();
    if (!log) {
      return NextResponse.json({ error: "Log not found." }, { status: 404 });
    }
    return NextResponse.json({ log });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load log" },
      { status: 500 }
    );
  }
}

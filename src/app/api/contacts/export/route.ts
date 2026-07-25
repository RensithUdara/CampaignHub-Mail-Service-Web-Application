import { NextResponse } from "next/server";
import { buildCsv } from "@/lib/csv";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function GET() {
  try {
    await connectToDatabase();
    const contacts = await Contact.find({}).sort({ name: 1 }).lean();
    const rows = [
      ["name", "email", "phone", "tags", "notes"],
      ...contacts.map((contact) => [
        contact.name,
        contact.email,
        contact.phone ?? "",
        contact.tags?.join("; ") ?? "",
        contact.notes ?? "",
      ]),
    ];

    return new NextResponse(buildCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="campaignhub-contacts.csv"',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to export contacts" },
      { status: 500 }
    );
  }
}

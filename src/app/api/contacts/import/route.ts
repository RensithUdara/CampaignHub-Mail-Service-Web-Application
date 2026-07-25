import { NextRequest, NextResponse } from "next/server";
import { parseCsv } from "@/lib/csv";
import { connectToDatabase } from "@/lib/mongodb";
import { isValidEmail } from "@/lib/validation";
import Contact from "@/models/Contact";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    const rows = parseCsv(await file.text());
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty." }, { status: 400 });
    }

    let skipped = 0;
    const operations = rows.flatMap((row) => {
      const name = row.name?.trim();
      const email = row.email?.trim().toLowerCase();

      if (!name || !email || !isValidEmail(email)) {
        skipped++;
        return [];
      }

      const tags = (row.tags || "")
        .split(/[;,]/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      return [
        {
          updateOne: {
            filter: { email },
            update: {
              $set: {
                name,
                email,
                phone: row.phone?.trim() || undefined,
                tags,
                notes: row.notes?.trim() || undefined,
              },
              $setOnInsert: { createdAt: new Date() },
            },
            upsert: true,
          },
        },
      ];
    });

    if (operations.length === 0) {
      return NextResponse.json(
        { error: "No valid contacts found in the CSV file.", skipped },
        { status: 400 }
      );
    }

    const result = await Contact.bulkWrite(operations, { ordered: false });

    return NextResponse.json({
      imported: result.upsertedCount + result.modifiedCount,
      created: result.upsertedCount,
      updated: result.modifiedCount,
      skipped,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to import contacts" },
      { status: 500 }
    );
  }
}

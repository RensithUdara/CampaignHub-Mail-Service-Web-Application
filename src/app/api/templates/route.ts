import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Template from "@/models/Template";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const q = request.nextUrl.searchParams.get("q")?.trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { subject: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};
    const templates = await Template.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ templates });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { name, subject, bodyHtml, category } = await request.json();

    if (!name?.trim() || !subject?.trim() || !bodyHtml?.trim() || bodyHtml === "<p></p>") {
      return NextResponse.json(
        { error: "Name, subject, and message are required." },
        { status: 400 }
      );
    }

    const template = await Template.create({
      name: name.trim(),
      subject: subject.trim(),
      bodyHtml,
      category: category?.trim() || undefined,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create template" },
      { status: 500 }
    );
  }
}

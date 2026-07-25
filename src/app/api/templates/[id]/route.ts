import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Template from "@/models/Template";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { name, subject, bodyHtml, category } = await request.json();

    if (!name?.trim() || !subject?.trim() || !bodyHtml?.trim() || bodyHtml === "<p></p>") {
      return NextResponse.json(
        { error: "Name, subject, and message are required." },
        { status: 400 }
      );
    }

    const template = await Template.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        subject: subject.trim(),
        bodyHtml,
        category: category?.trim() || undefined,
      },
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deleted = await Template.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete template" },
      { status: 500 }
    );
  }
}

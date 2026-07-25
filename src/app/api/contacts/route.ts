import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { isValidEmail } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const q = request.nextUrl.searchParams.get("q")?.trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const contacts = await Contact.find(filter).sort({ name: 1 }).lean();
    return NextResponse.json({ contacts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, phone, tags, notes } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const existing = await Contact.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "A contact with this email already exists." },
        { status: 409 }
      );
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      tags: Array.isArray(tags)
        ? tags.map((t: string) => t.trim()).filter(Boolean)
        : [],
      notes: notes?.trim() || undefined,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create contact" },
      { status: 500 }
    );
  }
}

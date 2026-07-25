import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Group from "@/models/Group";
import { isValidEmail } from "@/lib/validation";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const contact = await Contact.findById(params.id).lean();
    if (!contact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }
    return NextResponse.json({ contact });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load contact" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
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

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Contact.findOne({
      email: normalizedEmail,
      _id: { $ne: params.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A contact with this email already exists." },
        { status: 409 }
      );
    }

    const contact = await Contact.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || undefined,
        tags: Array.isArray(tags)
          ? tags.map((t: string) => t.trim()).filter(Boolean)
          : [],
        notes: notes?.trim() || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const contact = await Contact.findByIdAndDelete(params.id);
    if (!contact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }
    // Keep group membership consistent once a contact is removed.
    await Group.updateMany(
      { contactIds: params.id },
      { $pull: { contactIds: params.id } }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete contact" },
      { status: 500 }
    );
  }
}

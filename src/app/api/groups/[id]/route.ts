import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Group from "@/models/Group";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const group = await Group.findById(params.id)
      .populate("contactIds")
      .lean();
    if (!group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }
    return NextResponse.json({ group });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load group" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, description, contactIds } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Group name is required." },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {
      name: name.trim(),
      description: description?.trim() || undefined,
    };
    if (Array.isArray(contactIds)) {
      update.contactIds = contactIds;
    }

    const group = await Group.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    }).populate("contactIds");

    if (!group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update group" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const group = await Group.findByIdAndDelete(params.id);
    if (!group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete group" },
      { status: 500 }
    );
  }
}

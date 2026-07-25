import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Group from "@/models/Group";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { contactId } = await request.json();
    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required." },
        { status: 400 }
      );
    }

    const group = await Group.findByIdAndUpdate(
      params.id,
      { $addToSet: { contactIds: contactId } },
      { new: true }
    ).populate("contactIds");

    if (!group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { contactId } = await request.json();
    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required." },
        { status: 400 }
      );
    }

    const group = await Group.findByIdAndUpdate(
      params.id,
      { $pull: { contactIds: contactId } },
      { new: true }
    ).populate("contactIds");

    if (!group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to remove member" },
      { status: 500 }
    );
  }
}

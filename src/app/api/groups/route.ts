import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Group from "@/models/Group";

export async function GET() {
  try {
    await connectToDatabase();
    const groups = await Group.find().sort({ name: 1 }).lean();
    const withCounts = groups.map((g) => ({
      ...g,
      memberCount: g.contactIds?.length ?? 0,
    }));
    return NextResponse.json({ groups: withCounts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      contactIds: Array.isArray(contactIds) ? contactIds : [],
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create group" },
      { status: 500 }
    );
  }
}

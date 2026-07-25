import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import EmailLog from "@/models/EmailLog";
import Group from "@/models/Group";
import Template from "@/models/Template";

export async function GET() {
  try {
    await connectToDatabase();
    const [contacts, groups, templates, sent, partial, failed, recentLogs] =
      await Promise.all([
        Contact.countDocuments(),
        Group.countDocuments(),
        Template.countDocuments(),
        EmailLog.countDocuments({ status: "sent" }),
        EmailLog.countDocuments({ status: "partial" }),
        EmailLog.countDocuments({ status: "failed" }),
        EmailLog.find({})
          .sort({ sentAt: -1 })
          .limit(5)
          .select("subject recipients status sentAt")
          .lean(),
      ]);

    const totalSends = sent + partial + failed;
    const totalRecipients = recentLogs.reduce(
      (sum, log) => sum + (log.recipients?.length ?? 0),
      0
    );

    return NextResponse.json({
      stats: {
        contacts,
        groups,
        templates,
        totalSends,
        sent,
        partial,
        failed,
        recentRecipients: totalRecipients,
      },
      recentLogs,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load dashboard" },
      { status: 500 }
    );
  }
}

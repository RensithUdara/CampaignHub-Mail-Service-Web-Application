import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Group from "@/models/Group";
import EmailLog from "@/models/EmailLog";
import { sendEmail } from "@/lib/mailer";
import { uploadAttachment } from "@/lib/cloudinary";
import { dedupeEmails, isValidEmail } from "@/lib/validation";
import type { IEmailLogAttachment } from "@/models/EmailLog";

export const runtime = "nodejs";

function parseJsonArray(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await request.formData();

    const subject = String(formData.get("subject") ?? "").trim();
    const bodyHtml = String(formData.get("bodyHtml") ?? "");
    const useBcc = String(formData.get("useBcc") ?? "true") !== "false";

    const contactIds = parseJsonArray(formData.get("contactIds"));
    const groupIds = parseJsonArray(formData.get("groupIds"));
    const extraEmails = parseJsonArray(formData.get("extraEmails"));

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 }
      );
    }

    if (!bodyHtml || bodyHtml === "<p></p>") {
      return NextResponse.json(
        { error: "Email body cannot be empty." },
        { status: 400 }
      );
    }

    if (
      contactIds.length === 0 &&
      groupIds.length === 0 &&
      extraEmails.length === 0
    ) {
      return NextResponse.json(
        { error: "Select at least one recipient." },
        { status: 400 }
      );
    }

    // Server-side resolution of contacts + groups -> a flat list of emails.
    const emailSet = new Set<string>();

    if (contactIds.length > 0) {
      const contacts = await Contact.find({ _id: { $in: contactIds } }).lean();
      contacts.forEach((c) => emailSet.add(c.email));
    }

    if (groupIds.length > 0) {
      const groups = await Group.find({ _id: { $in: groupIds } })
        .populate("contactIds")
        .lean();
      groups.forEach((g) => {
        const members = (g.contactIds ?? []) as unknown as {
          email: string;
        }[];
        members.forEach((m) => m?.email && emailSet.add(m.email));
      });
    }

    extraEmails.forEach((e) => emailSet.add(e.trim().toLowerCase()));

    const recipients = dedupeEmails(Array.from(emailSet));
    const invalid = recipients.filter((e) => !isValidEmail(e));

    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid recipient email(s): ${invalid.join(", ")}` },
        { status: 400 }
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No valid recipients resolved." },
        { status: 400 }
      );
    }

    const files = formData.getAll("attachments") as File[];
    const attachments = await Promise.all(
      files
        .filter((f) => f instanceof File && f.size > 0)
        .map(async (f) => ({
          filename: f.name,
          content: Buffer.from(await f.arrayBuffer()),
          contentType: f.type || undefined,
        }))
    );

    const [result, uploadedAttachments] = await Promise.all([
      sendEmail({ subject, html: bodyHtml, recipients, useBcc, attachments }),
      Promise.all(
        attachments.map(async (a): Promise<IEmailLogAttachment> => {
          try {
            const uploaded = await uploadAttachment(a.filename, a.content, a.contentType);
            return uploaded;
          } catch (err) {
            return {
              name: a.filename,
              size: a.content.length,
              contentType: a.contentType,
              uploadError: err instanceof Error ? err.message : "Upload failed.",
            };
          }
        })
      ),
    ]);

    const log = await EmailLog.create({
      subject,
      bodyHtml,
      recipients,
      status: result.status,
      errorMessage: result.errorMessage,
      perRecipient: result.perRecipient,
      attachments: uploadedAttachments,
    });

    return NextResponse.json(
      { result, logId: log._id },
      { status: result.status === "failed" ? 502 : 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}

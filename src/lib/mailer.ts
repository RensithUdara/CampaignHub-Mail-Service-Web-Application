import nodemailer, { Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { getSmtpCredentials } from "@/lib/settings";

async function getCredentials() {
  const creds = await getSmtpCredentials();

  if (!creds) {
    throw new Error(
      "SMTP is not configured. Add your Gmail address and App Password in Settings."
    );
  }

  return creds;
}

async function getTransporter(): Promise<{ transporter: Transporter; user: string }> {
  const { user, pass } = await getCredentials();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return { transporter, user };
}

export type SendAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendEmailOptions = {
  subject: string;
  html: string;
  recipients: string[];
  /** When true (default) recipients are BCC'd on a single message; when false one message is sent per recipient. */
  useBcc?: boolean;
  attachments?: SendAttachment[];
};

export type SendEmailResult = {
  status: "sent" | "failed" | "partial";
  perRecipient: { email: string; success: boolean; error?: string }[];
  errorMessage?: string;
};

export async function sendEmail({
  subject,
  html,
  recipients,
  useBcc = true,
  attachments,
}: SendEmailOptions): Promise<SendEmailResult> {
  const { transporter, user } = await getTransporter();

  const mailAttachments: Mail.Attachment[] | undefined = attachments?.map(
    (a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })
  );

  if (useBcc) {
    try {
      await transporter.sendMail({
        from: user,
        to: user,
        bcc: recipients,
        subject,
        html,
        attachments: mailAttachments,
      });
      return {
        status: "sent",
        perRecipient: recipients.map((email) => ({ email, success: true })),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        status: "failed",
        perRecipient: recipients.map((email) => ({
          email,
          success: false,
          error: errorMessage,
        })),
        errorMessage,
      };
    }
  }

  const perRecipient: { email: string; success: boolean; error?: string }[] =
    [];

  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: user,
        to: email,
        subject,
        html,
        attachments: mailAttachments,
      });
      perRecipient.push({ email, success: true });
    } catch (err) {
      perRecipient.push({
        email,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const successCount = perRecipient.filter((r) => r.success).length;
  const status =
    successCount === perRecipient.length
      ? "sent"
      : successCount === 0
      ? "failed"
      : "partial";

  return { status, perRecipient };
}

export async function testConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { transporter, user } = await getTransporter();
    await transporter.verify();
    await transporter.sendMail({
      from: user,
      to: user,
      subject: "CampaignHub test connection",
      html: "<p>This is a test email confirming your SMTP settings are working.</p>",
    });
    return { success: true, message: `Test email sent to ${user}.` };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

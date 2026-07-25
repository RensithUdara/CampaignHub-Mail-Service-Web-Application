import mongoose, { Schema, models, model, Types } from "mongoose";

export type EmailStatus = "sent" | "failed" | "partial";

export interface IEmailLogAttachment {
  name: string;
  url?: string;
  size?: number;
  contentType?: string;
  uploadError?: string;
}

export interface IEmailLog {
  _id: Types.ObjectId;
  subject: string;
  bodyHtml: string;
  recipients: string[];
  status: EmailStatus;
  errorMessage?: string;
  perRecipient?: { email: string; success: boolean; error?: string }[];
  attachments?: IEmailLogAttachment[];
  sentAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>({
  subject: { type: String, required: true },
  bodyHtml: { type: String, required: true },
  recipients: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["sent", "failed", "partial"],
    required: true,
  },
  errorMessage: { type: String },
  perRecipient: [
    {
      email: String,
      success: Boolean,
      error: String,
      _id: false,
    },
  ],
  attachments: [
    {
      name: String,
      url: String,
      size: Number,
      contentType: String,
      uploadError: String,
      _id: false,
    },
  ],
  sentAt: { type: Date, default: Date.now },
});

export default (models.EmailLog as mongoose.Model<IEmailLog>) ||
  model<IEmailLog>("EmailLog", EmailLogSchema);

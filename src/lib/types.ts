export type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
};

export type Group = {
  _id: string;
  name: string;
  description?: string;
  contactIds: string[] | Contact[];
  memberCount?: number;
  createdAt: string;
};

export type EmailStatus = "sent" | "failed" | "partial";

export type PerRecipientResult = {
  email: string;
  success: boolean;
  error?: string;
};

export type EmailLogAttachment = {
  name: string;
  url?: string;
  size?: number;
  contentType?: string;
  uploadError?: string;
};

export type EmailLog = {
  _id: string;
  subject: string;
  bodyHtml: string;
  recipients: string[];
  status: EmailStatus;
  errorMessage?: string;
  perRecipient?: PerRecipientResult[];
  attachments?: EmailLogAttachment[];
  sentAt: string;
};

export type EmailTemplate = {
  _id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

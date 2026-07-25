import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export type SmtpCredentials = {
  user: string;
  pass: string;
};

/** DB-stored credentials take priority; falls back to env vars for backward compatibility. */
export async function getSmtpCredentials(): Promise<SmtpCredentials | null> {
  await connectToDatabase();
  const doc = await Settings.findOne({ key: "app" }).lean();

  if (doc?.smtpEmail && doc?.smtpAppPassword) {
    return { user: doc.smtpEmail, pass: doc.smtpAppPassword };
  }

  const envUser = process.env.SMTP_EMAIL;
  const envPass = process.env.SMTP_APP_PASSWORD;
  if (envUser && envPass) {
    return { user: envUser, pass: envPass };
  }

  return null;
}

export async function saveSmtpCredentials(
  smtpEmail: string,
  smtpAppPassword: string
): Promise<void> {
  await connectToDatabase();
  await Settings.findOneAndUpdate(
    { key: "app" },
    { smtpEmail, smtpAppPassword, updatedAt: new Date() },
    { upsert: true }
  );
}

export async function clearSmtpCredentials(): Promise<void> {
  await connectToDatabase();
  await Settings.findOneAndUpdate(
    { key: "app" },
    { $unset: { smtpEmail: "", smtpAppPassword: "" }, updatedAt: new Date() },
    { upsert: true }
  );
}

/** Public snapshot for the Settings page — never includes the password. */
export async function getSmtpStatus(): Promise<{
  smtpEmail: string | null;
  smtpConfigured: boolean;
}> {
  const creds = await getSmtpCredentials();
  return {
    smtpEmail: creds?.user ?? null,
    smtpConfigured: Boolean(creds),
  };
}

export type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

/** DB-stored credentials take priority; falls back to env vars for backward compatibility. */
export async function getCloudinaryCredentials(): Promise<CloudinaryCredentials | null> {
  await connectToDatabase();
  const doc = await Settings.findOne({ key: "app" }).lean();

  if (doc?.cloudinaryCloudName && doc?.cloudinaryApiKey && doc?.cloudinaryApiSecret) {
    return {
      cloudName: doc.cloudinaryCloudName,
      apiKey: doc.cloudinaryApiKey,
      apiSecret: doc.cloudinaryApiSecret,
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  return null;
}

export async function saveCloudinaryCredentials(
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<void> {
  await connectToDatabase();
  await Settings.findOneAndUpdate(
    { key: "app" },
    {
      cloudinaryCloudName: cloudName,
      cloudinaryApiKey: apiKey,
      cloudinaryApiSecret: apiSecret,
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}

export async function clearCloudinaryCredentials(): Promise<void> {
  await connectToDatabase();
  await Settings.findOneAndUpdate(
    { key: "app" },
    {
      $unset: {
        cloudinaryCloudName: "",
        cloudinaryApiKey: "",
        cloudinaryApiSecret: "",
      },
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}

/** Public snapshot for the Settings page — never includes the API secret. */
export async function getCloudinaryStatus(): Promise<{
  cloudinaryCloudName: string | null;
  cloudinaryConfigured: boolean;
}> {
  const creds = await getCloudinaryCredentials();
  return {
    cloudinaryCloudName: creds?.cloudName ?? null,
    cloudinaryConfigured: Boolean(creds),
  };
}

import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryCredentials } from "@/lib/settings";

async function getConfiguredClient() {
  const creds = await getCloudinaryCredentials();
  if (!creds) {
    throw new Error(
      "Cloudinary is not configured. Add your Cloud Name, API Key and API Secret in Settings."
    );
  }

  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });

  return cloudinary;
}

export type UploadedAttachment = {
  name: string;
  url: string;
  size: number;
  contentType?: string;
};

export async function uploadAttachment(
  filename: string,
  buffer: Buffer,
  contentType?: string
): Promise<UploadedAttachment> {
  const client = await getConfiguredClient();

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "campaignhub/attachments",
        use_filename: true,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return {
    name: filename,
    url: result.secure_url,
    size: buffer.length,
    contentType,
  };
}

export async function testCloudinaryConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const client = await getConfiguredClient();
    await client.api.ping();
    return { success: true, message: "Cloudinary connection verified." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

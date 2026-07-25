import mongoose, { Schema, models, model } from "mongoose";

export interface ISettings {
  key: string;
  smtpEmail?: string;
  smtpAppPassword?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  key: { type: String, required: true, unique: true, default: "app" },
  smtpEmail: { type: String, trim: true, lowercase: true },
  smtpAppPassword: { type: String, trim: true },
  cloudinaryCloudName: { type: String, trim: true },
  cloudinaryApiKey: { type: String, trim: true },
  cloudinaryApiSecret: { type: String, trim: true },
  updatedAt: { type: Date, default: Date.now },
});

export default (models.Settings as mongoose.Model<ISettings>) ||
  model<ISettings>("Settings", SettingsSchema);

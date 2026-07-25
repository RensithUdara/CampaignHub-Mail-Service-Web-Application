import mongoose, { Schema, models, model, Types } from "mongoose";

export interface ITemplate {
  _id: Types.ObjectId;
  name: string;
  subject: string;
  bodyHtml: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    bodyHtml: { type: String, required: true },
    category: { type: String, trim: true },
  },
  { timestamps: true }
);

export default (models.Template as mongoose.Model<ITemplate>) ||
  model<ITemplate>("Template", TemplateSchema);

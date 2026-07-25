import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IContact {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: { type: String, trim: true },
  tags: { type: [String], default: [] },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default (models.Contact as mongoose.Model<IContact>) ||
  model<IContact>("Contact", ContactSchema);

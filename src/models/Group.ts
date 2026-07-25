import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IGroup {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  contactIds: Types.ObjectId[];
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  contactIds: [{ type: Schema.Types.ObjectId, ref: "Contact" }],
  createdAt: { type: Date, default: Date.now },
});

export default (models.Group as mongoose.Model<IGroup>) ||
  model<IGroup>("Group", GroupSchema);

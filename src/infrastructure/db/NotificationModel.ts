import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDocument extends Document {
  to: string;
  subject: string;
  body: string;
  status: "pending" | "sent" | "failed";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    error: { type: String },
  },
  { timestamps: true },
);

export const NotificationModel = mongoose.model<INotificationDocument>(
  "Notification",
  NotificationSchema,
);

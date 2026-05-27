import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDocument extends Document {
  to: string;
  subject?: string;
  body: string;
  channel: "email" | "whatsapp" | "sms";
  status: "pending" | "sent" | "failed";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: false },
    body: { type: String, required: true },
    channel: {
      type: String,
      enum: ["email", "whatsapp", "sms"],
      required: true,
      default: "email",
    },
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

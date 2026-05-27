import { Notification } from "../../domain/entities/Notification";
import { INotificationRepository } from "../../domain/gateways/INotificationRepository";
import {
  NotificationModel,
  INotificationDocument,
} from "../db/NotificationModel";

export class MongooseNotificationRepository implements INotificationRepository {
  async save(notification: Notification): Promise<Notification> {
    const createdNotification = new NotificationModel(notification);
    const savedNotification = await createdNotification.save();
    return this.mapToDomain(savedNotification);
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await NotificationModel.findById(id);
    return notification ? this.mapToDomain(notification) : null;
  }

  async findAll(): Promise<Notification[]> {
    const notifications = await NotificationModel.find().sort({
      createdAt: -1,
    });
    return notifications.map(this.mapToDomain);
  }

  async update(
    id: string,
    notification: Partial<Notification>,
  ): Promise<Notification | null> {
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      id,
      { $set: notification },
      { new: true },
    );
    return updatedNotification ? this.mapToDomain(updatedNotification) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(id);
    return result !== null;
  }

  private mapToDomain(doc: INotificationDocument): Notification {
    return {
      id: doc._id.toString(),
      to: doc.to,
      subject: doc.subject,
      body: doc.body,
      channel: doc.channel,
      status: doc.status,
      error: doc.error,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

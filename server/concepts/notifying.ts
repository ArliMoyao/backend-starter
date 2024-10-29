import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";
export interface NotificationDoc extends BaseDoc {
  userId: ObjectId;
  message: string;
  read: boolean;
}


export default class NotifyingConcept {
    public readonly notifications: DocCollection<NotificationDoc>;
  
    constructor(collectionName: string) {
      this.notifications = new DocCollection<NotificationDoc>(collectionName);
    }
  
    async createNotification(userId: ObjectId, message: string) {
      const _id = await this.notifications.createOne({ userId, message, read: false });
      return { msg: "Notification successfully created!", notification: await this.notifications.readOne({ _id }) };
    }
  
    async getNotifications(userId: ObjectId) {
      const notifications = await this.notifications.readMany({ userId });
      return { msg: "Notifications retrieved successfully!", notifications };
    }
  
    async markAsRead(notificationId: ObjectId) {
      const result = await this.notifications.partialUpdateOne({ _id: notificationId }, { read: true });
      if (result.matchedCount === 0) {
        throw new NotFoundError(`Notification ${notificationId} does not exist!`);
      }
      return { msg: "Notification marked as read!" };
    }
  
    async deleteNotification(notificationId: ObjectId) {
      const result = await this.notifications.deleteOne({ _id: notificationId });
      if (result.deletedCount === 0) {
        throw new NotFoundError(`Notification ${notificationId} does not exist!`);
      }
      return { msg: "Notification successfully deleted!" };
    }
  }
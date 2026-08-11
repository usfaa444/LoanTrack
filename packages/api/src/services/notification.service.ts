import { FastifyInstance } from 'fastify';

/**
 * Create a notification for a user
 * @param app Fastify instance
 * @param userId User ID
 * @param type Notification type
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data payload
 * @returns Promise resolving to notification record
 */
export async function createNotification(
  app: FastifyInstance,
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: any
): Promise<any> {
  const notification = await app.db.notificationLog.create({
    data: {
      userId: userId,
      type: type,
      title: title,
      body: body,
      data: data,
      isRead: false,
      sentAt: new Date(),
      channel: 'IN_APP' // Default to in-app notification
    }
  });
  
  return notification;
}

/**
 * List notifications for a user
 * @param app Fastify instance
 * @param userId User ID
 * @param limit Number of notifications to return (default: 20)
 * @param offset Offset for pagination (default: 0)
 * @returns Promise resolving to array of notifications
 */
export async function listNotifications(
  app: FastifyInstance,
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  const notifications = await app.db.notificationLog.findMany({
    where: {
      userId: userId
    },
    orderBy: {
      sentAt: 'desc'
    },
    skip: offset,
    take: limit
  });
  
  return notifications;
}

/**
 * Mark a notification as read
 * @param app Fastify instance
 * @param notificationId Notification ID
 * @param userId User ID (for verification)
 * @returns Promise resolving to updated notification
 */
export async function markNotificationRead(
  app: FastifyInstance,
  notificationId: string,
  userId: string
): Promise<any> {
  const notification = await app.db.notificationLog.update({
    where: {
      id: notificationId,
      userId: userId
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });
  
  return notification;
}

/**
 * Mark all notifications as read for a user
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to count of updated notifications
 */
export async function markAllNotificationsRead(
  app: FastifyInstance,
  userId: string
): Promise<number> {
  const result = await app.db.notificationLog.updateMany({
    where: {
      userId: userId,
      isRead: false
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });
  
  return result.count;
}
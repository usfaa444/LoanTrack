import { PrismaClient } from '@prisma/client';

/**
 * Create a notification for a user
 * @param db Prisma client instance
 * @param userId User ID
 * @param type Notification type
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data payload
 * @returns Promise resolving to notification record
 */
export async function createNotification(
  db: PrismaClient,
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: any
): Promise<any> {
  const notification = await db.notificationLog.create({
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
 * @param db Prisma client instance
 * @param userId User ID
 * @param limit Number of notifications to return (default: 20)
 * @param offset Offset for pagination (default: 0)
 * @returns Promise resolving to array of notifications
 */
export async function listNotifications(
  db: PrismaClient,
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  const notifications = await db.notificationLog.findMany({
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
 * @param db Prisma client instance
 * @param notificationId Notification ID
 * @param userId User ID (for verification)
 * @returns Promise resolving to updated notification
 */
export async function markNotificationRead(
  db: PrismaClient,
  notificationId: string,
  userId: string
): Promise<any> {
  const notification = await db.notificationLog.update({
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
 * @param db Prisma client instance
 * @param userId User ID
 * @returns Promise resolving to count of updated notifications
 */
export async function markAllNotificationsRead(
  db: PrismaClient,
  userId: string
): Promise<number> {
  const result = await db.notificationLog.updateMany({
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
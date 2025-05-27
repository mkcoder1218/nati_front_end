import api from "@/lib/api";

export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  related_entity_type?: "review" | "office" | "service" | "user";
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}

class NotificationService {
  async getNotifications(
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      const response = await api.get(
        `/notifications?limit=${limit}&offset=${offset}`
      );
      return response.data.data.notifications || [];
    } catch (error) {
      console.warn("Error fetching notifications:", error);
      // Return empty array as a fallback to prevent UI errors
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data.data.count || 0;
    } catch (error) {
      console.warn("Error fetching unread notification count:", error);
      // Return 0 as a fallback to prevent UI errors
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.warn("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await api.patch("/notifications/read-all");
    } catch (error) {
      console.warn("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.warn("Error deleting notification:", error);
      throw error;
    }
  }

  async deleteAllNotifications(): Promise<void> {
    try {
      await api.delete("/notifications");
    } catch (error) {
      console.warn("Error deleting all notifications:", error);
      throw error;
    }
  }
}

export default new NotificationService();

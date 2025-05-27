"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Bell, Check, Info, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/store/slices/notificationSlice";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/translation-context";
import { formatDistanceToNow } from "date-fns";

function NotificationBellComponent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  // Fetch notifications when the component mounts
  useEffect(() => {
    if (user && user.user_id) {
      // Only fetch if we have a valid user with an ID
      dispatch(fetchUnreadCount())
        .unwrap()
        .catch((error) => {
          // Silently handle the error - we don't want to show errors for this in the UI
          console.log("Failed to fetch notification count:", error);
        });
    }
  }, [dispatch, user]);

  // Fetch notifications when the popover opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && user && user.user_id) {
      dispatch(fetchNotifications())
        .unwrap()
        .catch((error) => {
          // Silently handle the error - we don't want to show errors for this in the UI
          console.log("Failed to fetch notifications:", error);
        });
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId))
      .unwrap()
      .catch((error) => {
        console.log("Failed to mark notification as read:", error);
      });
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .catch((error) => {
        console.log("Failed to mark all notifications as read:", error);
      });
  };

  const handleDelete = (notificationId: string) => {
    dispatch(deleteNotification(notificationId))
      .unwrap()
      .catch((error) => {
        console.log("Failed to delete notification:", error);
      });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Info className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">{t("notifications")}</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              {t("mark_all_as_read")}
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>{t("no_notifications")}</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`relative border-b p-4 ${
                    !notification.is_read ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleMarkAsRead(notification.notification_id)
                              }
                            >
                              <Check className="h-3 w-3" />
                              <span className="sr-only">
                                {t("mark_as_read")}
                              </span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleDelete(notification.notification_id)
                            }
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">{t("delete")}</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export a version of the component that only renders on the client side
// This prevents hydration errors
export const NotificationBell = dynamic(
  () => Promise.resolve(NotificationBellComponent),
  {
    ssr: false,
  }
);

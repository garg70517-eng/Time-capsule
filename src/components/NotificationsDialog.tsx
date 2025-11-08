"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Clock, Users, Upload, Share2, Lock, Eye, Check, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  scheduledFor: string | null;
  capsuleId: string | null;
}

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function NotificationsDialog({ isOpen, onClose, onUpdate }: NotificationsDialogProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchNotifications();
    }
  }, [isOpen, session?.user?.id, filter]);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const filterParam = filter === "unread" ? "&isRead=false" : "";
      const res = await fetch(`/api/notifications?userId=${session.user.id}&limit=50${filterParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (res.ok) {
        toast.success("All notifications marked as read");
        fetchNotifications();
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success("Notification deleted");
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "unlock_reminder":
        return <Clock className="w-5 h-5 text-primary" />;
      case "unlock_ready":
        return <Eye className="w-5 h-5 text-green-500" />;
      case "collaborator_added":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "file_uploaded":
        return <Upload className="w-5 h-5 text-purple-500" />;
      case "capsule_shared":
        return <Share2 className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl glass-strong rounded-3xl border border-primary/25 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center box-glow">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 glass-subtle rounded-xl p-1 border border-primary/20">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === "all"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-primary/10"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === "unread"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-primary/10"
                  }`}
                >
                  Unread
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-smooth flex items-center gap-2 border border-primary/20"
                >
                  <Check className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent animate-spin border-4 border-transparent border-t-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === "unread" ? "You're all caught up!" : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass rounded-2xl p-4 group hover:scale-[1.02] transition-all border ${
                      notification.isRead ? "border-primary/10" : "border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 flex items-center justify-center flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Notification {
  id: number;
  userId: string;
  capsuleId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor: string | null;
  createdAt: string;
}

export const useUnlockNotifications = () => {
  const { data: session } = useSession();
  const [lastCheckedId, setLastCheckedId] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setHasPermission(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === "granted");
        });
      }
    }
  }, []);

  // Create notification sound using Web Audio API
  const playUnlockSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Create a pleasant chime sound
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 1);

      // Add a second layer for richness
      const oscillator2 = context.createOscillator();
      const gainNode2 = context.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(context.destination);

      oscillator2.type = "triangle";
      oscillator2.frequency.setValueAtTime(261.63, context.currentTime); // C4
      oscillator2.frequency.setValueAtTime(329.63, context.currentTime + 0.1); // E4
      oscillator2.frequency.setValueAtTime(392.00, context.currentTime + 0.2); // G4

      gainNode2.gain.setValueAtTime(0.2, context.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);

      oscillator2.start(context.currentTime);
      oscillator2.stop(context.currentTime + 1);

      // Vibrate if supported
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (notification: Notification) => {
    if (!hasPermission || !("Notification" in window)) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: `capsule-unlock-${notification.capsuleId}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 400],
      data: {
        capsuleId: notification.capsuleId,
        notificationId: notification.id,
      },
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.capsuleId) {
        window.location.href = `/capsules/${notification.capsuleId}`;
      }
      browserNotification.close();
    };
  };

  // Check for new unlock notifications
  const checkForUnlocks = async () => {
    if (!session?.user?.id) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(
        `/api/notifications?userId=${session.user.id}&limit=10&offset=0&isRead=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const notifications: Notification[] = await res.json();
        const unlockNotifications = notifications.filter(
          (n) => n.type === "capsule_unlocked" && n.id > lastCheckedId
        );

        if (unlockNotifications.length > 0) {
          // Update last checked ID
          const maxId = Math.max(...unlockNotifications.map((n) => n.id));
          setLastCheckedId(maxId);

          // Play sound and show notifications for each unlock
          for (const notification of unlockNotifications) {
            playUnlockSound();
            showBrowserNotification(notification);

            // Show toast notification as well
            toast.success(notification.title, {
              description: notification.message,
              duration: 10000,
              action: notification.capsuleId
                ? {
                    label: "View Capsule",
                    onClick: () => {
                      window.location.href = `/capsules/${notification.capsuleId}`;
                    },
                  }
                : undefined,
            });

            // Small delay between multiple notifications
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
    } catch (error) {
      console.error("Failed to check for unlock notifications:", error);
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    if (!session?.user?.id) return;

    // Check immediately on mount
    checkForUnlocks();

    // Then check every 30 seconds
    const interval = setInterval(checkForUnlocks, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id, lastCheckedId]);

  return {
    hasPermission,
    requestPermission: () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === "granted");
          if (permission === "granted") {
            toast.success("Notifications enabled", {
              description: "You'll be notified when capsules unlock",
            });
          }
        });
      }
    },
  };
};
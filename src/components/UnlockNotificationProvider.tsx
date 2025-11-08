"use client";

import { useUnlockNotifications } from "@/hooks/useUnlockNotifications";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export const UnlockNotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();
  const { hasPermission, requestPermission } = useUnlockNotifications();

  // Show permission prompt once user is logged in
  useEffect(() => {
    if (session?.user && !hasPermission && typeof window !== "undefined") {
      const hasAsked = localStorage.getItem("notification-permission-asked");
      
      if (!hasAsked && "Notification" in window && Notification.permission === "default") {
        // Wait a bit before asking (better UX)
        const timer = setTimeout(() => {
          toast.info("Enable Notifications", {
            description: "Get notified when your time capsules unlock",
            duration: 10000,
            action: {
              label: "Enable",
              onClick: () => {
                requestPermission();
                localStorage.setItem("notification-permission-asked", "true");
              },
            },
          });
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [session, hasPermission, requestPermission]);

  return <>{children}</>;
};
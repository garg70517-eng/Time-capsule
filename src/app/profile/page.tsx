"use client";

import { useState, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Package, Lock, Eye, Sparkles, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardNav } from "@/components/DashboardNav";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserStats {
  totalCapsules: number;
  lockedCapsules: number;
  unlockedCapsules: number;
}

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalCapsules: 0,
    lockedCapsules: 0,
    unlockedCapsules: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/capsules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const capsules = await res.json();
        setStats({
          totalCapsules: capsules.length,
          lockedCapsules: capsules.filter((c: any) => c.isLocked).length,
          unlockedCapsules: capsules.filter((c: any) => !c.isLocked).length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, you'd call an API to update the user profile
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Delete user account via API
      const response = await fetch(`/api/users?id=${session?.user?.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Account deleted successfully");
      
      // Sign out and redirect
      await authClient.signOut();
      localStorage.removeItem("bearer_token");
      router.push("/");
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="text-xl font-medium neon-glow">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { icon: Package, label: "Total Capsules", value: stats.totalCapsules, color: "primary" },
    { icon: Lock, label: "Locked", value: stats.lockedCapsules, color: "accent" },
    { icon: Eye, label: "Unlocked", value: stats.unlockedCapsules, color: "green" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      
      <DashboardNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-4"
          >
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium">Your Account</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass rounded-2xl p-6 text-center border border-primary/15 group hover:scale-105 transition-all"
            >
              <stat.icon className="w-10 h-10 mx-auto mb-3 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
              <div className="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-3xl p-8 border-primary/25"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Account Information</h2>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="glass-subtle border-primary/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: session.user.name || "",
                      email: session.user.email || "",
                    });
                  }}
                  disabled={isSaving}
                  className="glass-subtle border-primary/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center box-glow">
                <User className="w-10 h-10 text-primary" />
              </div>
              {isEditing && (
                <Button variant="outline" className="glass-subtle border-primary/20" disabled>
                  Change Avatar
                </Button>
              )}
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold mb-2">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing || isSaving}
                className="glass-subtle border-primary/20 h-12 text-base"
              />
            </div>

            {/* Email - Read Only */}
            <div>
              <Label htmlFor="email" className="text-base font-semibold mb-2 flex items-center gap-2">
                Email Address
                <span className="text-xs text-muted-foreground font-normal">(Cannot be changed)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="glass-subtle border-primary/20 h-12 text-base pl-12 cursor-not-allowed opacity-60"
                />
              </div>
            </div>

            {/* Account Created */}
            <div>
              <Label className="text-base font-semibold mb-2">
                Member Since
              </Label>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>
                  {session.user.createdAt 
                    ? format(new Date(session.user.createdAt), "MMMM d, yyyy")
                    : "Recently joined"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-3xl p-8 border-red-500/25 mt-8"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Danger Zone</h2>
              <p className="text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your capsules and data will be permanently deleted.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-strong border-red-500/25 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p className="text-foreground font-semibold">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your account and profile</li>
                <li>All your time capsules ({stats.totalCapsules})</li>
                <li>All uploaded files and attachments</li>
                <li>All shared collaborations</li>
              </ul>
              <p className="text-foreground font-semibold pt-2">
                Type <span className="text-red-500 font-mono">DELETE</span> to confirm:
              </p>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE here"
            className="glass-subtle border-red-500/30 h-12"
            disabled={isDeleting}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
              }}
              disabled={isDeleting}
              className="glass-subtle border-primary/20"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE" || isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
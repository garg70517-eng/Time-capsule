"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Shield, Users, Eye, Edit } from "lucide-react";
import { toast } from "sonner";

interface CollaboratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  capsuleId: number;
}

export function CollaboratorDialog({
  isOpen,
  onClose,
  onSuccess,
  capsuleId,
}: CollaboratorDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // First, find the user by email
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userResponse.ok) {
        toast.error("User not found. They need to create an account first.");
        return;
      }

      const users = await userResponse.json();
      if (!users || users.length === 0) {
        toast.error("User not found. They need to create an account first.");
        return;
      }

      const user = users[0];

      // Add collaborator
      const response = await fetch("/api/capsule-collaborators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          capsuleId,
          userId: user.id,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add collaborator");
      }

      toast.success(`${email} added as ${role}`);
      setEmail("");
      setRole("viewer");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add collaborator");
      console.error("Error adding collaborator:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/20 rounded-3xl shadow-2xl"
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl" />

          <div className="relative p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Invite Collaborator</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Share this capsule with others and choose their permission level
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collaborator@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-white/20 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Permission Level
                </label>
                <div className="space-y-3">
                  {/* Viewer Option */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      role === "viewer"
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/20 backdrop-blur-xl bg-white/50 dark:bg-white/5 hover:border-purple-500/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="viewer"
                      checked={role === "viewer"}
                      onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
                      className="mt-1"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Viewer</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Can view files and comments but cannot edit or add content
                      </p>
                    </div>
                  </label>

                  {/* Editor Option */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      role === "editor"
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/20 backdrop-blur-xl bg-white/50 dark:bg-white/5 hover:border-purple-500/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="editor"
                      checked={role === "editor"}
                      onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
                      className="mt-1"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Edit className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Editor</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Can add files, edit content, and manage collaborators
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 font-medium hover:bg-white/70 dark:hover:bg-white/10 transition-all"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    "Inviting..."
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
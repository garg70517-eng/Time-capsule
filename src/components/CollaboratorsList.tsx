"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Eye, Edit, Trash2, Crown } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: number;
  userId: string;
  role: string;
  addedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface CollaboratorsListProps {
  capsuleId: number;
  ownerId: string;
  currentUserId: string;
  onUpdate: () => void;
}

export function CollaboratorsList({
  capsuleId,
  ownerId,
  currentUserId,
  onUpdate,
}: CollaboratorsListProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, [capsuleId]);

  const fetchCollaborators = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/capsule-collaborators?capsuleId=${capsuleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: number) => {
    if (!confirm("Are you sure you want to remove this collaborator?")) {
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/capsule-collaborators/${collaboratorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Collaborator removed");
        fetchCollaborators();
        onUpdate();
      } else {
        throw new Error("Failed to remove collaborator");
      }
    } catch (error) {
      toast.error("Failed to remove collaborator");
      console.error("Error removing collaborator:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "editor") return <Edit className="w-4 h-4 text-purple-500" />;
    return <Eye className="w-4 h-4 text-blue-500" />;
  };

  const getRoleBadge = (role: string) => {
    if (role === "editor") {
      return (
        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
          Editor
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
        Viewer
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isOwner = currentUserId === ownerId;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">
          Collaborators ({collaborators.length})
        </h3>
      </div>

      {collaborators.length === 0 ? (
        <div className="text-center py-8 backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No collaborators yet. Invite someone to start sharing!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collaborator, index) => (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 rounded-xl hover:bg-white/70 dark:hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {collaborator.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{collaborator.user?.name || "Unknown User"}</p>
                    {collaborator.userId === ownerId && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                        <Crown className="w-3 h-3" />
                        <span className="text-xs font-medium">Owner</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.user?.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getRoleBadge(collaborator.role)}
                
                {isOwner && collaborator.userId !== ownerId && (
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors"
                    title="Remove collaborator"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
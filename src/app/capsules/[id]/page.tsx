"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Lock,
  Eye,
  Upload,
  ArrowLeft,
  Users,
  Share2,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  QrCode,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardNav } from "@/components/DashboardNav";
import { CollaboratorDialog } from "@/components/CollaboratorDialog";
import { CollaboratorsList } from "@/components/CollaboratorsList";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Capsule {
  id: string;
  title: string;
  description: string | null;
  unlockDate: string;
  isLocked: boolean;
  isEmergencyAccessible: boolean;
  createdAt: string;
  userId: string;
}

interface CapsuleFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

// Helper function to safely format dates
const formatDate = (dateString: string | null | undefined, formatString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return format(date, formatString);
};

export default function CapsuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [files, setFiles] = useState<CapsuleFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [showCollaboratorsList, setShowCollaboratorsList] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const capsuleId = params.id as string;

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/login?redirect=/capsules/${capsuleId}`);
    }
  }, [session, isPending, router, capsuleId]);

  useEffect(() => {
    if (session?.user) {
      fetchCapsuleDetails();
    }
  }, [session, capsuleId]);

  // Auto-refetch data every 30 seconds to ensure accuracy
  useEffect(() => {
    if (!session?.user) return;
    
    const intervalId = setInterval(() => {
      fetchCapsuleDetails();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [session, capsuleId]);

  // Check for unlock status transition more frequently
  useEffect(() => {
    if (!session?.user || !capsule) return;
    
    const isCurrentlyUnlocked = isPast(new Date(capsule.unlockDate));
    
    // If capsule is locked, check every 5 seconds near unlock time
    if (!isCurrentlyUnlocked) {
      const unlockDate = new Date(capsule.unlockDate);
      const now = new Date();
      const timeUntilUnlock = unlockDate.getTime() - now.getTime();
      
      // If unlock is within 5 minutes, check more frequently
      if (timeUntilUnlock > 0 && timeUntilUnlock < 5 * 60 * 1000) {
        const checkInterval = setInterval(() => {
          const nowCheck = new Date();
          if (isPast(new Date(capsule.unlockDate))) {
            // Capsule just unlocked! Refetch immediately
            fetchCapsuleDetails();
            toast.success("🎉 Your capsule has been unlocked!");
          }
        }, 5000); // Check every 5 seconds when close to unlock

        return () => clearInterval(checkInterval);
      }
    }
  }, [session, capsule, capsuleId]);

  const fetchCapsuleDetails = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const [capsuleRes, filesRes] = await Promise.all([
        fetch(`/api/capsules/${capsuleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/capsule-files?capsuleId=${capsuleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (capsuleRes.ok) {
        const capsuleData = await capsuleRes.json();
        setCapsule(capsuleData);
      } else {
        const errorData = await capsuleRes.json();
        if (capsuleRes.status === 404) {
          toast.error("Capsule not found");
          router.push("/my-capsules");
        } else if (capsuleRes.status === 403) {
          toast.error("You don't have access to this capsule");
          router.push("/my-capsules");
        }
      }

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData);
      }
    } catch (error) {
      console.error("Error fetching capsule details:", error);
      toast.error("Failed to load capsule details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate user session before uploading
    if (!session?.user?.id) {
      toast.error("User session not found. Please log in again.");
      router.push(`/login?redirect=/capsules/${capsuleId}`);
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      for (const file of Array.from(selectedFiles)) {
        const fileData = {
          capsuleId: capsuleId,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          fileUrl: `https://placeholder.com/${file.name}`,
          uploadedBy: session.user.id.trim(),
        };

        const response = await fetch("/api/capsule-files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(fileData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Upload error:", errorData);
          toast.error(errorData.error || `Failed to upload ${file.name}`);
          continue;
        }
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
      await fetchCapsuleDetails();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCollaboratorSuccess = () => {
    // Refetch to ensure data accuracy
    fetchCapsuleDetails();
  };

  const handleDeleteCapsule = async () => {
    if (!capsule) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/capsules/${capsule.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Capsule deleted successfully");
        router.push("/my-capsules");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to delete capsule");
      }
    } catch (error) {
      console.error("Error deleting capsule:", error);
      toast.error("Failed to delete capsule");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isPending || !session || isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mx-auto mb-6 box-glow animate-pulse">
            <Clock className="h-8 w-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
          </div>
          <div className="text-xl font-medium neon-glow">Loading capsule...</div>
        </motion.div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-12 text-center border-primary/25 max-w-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-accent/12 to-periwinkle/10 opacity-70" />
          <div className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mx-auto mb-6 box-glow">
              <Lock className="h-8 w-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Capsule Not Found
            </h2>
            <p className="text-muted-foreground mb-8">
              The capsule you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary via-accent/90 to-accent text-white font-medium box-glow transition-smooth inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const isUnlocked = isPast(new Date(capsule.unlockDate));

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-periwinkle/20 rounded-full blur-[150px] animate-pulse delay-500" style={{ '--tw-gradient-from': 'oklch(0.65 0.14 260 / 0.2)' } as any} />
      
      <DashboardNav />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary mb-8 transition-smooth glass-subtle rounded-full px-5 py-2.5 border border-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Capsule Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 md:p-10 mb-8 border border-primary/15 relative overflow-hidden group"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/8 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-5 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary via-accent/90 to-accent flex items-center justify-center box-glow shadow-2xl"
                  >
                    {isUnlocked ? (
                      <Eye className="w-10 h-10 text-white drop-shadow-lg" />
                    ) : (
                      <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                    )}
                  </motion.div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
                      {capsule.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-medium glass-subtle rounded-full px-4 py-2 border border-primary/20 inline-flex">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {isUnlocked ? "Unlocked" : "Unlocks"} on{" "}
                        {formatDate(capsule.unlockDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {capsule.description && (
                  <p className="text-muted-foreground leading-relaxed max-w-2xl text-base">
                    {capsule.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                {isUnlocked ? (
                  <div className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-2 backdrop-blur-xl shadow-lg">
                    <Eye className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-sm text-green-300 font-semibold">Unlocked</span>
                  </div>
                ) : (
                  <div className="px-6 py-3 rounded-full glass-subtle border border-primary/30 flex items-center gap-2 box-glow">
                    <Lock className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(135,100,210,0.6)]" />
                    <span className="text-sm font-semibold neon-glow">Locked</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex-1 min-w-[200px] cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary via-accent/90 to-accent text-white font-semibold hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth text-center shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    {isUploading ? "Uploading..." : "Upload Files"}
                  </div>
                </motion.div>
              </label>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowCollaboratorDialog(true)}
                  variant="outline"
                  className="glass-subtle hover:glass border-primary/30 transition-smooth font-semibold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowCollaboratorsList(!showCollaboratorsList)}
                  variant="outline"
                  className="glass-subtle hover:glass border-primary/30 transition-smooth font-semibold"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Collaborators
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowQRGenerator(true)}
                  className="bg-gradient-to-r from-red-600 via-orange-600 to-orange-500 hover:from-red-700 hover:via-orange-700 hover:to-orange-600 font-semibold shadow-xl transition-smooth"
                  style={{ boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)" }}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Emergency QR
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  className="glass-subtle hover:glass border-red-500/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-smooth font-semibold"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Collaborators List Section */}
        {showCollaboratorsList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 mb-8 border border-primary/15"
          >
            <CollaboratorsList
              capsuleId={parseInt(capsuleId)}
              ownerId={capsule?.userId || ""}
              currentUserId={session?.user.id || ""}
              onUpdate={handleCollaboratorSuccess}
            />
          </motion.div>
        )}

        {/* Files Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center box-glow"
            >
              <Sparkles className="h-6 w-6 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Files & Memories
            </h2>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="px-4 py-1.5 rounded-full glass-subtle text-sm font-semibold border border-primary/30 box-glow"
            >
              {files.length}
            </motion.span>
          </div>

          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-strong rounded-3xl p-12 md:p-20 text-center border-primary/25 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-accent/12 to-periwinkle/10 opacity-70" />
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mx-auto mb-8 box-glow shadow-2xl">
                    <Upload className="h-12 w-12 text-primary drop-shadow-[0_0_20px_rgba(135,100,210,0.9)]" />
                  </div>
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  No Files Yet
                </h3>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg leading-relaxed">
                  Start preserving your precious memories. Upload photos, videos, documents, and more.
                </p>
                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 rounded-xl bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 text-white font-semibold box-glow transition-smooth inline-flex items-center gap-3 text-lg shadow-2xl"
                  >
                    <Upload className="w-6 h-6" />
                    Upload Your First Files
                  </motion.span>
                </label>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass rounded-2xl p-6 group cursor-pointer border border-primary/15 hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white box-glow shadow-xl"
                      >
                        {getFileIcon(file.fileType)}
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <h3 className="font-semibold mb-2 truncate text-foreground group-hover:text-primary transition-colors">
                      {file.fileName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatFileSize(file.fileSize)} •{" "}
                      {formatDate(file.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Collaborator Dialog */}
      <CollaboratorDialog
        isOpen={showCollaboratorDialog}
        onClose={() => setShowCollaboratorDialog(false)}
        onSuccess={handleCollaboratorSuccess}
        capsuleId={parseInt(capsuleId)}
      />

      {/* QR Code Generator */}
      <QRCodeGenerator
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
        capsuleId={parseInt(capsuleId)}
        capsuleTitle={capsule?.title || ""}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-strong border-red-500/25 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Delete Capsule
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p className="text-foreground font-semibold">
                Are you sure you want to delete "{capsule?.title}"?
              </p>
              <p className="text-muted-foreground">
                This action cannot be undone. This will permanently delete the capsule and all its contents including uploaded files, collaborators, and activities.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="glass-subtle border-primary/20"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCapsule}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Capsule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
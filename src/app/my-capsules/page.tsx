"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Package, Edit, Trash2, Share2, Lock, Eye, Search, Filter, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardNav } from "@/components/DashboardNav";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
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
  userId: string;
  title: string;
  description: string | null;
  unlockDate: string;
  isLocked: boolean;
  isEmergencyAccessible: boolean;
  emergencyQrCode: string | null;
  theme: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyCapsules() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "locked" | "unlocked">("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCapsules();
    }
  }, [session]);

  const fetchCapsules = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/capsules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCapsules(data);
      }
    } catch (error) {
      console.error("Failed to fetch capsules:", error);
      toast.error("Failed to load capsules");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/capsules/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Capsule deleted successfully");
        fetchCapsules();
        setShowDeleteDialog(false);
        setCapsuleToDelete(null);
      } else {
        toast.error("Failed to delete capsule");
      }
    } catch (error) {
      console.error("Error deleting capsule:", error);
      toast.error("Failed to delete capsule");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}/capsules/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="text-xl font-medium neon-glow">Loading...</div>
      </div>
    );
  }

  const filteredCapsules = capsules.filter((capsule) => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "locked" && capsule.isLocked) ||
      (filterStatus === "unlocked" && !capsule.isLocked);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
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
            <span className="text-sm font-medium">Manage Your Capsules</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            My Capsules
          </h1>
          <p className="text-lg text-muted-foreground">
            View, edit, and manage all your time capsules
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-2xl p-6 mb-8 border-primary/25"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search capsules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 glass-subtle border-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-gradient-to-r from-primary to-accent" : "glass-subtle border-primary/20"}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "locked" ? "default" : "outline"}
                onClick={() => setFilterStatus("locked")}
                className={filterStatus === "locked" ? "bg-gradient-to-r from-primary to-accent" : "glass-subtle border-primary/20"}
              >
                <Lock className="w-4 h-4 mr-2" />
                Locked
              </Button>
              <Button
                variant={filterStatus === "unlocked" ? "default" : "outline"}
                onClick={() => setFilterStatus("unlocked")}
                className={filterStatus === "unlocked" ? "bg-gradient-to-r from-primary to-accent" : "glass-subtle border-primary/20"}
              >
                <Eye className="w-4 h-4 mr-2" />
                Unlocked
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Capsules Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse border border-primary/15" />
            ))}
          </div>
        ) : filteredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-12 text-center border-primary/25"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              {searchQuery || filterStatus !== "all" ? "No capsules found" : "No capsules yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first time capsule to get started"}
            </p>
            <Button
              onClick={() => router.push("/create-capsule")}
              className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow"
            >
              Create Capsule
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCapsules.map((capsule, index) => (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="glass rounded-2xl p-6 border border-primary/15 group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/capsules/${capsule.id}`}>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors cursor-pointer">
                        {capsule.title}
                      </h3>
                    </Link>
                    {capsule.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {capsule.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    capsule.isLocked
                      ? "bg-primary/20 text-primary"
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    {capsule.isLocked ? "Locked" : "Unlocked"}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Unlocks: {format(new Date(capsule.unlockDate), "MMM d, yyyy")}
                </div>

                <div className="flex gap-2">
                  <Link href={`/capsules/${capsule.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full glass-subtle border-primary/20 hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handleShare(capsule.id)}
                    className="glass-subtle border-primary/20 hover:bg-primary/10"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapsuleToDelete({ id: capsule.id, title: capsule.title });
                      setShowDeleteDialog(true);
                    }}
                    className="glass-subtle border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
                Are you sure you want to delete "{capsuleToDelete?.title}"?
              </p>
              <p className="text-muted-foreground">
                This action cannot be undone. This will permanently delete the capsule and all its contents including uploaded files.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setCapsuleToDelete(null);
              }}
              disabled={isDeleting}
              className="glass-subtle border-primary/20"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => capsuleToDelete && handleDelete(capsuleToDelete.id)}
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
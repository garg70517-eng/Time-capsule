"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Globe, Search, TrendingUp, Users, Sparkles, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardNav } from "@/components/DashboardNav";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";

interface PublicCapsule {
  id: number;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  views?: number;
  creator?: string;
}

export default function ExplorePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [capsules, setCapsules] = useState<PublicCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPublicCapsules();
    }
  }, [session]);

  const fetchPublicCapsules = async () => {
    try {
      // This would fetch public capsules from the API
      // For now, showing empty state
      setCapsules([]);
    } catch (error) {
      console.error("Failed to fetch public capsules:", error);
    } finally {
      setLoading(false);
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

  const filteredCapsules = capsules.filter((capsule) =>
    capsule.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-sm font-medium">Discover Memories</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Explore Capsules
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover public time capsules shared by the community
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: Globe, label: "Public Capsules", value: "0" },
            { icon: TrendingUp, label: "Trending", value: "0" },
            { icon: Users, label: "Active Users", value: "0" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass rounded-2xl p-6 text-center border border-primary/15"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-6 mb-8 border-primary/25"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search public capsules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-subtle border-primary/20 focus:border-primary"
            />
          </div>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-3xl p-16 text-center border-primary/25"
        >
          <div className="relative inline-block mb-6">
            <Globe className="w-20 h-20 text-primary drop-shadow-[0_0_24px_rgba(135,100,210,0.9)]" />
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            No Public Capsules Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Be the first to share your memories with the world. Create a capsule and make it public for others to discover.
          </p>
          <Button
            onClick={() => router.push("/create-capsule")}
            className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow"
          >
            Create Public Capsule
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Plus, Package, Clock, Lock, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/DashboardNav";
import { CapsuleCard } from "@/components/CapsuleCard";
import { motion } from "framer-motion";

interface Capsule {
  id: number | string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
}

// Transform API response (camelCase) to frontend format (snake_case)
function transformCapsule(apiCapsule: any): Capsule {
  return {
    id: apiCapsule.id,
    title: apiCapsule.title,
    description: apiCapsule.description,
    unlock_date: apiCapsule.unlockDate,
    is_locked: apiCapsule.isLocked,
    created_at: apiCapsule.createdAt,
  };
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Transform API response to frontend format
        const transformedCapsules = data.map(transformCapsule);
        setCapsules(transformedCapsules);
      }
    } catch (error) {
      console.error("Failed to fetch capsules:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="text-xl font-medium neon-glow">Loading your capsules...</div>
      </div>
    );
  }

  const stats = [
    { label: "Total Capsules", value: capsules.length, icon: Package },
    { label: "Locked", value: capsules.filter(c => c.is_locked).length, icon: Lock },
    { label: "This Month", value: capsules.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length, icon: Calendar },
    { label: "Active", value: capsules.filter(c => !c.is_locked).length, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-4"
              >
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm font-medium">Welcome back!</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                My Time Capsules
              </h1>
              <p className="text-lg text-muted-foreground">
                Preserve your memories for the future
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => router.push("/create-capsule")}
                size="lg"
                className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Capsule
              </Button>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="glass rounded-2xl p-6 group cursor-pointer hover:scale-105 transition-all duration-300 border border-primary/15"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 box-glow">
                    <stat.icon className="h-6 w-6 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Capsules Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="glass rounded-2xl h-64 animate-pulse border border-primary/15"
              />
            ))}
          </div>
        ) : capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-strong rounded-3xl p-12 md:p-16 text-center border-primary/25 relative overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-accent/12 to-periwinkle/10 opacity-70" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center"
              >
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mb-6 box-glow">
                  <Package className="h-10 w-10 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                No capsules yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                Create your first time capsule to start preserving your precious memories for the future
              </p>
              <Button
                onClick={() => router.push("/create-capsule")}
                size="lg"
                className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Capsule
              </Button>
            </div>
          </motion.div>
        ) : (
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold mb-6 flex items-center gap-3"
            >
              <Clock className="h-6 w-6 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
              Your Capsules
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capsules.map((capsule, index) => (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <CapsuleCard capsule={capsule} onDelete={fetchCapsules} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
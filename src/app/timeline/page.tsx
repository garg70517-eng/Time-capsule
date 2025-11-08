"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Lock, Eye, ArrowLeft, Sparkles, Timer } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, isPast } from "date-fns";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DashboardNav } from "@/components/DashboardNav";

interface Capsule {
  id: number;
  title: string;
  description: string | null;
  unlockDate: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
}

export default function TimelinePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/timeline");
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
      const response = await fetch(`/api/capsules?userId=${session?.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by unlock date
        const sorted = data.sort(
          (a: Capsule, b: Capsule) =>
            new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
        );
        setCapsules(sorted);
      }
    } catch (error) {
      console.error("Error fetching capsules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilUnlock = (unlockDate: string) => {
    return differenceInDays(new Date(unlockDate), new Date());
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="text-xl font-medium neon-glow">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      
      <DashboardNav />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-smooth glass-subtle rounded-full px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-6 animated-border"
          >
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium">Journey Through Time</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Memory Timeline
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your capsules arranged chronologically by unlock date
          </p>
        </motion.div>

        {/* Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent animate-spin border-4 border-transparent border-t-primary box-glow" />
          </div>
        ) : capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-12 md:p-16 text-center border-primary/25 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-accent/12 to-periwinkle/10 opacity-70" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mx-auto mb-6 box-glow">
                  <Calendar className="h-10 w-10 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                No capsules yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first time capsule to see it on your timeline
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 text-white font-medium box-glow transition-smooth"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-accent opacity-30" />

            {/* Timeline Items */}
            <div className="space-y-8">
              {capsules.map((capsule, index) => {
                const isUnlocked = isPast(new Date(capsule.unlockDate));
                const daysUntil = getDaysUntilUnlock(capsule.unlockDate);

                return (
                  <motion.div
                    key={capsule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      className="absolute left-8 top-8 w-4 h-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent border-4 border-background z-10 box-glow"
                    />

                    {/* Content Card */}
                    <div className="ml-20">
                      <Link href={`/capsules/${capsule.id}`}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                          className="glass rounded-2xl p-8 group cursor-pointer relative overflow-hidden border border-primary/15 hover:border-primary/30 transition-all duration-300"
                        >
                          {/* Gradient Glow */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/8 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          <div className="relative z-10">
                            {/* Date Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-primary/30 mb-4">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">
                                {format(new Date(capsule.unlockDate), "MMMM d, yyyy")}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-0 right-0">
                              {isUnlocked ? (
                                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-2 box-glow">
                                  <Eye className="w-4 h-4 text-green-400" />
                                  <span className="text-sm text-green-300 font-medium">
                                    Unlocked
                                  </span>
                                </div>
                              ) : (
                                <div className="px-4 py-2 rounded-full glass-subtle border border-primary/30 flex items-center gap-2 box-glow">
                                  <Lock className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    {daysUntil === 0
                                      ? "Unlocks Today"
                                      : `${daysUntil} days`}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text transition-all">
                              {capsule.title}
                            </h3>
                            {capsule.description && (
                              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                                {capsule.description}
                              </p>
                            )}

                            {/* Countdown */}
                            {!isUnlocked && (
                              <div className="mt-6 pt-6 border-t border-primary/15 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center box-glow">
                                  <Timer className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Unlocks in</div>
                                  <div className="font-semibold text-foreground">
                                    {daysUntil} {daysUntil === 1 ? "day" : "days"}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
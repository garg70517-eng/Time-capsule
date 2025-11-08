"use client";

import { motion } from "framer-motion";
import { Calendar, Lock, Eye } from "lucide-react";
import Link from "next/link";
import { format, isValid, parseISO } from "date-fns";

interface Capsule {
  id: number;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
}

interface CapsuleCardProps {
  capsule: Capsule;
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  // Safely parse and validate the unlock date
  const parseDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  const unlockDate = parseDate(capsule.unlock_date);
  const isLocked = unlockDate ? unlockDate > new Date() : false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/capsules/${capsule.id}`}>
        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-white/20 rounded-2xl p-6 hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isLocked ? (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">Locked</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-1">
                <Eye className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300 font-medium">Unlocked</span>
              </div>
            )}
          </div>

          {/* Gradient Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/5 to-pink-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-7 h-7 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
            {capsule.title}
          </h3>

          {/* Description */}
          {capsule.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {capsule.description}
            </p>
          )}

          {/* Unlock Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-muted-foreground">
              {unlockDate ? (
                <>
                  {isLocked ? "Unlocks" : "Unlocked"} on{" "}
                  <span className="font-medium text-foreground">
                    {format(unlockDate, "MMM d, yyyy")}
                  </span>
                </>
              ) : (
                <span className="font-medium text-muted-foreground">No unlock date set</span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, User, Clock, Menu, X, Package, Plus, Globe, HelpCircle, Mail, Info } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { NotificationBell } from "@/components/NotificationBell";

export function DashboardNav() {
  const { data: session, refetch } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Clock },
    { href: "/create-capsule", label: "Create", icon: Plus },
    { href: "/my-capsules", label: "My Capsules", icon: Package },
    { href: "/explore", label: "Explore", icon: Globe },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const secondaryLinks = [
    { href: "/about", label: "About", icon: Info },
    { href: "/help", label: "Help", icon: HelpCircle },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-primary/25 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-8"
          >
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Clock className="h-8 w-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent neon-glow">
                Time Capsule
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-smooth relative group flex items-center gap-2"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="relative z-10">{link.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            {session?.user && (
              <>
                {/* Notification Bell - Desktop & Mobile */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <NotificationBell />
                </motion.div>

                {/* Desktop User Info & Logout */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="hidden lg:flex items-center gap-2 glass-subtle rounded-xl px-4 py-2 border border-primary/20 box-glow"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{session.user.name}</span>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="hidden lg:flex px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-500/10 hover:text-red-500 transition-smooth items-center gap-2 border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </motion.button>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl hover:bg-primary/10 transition-smooth"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden glass-strong border-t border-primary/20 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-6">
            {/* Primary Nav Links */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-4 mb-2">MAIN MENU</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-smooth"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Secondary Links */}
            <div className="space-y-2 pt-2 border-t border-primary/20">
              <p className="text-xs font-semibold text-muted-foreground px-4 mb-2">MORE</p>
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-smooth"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* User Info */}
            <div className="pt-3 border-t border-primary/20">
              <div className="flex items-center gap-2 glass-subtle rounded-xl px-4 py-3 border border-primary/20 mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">{session?.user.name}</span>
              </div>
              
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold hover:bg-red-500/10 hover:text-red-500 transition-smooth flex items-center gap-2 border border-transparent hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
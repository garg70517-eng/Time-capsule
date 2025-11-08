"use client";

import { Clock, Shield, Users, Heart, Sparkles, Lock, Cloud, Globe } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: Lock,
      title: "Secure Storage",
      description: "Military-grade encryption protects your memories",
    },
    {
      icon: Clock,
      title: "Time-Locked",
      description: "Set precise unlock dates for your capsules",
    },
    {
      icon: Cloud,
      title: "Cloud Backup",
      description: "Your data is safely stored in the cloud",
    },
    {
      icon: Globe,
      title: "Share Memories",
      description: "Collaborate with family and friends",
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data belongs to you. We never sell or share your information.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by a team passionate about preserving memories.",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every feature is crafted to create meaningful experiences.",
    },
  ];

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
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium">About Us</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Preserving Memories
            <br />
            <span className="neon-glow">Across Time</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Time Capsule is a modern platform designed to help you preserve, protect, and share your most precious digital memories with future generations.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-3xl p-12 mb-16 border-primary/25 text-center"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We believe that every moment matters. Our mission is to provide a secure, elegant, and intuitive platform where you can store your memories and unlock them at just the right time in the future.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass rounded-2xl p-6 border border-primary/15 group hover:scale-105 transition-all"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform box-glow">
                  <feature.icon className="w-7 h-7 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className="glass-strong rounded-2xl p-8 text-center border-primary/25"
              >
                <value.icon className="w-12 h-12 mx-auto mb-4 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-12 text-center border-primary/25"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users preserving their memories for the future
          </p>
          <Link href="/create-capsule">
            <Button className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow h-12 px-8 text-base">
              Create Your First Capsule
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
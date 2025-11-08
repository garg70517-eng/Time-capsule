"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Lock, Share2, Shield, Calendar, ArrowRight, Sparkles, Bell, Eye, Database, CloudUpload, Timer, Users2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: Lock,
      title: "Secure Time-Locked Storage",
      description: "Your memories stay sealed until the unlock date you choose",
    },
    {
      icon: Share2,
      title: "Collaborative Sharing",
      description: "Invite family and friends to contribute to your capsules",
    },
    {
      icon: Shield,
      title: "Emergency Access",
      description: "QR code system for critical health records and documents",
    },
    {
      icon: Calendar,
      title: "Timeline View",
      description: "Visualize all your capsules on an interactive timeline",
    },
  ];

  const benefits = [
    {
      title: "Military-Grade Encryption",
      description: "Every file is encrypted with AES-256 encryption before storage. Your memories are protected with the same security standards used by governments and financial institutions.",
      icon: Lock,
      stat: "256-bit",
      statLabel: "Encryption"
    },
    {
      title: "Unlimited Cloud Storage",
      description: "Store photos, videos, documents, and audio without worrying about space limits. From wedding albums to entire family archives, we've got you covered.",
      icon: CloudUpload,
      stat: "Unlimited",
      statLabel: "Storage Space"
    },
    {
      title: "Smart Scheduling",
      description: "Set precise unlock dates and receive intelligent reminders. Schedule capsules for birthdays, anniversaries, graduations, or any milestone moment.",
      icon: Timer,
      stat: "100%",
      statLabel: "On-Time Delivery"
    },
    {
      title: "Family Collaboration",
      description: "Invite family members to contribute their own memories and perspectives. Build collective family histories with multiple contributors.",
      icon: Users2,
      stat: "50+",
      statLabel: "Contributors Per Capsule"
    },
    {
      title: "Emergency Medical Access",
      description: "Store critical health records with QR-code instant access for emergency responders. Keep vital medical information secure yet immediately accessible.",
      icon: Shield,
      stat: "Instant",
      statLabel: "Emergency Access"
    },
    {
      title: "Rich Media Support",
      description: "Upload photos, 4K videos, audio recordings, PDFs, and documents. Full multimedia preservation with automatic format conversion and optimization.",
      icon: FileText,
      stat: "All Formats",
      statLabel: "Media Types"
    },
  ];

  const stats = [
    { icon: Database, label: "Unlimited Storage", value: "∞", suffix: "GB" },
    { icon: Lock, label: "Secure Capsules", value: "256", suffix: "-bit" },
    { icon: Bell, label: "Smart Reminders", value: "24/7", suffix: "" },
    { icon: Eye, label: "Privacy First", value: "100", suffix: "%" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent neon-glow">
                Time Capsule
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="transition-smooth hover:bg-primary/10 hover:text-primary">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-periwinkle/20 rounded-full blur-[150px] animate-pulse delay-500" style={{ '--tw-gradient-from': 'oklch(0.65 0.14 260 / 0.2)' } as any} />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 glass-subtle rounded-full px-6 py-2.5 mb-8 animated-border"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
                Preserve Memories Across Time
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              Preserve Your Digital
              <br />
              <span className="neon-glow">Memories Forever</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Create secure time capsules for your photos, videos, documents, and memories.
              Unlock them at the perfect moment in the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth text-base px-8">
                    Create Your First Capsule
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="glass-subtle hover:glass border-primary/30 transition-smooth text-base px-8">
                    Learn More
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            <div className="glass-strong rounded-2xl p-6 max-w-4xl mx-auto border-primary/25">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="text-center group"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <stat.icon className="h-8 w-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {stat.value}<span className="text-xl">{stat.suffix}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
            >
              Why Choose Time Capsule
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Enterprise-grade security meets elegant simplicity
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass rounded-2xl p-8 group cursor-pointer relative overflow-hidden border border-primary/15"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Icon and stat */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 box-glow">
                      <benefit.icon className="h-7 w-7 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent neon-rose">{benefit.stat}</div>
                      <div className="text-xs text-muted-foreground">{benefit.statLabel}</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Everything you need to preserve and protect your digital memories
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass rounded-2xl p-7 group cursor-pointer border border-primary/15"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 box-glow">
                  <feature.icon className="h-7 w-7 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
            >
              How It Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Create your time capsule in three simple steps
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Capsule",
                description: "Choose a theme, set an unlock date, and add a description",
              },
              {
                step: "2",
                title: "Add Content",
                description: "Upload photos, videos, documents, and messages",
              },
              {
                step: "3",
                title: "Seal & Wait",
                description: "Lock your capsule and wait for the unlock date to arrive",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div 
                  className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-accent to-accent flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 box-glow-rose shadow-2xl group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.step}
                </motion.div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 md:p-16 border-primary/25 relative overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-accent/12 to-periwinkle/10 opacity-70" style={{ '--tw-gradient-to': 'oklch(0.65 0.14 260 / 0.1)' } as any} />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Start Preserving Today
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who trust Time Capsule to protect their precious memories
              </p>
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow-rose transition-smooth text-lg px-10 py-6">
                    Create Your Free Account
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-primary/25 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="h-6 w-6 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
            <span className="text-lg font-bold text-foreground">Time Capsule</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Time Capsule. Preserving memories for the future.
          </p>
        </div>
      </footer>
    </div>
  );
}
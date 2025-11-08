"use client";

import { Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { ChatDialog } from "@/components/ChatDialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send the contact form data to your email
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      
      <DashboardNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium">Get in Touch</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="glass-strong rounded-2xl p-6 border-primary/25">
              <Mail className="w-8 h-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)] mb-4" />
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We typically respond within 24 hours
              </p>
              <a
                href="mailto:amerenxd@gmail.com"
                className="text-primary hover:underline text-sm"
              >
                amerenxd@gmail.com
              </a>
            </div>

            <div className="glass-strong rounded-2xl p-6 border-primary/25">
              <MessageCircle className="w-8 h-8 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)] mb-4" />
              <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Chat with our AI assistant
              </p>
              <Button
                onClick={() => setIsChatOpen(true)}
                variant="outline"
                className="w-full glass-subtle border-primary/20 hover:bg-primary/10"
              >
                Start Chat
              </Button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 border-primary/25 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold mb-2">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder=""
                    required
                    disabled={isSubmitting}
                    className="glass-subtle border-primary/20 focus:border-primary h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold mb-2">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder=""
                    required
                    disabled={isSubmitting}
                    className="glass-subtle border-primary/20 focus:border-primary h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="text-base font-semibold mb-2">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                  disabled={isSubmitting}
                  className="glass-subtle border-primary/20 focus:border-primary h-12"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-base font-semibold mb-2">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  disabled={isSubmitting}
                  className="glass-subtle border-primary/20 focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Chat Dialog */}
      <ChatDialog open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
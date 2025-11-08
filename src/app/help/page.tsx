"use client";

import { HelpCircle, BookOpen, Video, MessageCircle, Sparkles, ChevronDown } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "How do I create a time capsule?",
      answer: "Click on 'Create Capsule' from your dashboard, fill in the title, description, and select an unlock date. You can then upload photos, videos, and documents before sealing your capsule.",
    },
    {
      question: "Can I edit a capsule after creating it?",
      answer: "Yes! You can edit your capsule's content and settings anytime before it's locked. Once locked, the capsule can only be viewed after the unlock date.",
    },
    {
      question: "What file types can I upload?",
      answer: "We support images (JPG, PNG, GIF), videos (MP4, MOV), documents (PDF, DOC, DOCX), and text files. Maximum file size is 100MB per file.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We use military-grade AES-256 encryption to protect your data. Your files are stored securely in the cloud with multiple backups.",
    },
    {
      question: "Can I share my capsule with others?",
      answer: "Yes! You can invite collaborators to contribute to your capsule or share viewing access with family and friends.",
    },
    {
      question: "What happens when a capsule unlocks?",
      answer: "You'll receive an email notification when your capsule unlocks. You can then view all the contents and download them if needed.",
    },
    {
      question: "Can I delete a capsule?",
      answer: "Yes, you can delete capsules from the 'My Capsules' page. Please note that this action is permanent and cannot be undone.",
    },
    {
      question: "Is there a limit to how many capsules I can create?",
      answer: "Free accounts can create up to 10 capsules. Premium accounts have unlimited capsules with additional features.",
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      link: "#",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      link: "#",
    },
    {
      icon: MessageCircle,
      title: "Community Forum",
      description: "Connect with other users",
      link: "#",
    },
  ];

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
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium">Help Center</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            How Can We Help?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of Time Capsule
          </p>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href={resource.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass rounded-2xl p-6 border border-primary/15 group hover:scale-105 transition-all text-center"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform box-glow">
                <resource.icon className="w-7 h-7 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </motion.a>
          ))}
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass rounded-2xl border border-primary/15 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4 text-muted-foreground leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-3xl p-12 text-center border-primary/25 mt-16"
        >
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-primary drop-shadow-[0_0_24px_rgba(135,100,210,0.9)]" />
          <h2 className="text-2xl font-bold mb-3">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link href="/contact">
            <Button className="bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow">
              Contact Support
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
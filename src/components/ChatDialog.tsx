"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm the Time Capsule AI assistant. I can help you with questions about creating capsules, security, features, pricing, and more. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Pattern matching for common queries
    if (lowerMessage.includes("create") || lowerMessage.includes("capsule") || lowerMessage.includes("how to")) {
      return "To create a time capsule:\n1. Click 'Create Capsule' from your dashboard\n2. Choose a theme and set an unlock date\n3. Upload photos, videos, documents, or write messages\n4. Add collaborators if you'd like (optional)\n5. Seal your capsule!\n\nYour memories will be securely stored until the unlock date arrives.";
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("free") || lowerMessage.includes("payment")) {
      return "Time Capsule offers flexible pricing:\n• Free Plan: Create unlimited capsules with basic features\n• Pro Plan: Advanced features including unlimited storage, priority support, and enhanced collaboration tools\n\nYou can start with the free plan and upgrade anytime!";
    }

    if (lowerMessage.includes("security") || lowerMessage.includes("secure") || lowerMessage.includes("safe") || lowerMessage.includes("encrypt")) {
      return "Your memories are protected with military-grade security:\n• AES-256 encryption for all files\n• Secure cloud storage\n• Privacy-first architecture\n• Optional emergency QR access\n• Regular security audits\n\nYour data is encrypted before upload and remains secure until unlock.";
    }

    if (lowerMessage.includes("share") || lowerMessage.includes("collaborat") || lowerMessage.includes("invite") || lowerMessage.includes("family")) {
      return "You can easily collaborate on capsules:\n1. Create or open a capsule\n2. Click 'Add Collaborators'\n3. Enter email addresses of family/friends\n4. They'll receive an invitation to contribute\n\nCollaborators can add their own photos, videos, and messages to shared capsules!";
    }

    if (lowerMessage.includes("unlock") || lowerMessage.includes("open") || lowerMessage.includes("access") || lowerMessage.includes("when")) {
      return "Capsules unlock automatically on the date you set during creation. You'll receive:\n• Email notifications as the unlock date approaches\n• In-app reminders\n• Instant access once unlocked\n\nYou can also set up early unlock options for emergencies if needed.";
    }

    if (lowerMessage.includes("emergency") || lowerMessage.includes("qr") || lowerMessage.includes("medical") || lowerMessage.includes("health")) {
      return "Emergency QR Access allows instant access to critical information:\n1. Create a capsule with medical/emergency data\n2. Enable QR code access\n3. Print or save the QR code\n4. Emergency responders can scan for immediate access\n\nPerfect for medical records, emergency contacts, and vital documents.";
    }

    if (lowerMessage.includes("storage") || lowerMessage.includes("limit") || lowerMessage.includes("size") || lowerMessage.includes("upload")) {
      return "Time Capsule supports unlimited storage on all plans:\n• Photos (JPEG, PNG, HEIC, etc.)\n• Videos (MP4, MOV, up to 4K)\n• Documents (PDF, DOCX, TXT)\n• Audio files (MP3, WAV)\n• No file size limits on Pro plan\n\nUpload as many memories as you want!";
    }

    if (lowerMessage.includes("timeline") || lowerMessage.includes("view") || lowerMessage.includes("organize")) {
      return "The Timeline View helps you visualize all your capsules:\n• See all capsules arranged chronologically\n• Filter by status (sealed/unlocked)\n• View unlock dates at a glance\n• Quick access to any capsule\n\nAccess it from your dashboard navigation menu!";
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("contact") || lowerMessage.includes("problem")) {
      return "I'm here to help! You can also:\n• Email us at support@timecapsule.com\n• Check our Help Center for detailed guides\n• Browse FAQs for quick answers\n• Contact our support team (we respond within 24 hours)\n\nWhat specific issue can I help you with?";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! How can I help you today? I can answer questions about:\n• Creating capsules\n• Security & privacy\n• Sharing & collaboration\n• Emergency access\n• Pricing & plans\n• And more!";
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with today?";
    }

    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
      return "Goodbye! Feel free to reach out anytime you need assistance. Happy memory preserving! 🎉";
    }

    // Default response for unmatched queries
    return "I understand you're asking about: \"" + userMessage + "\"\n\nI can help with:\n• Creating and managing capsules\n• Security features\n• Sharing & collaboration\n• Pricing information\n• Emergency access setup\n\nCould you rephrase your question or choose one of these topics? For complex issues, our support team at support@timecapsule.com can provide detailed assistance!";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0 glass-strong border-primary/30">
        <DialogHeader className="px-6 py-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center box-glow">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">AI Assistant</DialogTitle>
                <p className="text-sm text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="hover:bg-primary/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "bot"
                      ? "bg-gradient-to-br from-primary/30 to-accent/25"
                      : "bg-gradient-to-br from-accent/30 to-primary/25"
                  }`}>
                    {message.sender === "bot" ? (
                      <Bot className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === "bot"
                        ? "glass-subtle border border-primary/20"
                        : "bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/30"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/25 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="glass-subtle border border-primary/20 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce delay-100" />
                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-primary/20">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="glass-subtle border-primary/20 focus:border-primary h-12"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="h-12 px-6 bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are for general guidance. Contact support for account-specific help.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Upload, Calendar, Lock, Image, Video, FileText, X, Plus, Sparkles, File, Music, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardNav } from "@/components/DashboardNav";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  file: File;
}

const THEMES = [
  { id: "default", name: "Classic", color: "from-primary to-accent", icon: "🕰️" },
  { id: "sunset", name: "Sunset", color: "from-orange-500 to-pink-500", icon: "🌅" },
  { id: "ocean", name: "Ocean", color: "from-blue-500 to-cyan-500", icon: "🌊" },
  { id: "forest", name: "Forest", color: "from-green-500 to-emerald-500", icon: "🌲" },
  { id: "galaxy", name: "Galaxy", color: "from-purple-500 to-indigo-500", icon: "🌌" },
  { id: "autumn", name: "Autumn", color: "from-amber-500 to-red-500", icon: "🍂" },
];

export default function CreateCapsulePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    unlockDate: "",
    category: "personal",
    theme: "default",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      file,
    }));
    setFiles([...files, ...newFiles]);
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles(files.filter((f) => f.id !== id));
    toast.info("File removed");
  };

  const uploadFileToCapsule = async (capsuleId: string, file: UploadedFile) => {
    // Validate session
    if (!session?.user?.id) {
      throw new Error("User session not found. Please log in again.");
    }

    // In a real app, you'd upload to cloud storage (S3, Supabase Storage, etc.)
    // For now, we'll store the file info with a placeholder URL
    const fileUrl = `https://storage.example.com/${capsuleId}/${file.name}`;
    
    const token = localStorage.getItem("bearer_token");
    const response = await fetch("/api/capsule-files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        capsuleId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        thumbnailUrl: file.preview || null,
        uploadedBy: session.user.id.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to upload ${file.name}`);
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a capsule title");
      return;
    }
    
    if (!formData.unlockDate) {
      toast.error("Please select an unlock date");
      return;
    }

    const unlockDate = new Date(formData.unlockDate);
    if (unlockDate <= new Date()) {
      toast.error("Unlock date must be in the future");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // Create capsule - API expects ISO timestamp
      const capsuleResponse = await fetch("/api/capsules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          unlockDate: unlockDate.toISOString(), // Convert to ISO timestamp
          theme: formData.theme,
        }),
      });

      if (!capsuleResponse.ok) {
        const error = await capsuleResponse.json();
        throw new Error(error.error || "Failed to create capsule");
      }

      const newCapsule = await capsuleResponse.json();
      console.log("Created capsule:", newCapsule);

      // Upload files if any
      if (files.length > 0) {
        toast.info(`Uploading ${files.length} file(s)...`);
        
        for (let i = 0; i < files.length; i++) {
          await uploadFileToCapsule(newCapsule.id, files[i]);
          toast.loading(`Uploading ${i + 1}/${files.length}...`, { id: 'upload-progress' });
        }
        
        toast.dismiss('upload-progress');
        toast.success(`All files uploaded successfully!`);
      }

      toast.success("Capsule created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating capsule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create capsule. Please try again.");
    } finally {
      setIsLoading(false);
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

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("pdf")) return FileText;
    if (type.includes("document") || type.includes("word")) return FileText;
    if (type.includes("spreadsheet") || type.includes("excel")) return FileText;
    return File;
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[150px] animate-pulse delay-1000" />
      
      <DashboardNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 glass-subtle rounded-full px-4 py-2 mb-4"
            >
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-sm font-medium">Create New Capsule</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Preserve Your Memories
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your memories and schedule when to unlock them
            </p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="glass-strong rounded-3xl p-8 border-primary/25 space-y-6"
          >
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold mb-2 flex items-center gap-2">
                Capsule Title
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My Precious Memories"
                className="glass-subtle border-primary/20 focus:border-primary h-12 text-base"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A collection of memories from..."
                rows={4}
                className="glass-subtle border-primary/20 focus:border-primary text-base resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Theme Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Theme
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {THEMES.map((theme) => (
                  <motion.button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id })}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                    className={`relative glass rounded-xl p-4 border-2 transition-all ${
                      formData.theme === theme.id
                        ? "border-primary box-glow"
                        : "border-primary/15 hover:border-primary/30"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${theme.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>
                      {theme.icon}
                    </div>
                    <p className="text-sm font-semibold">{theme.name}</p>
                    {formData.theme === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Category & Unlock Date */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category" className="text-base font-semibold mb-2">
                  Category
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full glass-subtle border-primary/20 rounded-xl h-12 px-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                >
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="work">Work</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="unlockDate" className="text-base font-semibold mb-2 flex items-center gap-2">
                  Unlock Date
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    id="unlockDate"
                    type="datetime-local"
                    value={formData.unlockDate}
                    onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="glass-subtle border-primary/20 focus:border-primary h-12 pl-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Attachments
                <span className="text-sm text-muted-foreground font-normal ml-2">
                  (Images, Videos, Documents, Audio)
                </span>
              </Label>
              
              {/* Upload Area */}
              <label
                htmlFor="file-upload"
                className="relative block cursor-pointer group"
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <div className="glass rounded-2xl border-2 border-dashed border-primary/30 p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group-hover:scale-[1.02]">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-primary drop-shadow-[0_0_16px_rgba(135,100,210,0.9)]" />
                  <p className="text-lg font-semibold mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported: Images, Videos, Audio, PDF, DOC, DOCX, PPT, XLS, TXT
                  </p>
                </div>
              </label>

              {/* File Preview Grid */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {files.length} file(s) selected
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles([])}
                      className="text-xs"
                      disabled={isLoading}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file) => {
                      const Icon = getFileIcon(file.type);
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative glass rounded-xl p-4 group border border-primary/15 hover:border-primary/30 transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
                              <Icon className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          
                          <p className="text-xs font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex-1 h-12 text-base glass-subtle border-primary/20 hover:bg-primary/10"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 text-base bg-gradient-to-r from-primary via-accent/90 to-accent hover:from-primary/90 hover:via-accent/80 hover:to-accent/90 box-glow transition-smooth"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Creating Capsule...</>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Create Capsule
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

interface Capsule {
  id: number;
  title: string;
  description: string | null;
  unlockDate: string;
  isEmergencyAccessible: boolean;
}

interface CapsuleFile {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export default function EmergencyAccessPage() {
  const params = useParams();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [files, setFiles] = useState<CapsuleFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const capsuleId = params.id as string;

  useEffect(() => {
    fetchEmergencyData();
  }, [capsuleId]);

  const fetchEmergencyData = async () => {
    try {
      // Fetch capsule without auth for emergency access
      const capsuleRes = await fetch(`/api/capsules/${capsuleId}`);
      
      if (!capsuleRes.ok) {
        setError("Capsule not found or access denied");
        return;
      }

      const capsuleData = await capsuleRes.json();
      
      // Check if capsule allows emergency access
      if (!capsuleData.isEmergencyAccessible) {
        setError("This capsule is private and requires authentication");
        return;
      }

      setCapsule(capsuleData);

      // Fetch files
      const filesRes = await fetch(`/api/capsule-files?capsuleId=${capsuleId}`);
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData);
      }
    } catch (error) {
      console.error("Error fetching emergency data:", error);
      setError("Failed to load emergency information");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading emergency information...</p>
        </div>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-red-500/30 rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Unable to access emergency information"}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Go to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/5 via-background to-orange-500/5">
      {/* Emergency Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <Shield className="w-6 h-6" />
          <span className="font-bold text-lg">EMERGENCY ACCESS MODE</span>
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">Emergency Information Access</h2>
              <p className="text-sm text-muted-foreground">
                You are viewing emergency information via QR code access. This information
                is provided for emergency response purposes only. Handle with confidentiality
                and care.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Capsule Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-white/20 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{capsule.title}</h1>
              {capsule.description && (
                <p className="text-muted-foreground">{capsule.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created On</p>
                <p className="font-medium">
                  {format(new Date(capsule.unlockDate), "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Access Type</p>
                <p className="font-medium">Emergency Public Access</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emergency Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-white/20 rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-500" />
            Emergency Documents
            <span className="text-muted-foreground text-lg">({files.length})</span>
          </h2>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No emergency documents available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-4 p-4 backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 rounded-xl hover:bg-white/70 dark:hover:bg-white/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.fileName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {file.fileType} • Uploaded {format(new Date(file.uploadedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                    View
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            This information is encrypted and securely stored
          </p>
          <p className="mt-2">
            Powered by{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              Time Capsule
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
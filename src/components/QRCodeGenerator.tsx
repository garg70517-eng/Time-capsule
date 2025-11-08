"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, X, Share2, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  capsuleId: number;
  capsuleTitle: string;
}

export function QRCodeGenerator({
  isOpen,
  onClose,
  capsuleId,
  capsuleTitle,
}: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  
  const emergencyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/emergency/${capsuleId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(emergencyUrl);
    setCopied(true);
    toast.success("Emergency link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.createElement("canvas");
    const svg = document.getElementById("qr-code-svg") as unknown as SVGSVGElement;
    
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 512, 512);
        
        const link = document.createElement("a");
        link.download = `emergency-qr-${capsuleId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        toast.success("QR Code downloaded successfully");
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/20 rounded-3xl shadow-2xl"
      >
        {/* Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-yellow-600/10 rounded-3xl" />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Emergency QR Code</h2>
              <p className="text-sm text-muted-foreground">{capsuleTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-6 backdrop-blur-xl bg-white dark:bg-black rounded-2xl border-4 border-gradient-to-r from-red-600 to-orange-600">
              <QRCodeSVG
                id="qr-code-svg"
                value={emergencyUrl}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            
            <div className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                🚨 For Emergency Use Only
              </p>
            </div>
          </div>

          {/* Emergency URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Emergency Access Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emergencyUrl}
                readOnly
                className="flex-1 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-white/20 text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="p-2 rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 hover:bg-white/70 dark:hover:bg-white/10 transition-all"
                title="Copy link"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <h3 className="font-medium mb-2 text-sm">How Emergency Access Works:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• QR code provides instant access to emergency information</li>
              <li>• No login required for emergency responders</li>
              <li>• Only works with public capsules</li>
              <li>• Read-only access to protect your data</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadQR}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:from-red-700 hover:to-orange-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
            <button
              onClick={handleCopyUrl}
              className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/20 font-medium hover:bg-white/70 dark:hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Link
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
'use client'

import { motion } from "framer-motion";
import { Share2, Users } from "lucide-react";

export default function SharedPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Share2 className="text-emerald-400" />
          Shared with Me
        </h1>
        <p className="text-slate-400">
          Runbooks that have been shared with you by others.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
          <Users size={32} className="text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No shared runbooks</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          When someone shares a runbook with you, it will appear here.
        </p>
      </motion.div>
    </div>
  );
}

'use client'

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, Search, Filter } from "lucide-react";

export default function RunbooksPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Runbooks</h1>
          <p className="text-slate-400">Manage all your technical procedures</p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus size={18} />
          New Runbook
        </Link>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search runbooks..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-all">
          <Filter size={18} />
          Filter
        </button>
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
          <FileText size={32} className="text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No runbooks yet</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Create your first runbook to start documenting your technical procedures.
        </p>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus size={18} />
          Create Runbook
        </Link>
      </motion.div>
    </div>
  );
}

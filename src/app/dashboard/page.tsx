'use client'

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Sparkles, 
  Clock, 
  TrendingUp,
  ArrowRight,
  BookOpen
} from "lucide-react";

const quickActions = [
  {
    title: 'Create Runbook',
    description: 'Start from scratch with our form builder',
    icon: Plus,
    href: '/dashboard/create',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    title: 'AI Import',
    description: 'Paste text and let AI structure it',
    icon: Sparkles,
    href: '/dashboard/import',
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Browse Templates',
    description: 'Start with a pre-built template',
    icon: BookOpen,
    href: '/dashboard/templates',
    color: 'from-sky-500 to-blue-500',
  },
];

const stats = [
  { label: 'Total Runbooks', value: '0', icon: FileText },
  { label: 'This Month', value: '0', icon: TrendingUp },
  { label: 'Last Updated', value: 'Never', icon: Clock },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-slate-400">
          Create, manage, and share your technical runbooks.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={action.title}
              href={action.href}
              className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                {action.title}
                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-slate-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={18} className="text-slate-500" />
                <span className="text-sm text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Runbooks (Empty State) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Runbooks</h2>
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <FileText size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No runbooks yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Create your first runbook to start documenting your technical procedures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20"
            >
              <Plus size={18} />
              Create Runbook
            </Link>
            <Link
              href="/dashboard/import"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 rounded-lg text-white font-semibold hover:bg-slate-700 transition-all"
            >
              <Sparkles size={18} />
              AI Import
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

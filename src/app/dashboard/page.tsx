'use client'

import { useState, useEffect, useCallback } from "react";
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
  BookOpen,
  Loader2
} from "lucide-react";

interface Runbook {
  id: string;
  title: string;
  description: string | null;
  sections: any[];
  updated_at: string;
  created_at: string;
}

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

export default function DashboardPage() {
  const { user } = useUser();
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  const fetchRunbooks = useCallback(async () => {
    try {
      const response = await fetch('/api/runbooks');
      if (response.ok) {
        const data = await response.json();
        setRunbooks(data);
      }
    } catch (error) {
      console.error('Error fetching runbooks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunbooks();
  }, [fetchRunbooks]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getThisMonthCount = () => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return runbooks.filter(r => new Date(r.created_at) >= firstOfMonth).length;
  };

  const getLastUpdated = () => {
    if (runbooks.length === 0) return 'Never';
    const latest = runbooks.reduce((a, b) => 
      new Date(a.updated_at) > new Date(b.updated_at) ? a : b
    );
    return formatDate(latest.updated_at);
  };

  const stats = [
    { label: 'Total Runbooks', value: runbooks.length.toString(), icon: FileText },
    { label: 'This Month', value: getThisMonthCount().toString(), icon: TrendingUp },
    { label: 'Last Updated', value: getLastUpdated(), icon: Clock },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Create, manage, and share your technical runbooks.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={action.title}
              href={action.href}
              className="group p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={20} className="text-white sm:hidden" />
                <action.icon size={24} className="text-white hidden sm:block" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 flex items-center gap-2">
                {action.title}
                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3 sm:mb-4">Overview</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 sm:p-6 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <stat.icon size={16} className="text-slate-500 sm:hidden" />
                <stat.icon size={18} className="text-slate-500 hidden sm:block" />
                <span className="text-xs sm:text-sm text-slate-400 truncate">{stat.label}</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : stat.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Runbooks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Runbooks</h2>
          {runbooks.length > 0 && (
            <Link href="/dashboard/runbooks" className="text-sm text-teal-400 hover:text-teal-300">
              View all →
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-teal-500 animate-spin" />
          </div>
        )}

        {!isLoading && runbooks.length === 0 && (
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
        )}

        {!isLoading && runbooks.length > 0 && (
          <div className="space-y-3">
            {runbooks.slice(0, 5).map((runbook) => (
              <Link
                key={runbook.id}
                href={`/dashboard/runbooks/${runbook.id}`}
                className="block p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors truncate">
                      {runbook.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {runbook.sections?.length || 0} sections • Updated {formatDate(runbook.updated_at)}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

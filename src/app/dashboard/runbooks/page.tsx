'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, Search, Filter, MoreVertical, Trash2, Edit, Eye, Loader2 } from "lucide-react";

interface Runbook {
  id: string;
  title: string;
  description: string | null;
  sections: any[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRunbooks();
  }, []);

  const fetchRunbooks = async () => {
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this runbook?')) return;
    
    setDeleteId(id);
    try {
      const response = await fetch(`/api/runbooks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRunbooks(runbooks.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting runbook:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredRunbooks = runbooks.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const countBlocks = (sections: any[]) => {
    return sections?.reduce((acc, section) => acc + (section.blocks?.length || 0), 0) || 0;
  };

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-teal-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRunbooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <FileText size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery ? 'No runbooks found' : 'No runbooks yet'}
          </h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try a different search term'
              : 'Create your first runbook to start documenting your technical procedures.'
            }
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20"
            >
              <Plus size={18} />
              Create Runbook
            </Link>
          )}
        </motion.div>
      )}

      {/* Runbooks List */}
      {!isLoading && filteredRunbooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredRunbooks.map((runbook, index) => (
            <motion.div
              key={runbook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/dashboard/runbooks/${runbook.id}`}
                    className="block"
                  >
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors truncate">
                      {runbook.title}
                    </h3>
                  </Link>
                  {runbook.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {runbook.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{runbook.sections?.length || 0} sections</span>
                    <span>•</span>
                    <span>{countBlocks(runbook.sections)} blocks</span>
                    <span>•</span>
                    <span>Updated {formatDate(runbook.updated_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/runbooks/${runbook.id}`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/dashboard/runbooks/${runbook.id}/edit`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(runbook.id)}
                    disabled={deleteId === runbook.id}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleteId === runbook.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

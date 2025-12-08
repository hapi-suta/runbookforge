'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Search,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Batch {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  access_code: string;
  module_count: number;
  student_count: number;
  created_at: string;
  updated_at: string;
}

export default function TrainingCenterPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [newBatchTitle, setNewBatchTitle] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/training/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBatch = async () => {
    if (!newBatchTitle.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/training/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBatchTitle,
          description: newBatchDesc
        })
      });
      
      if (response.ok) {
        const newBatch = await response.json();
        setBatches([{ ...newBatch, module_count: 0, student_count: 0 }, ...batches]);
        setShowNewBatch(false);
        setNewBatchTitle('');
        setNewBatchDesc('');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch? This will remove all modules, content, and student enrollments.')) return;
    
    try {
      const response = await fetch(`/api/training/batches/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setBatches(batches.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const copyAccessCode = (code: string) => {
    const studentUrl = `${window.location.origin}/training/${code}`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBatches = batches.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1"><CheckCircle size={12} /> Active</span>;
      case 'draft':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1"><Clock size={12} /> Draft</span>;
      case 'archived':
        return <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-xs rounded-full flex items-center gap-1"><AlertCircle size={12} /> Archived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="text-purple-400" />
            Training Center
          </h1>
          <p className="text-slate-400 mt-1">Create and manage training batches for your students</p>
        </div>
        <button
          onClick={() => setShowNewBatch(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus size={18} />
          New Batch
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search batches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
        />
      </div>

      {/* New Batch Modal */}
      <AnimatePresence>
        {showNewBatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewBatch(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create New Batch</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    value={newBatchTitle}
                    onChange={(e) => setNewBatchTitle(e.target.value)}
                    placeholder="e.g., Batch 01 - PostgreSQL Fundamentals"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newBatchDesc}
                    onChange={(e) => setNewBatchDesc(e.target.value)}
                    placeholder="Brief description of this training batch..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewBatch(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBatch}
                  disabled={!newBatchTitle.trim() || isCreating}
                  className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Batch'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batches List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-purple-400 animate-spin" />
        </div>
      ) : filteredBatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center"
        >
          <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No batches found' : 'No training batches yet'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery 
              ? 'Try a different search term' 
              : 'Create your first batch to start organizing training content for your students.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowNewBatch(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 rounded-lg text-white font-semibold hover:bg-purple-600 transition-colors"
            >
              <Plus size={18} />
              Create First Batch
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredBatches.map((batch, index) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/dashboard/training/${batch.id}`}
                      className="text-lg font-semibold text-white hover:text-purple-400 transition-colors truncate"
                    >
                      {batch.title}
                    </Link>
                    {getStatusBadge(batch.status)}
                  </div>
                  
                  {batch.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{batch.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <BookOpen size={16} />
                      <span>{batch.module_count} modules</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={16} />
                      <span>{batch.student_count} students</span>
                    </div>
                    <button
                      onClick={() => copyAccessCode(batch.access_code)}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {copiedCode === batch.access_code ? (
                        <>
                          <Check size={16} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy Student Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/training/${batch.id}`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <Link
                    href={`/training/${batch.access_code}`}
                    target="_blank"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Preview Student View"
                  >
                    <ExternalLink size={18} />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === batch.id ? null : batch.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {activeMenu === batch.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              deleteBatch(batch.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete Batch
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Plus, Users, BookOpen, MoreVertical, Edit, Trash2,
  ExternalLink, Copy, Check, Loader2, Search, FolderOpen, Clock,
  CheckCircle, AlertCircle, BookMarked, Briefcase, Award, Layers
} from 'lucide-react';

interface Batch {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  access_code: string;
  template: string;
  module_count: number;
  student_count: number;
  created_at: string;
}

const TEMPLATES = [
  { id: 'technical_course', name: 'Technical Course', icon: BookMarked, color: 'from-blue-500 to-indigo-500', description: 'Full course with presentations, tutorials, quizzes & assignments' },
  { id: 'workshop', name: 'Workshop/Bootcamp', icon: Layers, color: 'from-orange-500 to-red-500', description: 'Intensive hands-on training with challenges and labs' },
  { id: 'interview_prep', name: 'Interview Prep', icon: Briefcase, color: 'from-green-500 to-emerald-500', description: 'Question banks, mock interviews & AI evaluation' },
  { id: 'certification', name: 'Certification Prep', icon: Award, color: 'from-purple-500 to-pink-500', description: 'Study guides and practice exams' },
  { id: 'custom', name: 'Custom', icon: Plus, color: 'from-slate-500 to-slate-600', description: 'Start with a blank slate' }
];

export default function TrainingCenterPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('technical_course');
  const [newBatchTitle, setNewBatchTitle] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/training/batches');
      if (response.ok) setBatches(await response.json());
    } catch (error) {
      console.error('Error:', error);
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
        body: JSON.stringify({ title: newBatchTitle, description: newBatchDesc, template: selectedTemplate })
      });
      if (response.ok) {
        setBatches([await response.json(), ...batches]);
        setShowNewBatch(false);
        setNewBatchTitle('');
        setNewBatchDesc('');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm('Delete this batch and all content?')) return;
    const response = await fetch(`/api/training/batches/${id}`, { method: 'DELETE' });
    if (response.ok) setBatches(batches.filter(b => b.id !== id));
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/training/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id) || TEMPLATES[4];
  const filtered = batches.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="text-purple-400" /> Training Center
          </h1>
          <p className="text-slate-400 mt-1">Create and manage training batches for your students</p>
        </div>
        <button onClick={() => setShowNewBatch(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/20">
          <Plus size={18} /> New Batch
        </button>
      </motion.div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Search batches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50" />
      </div>

      {/* New Batch Modal */}
      <AnimatePresence>
        {showNewBatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowNewBatch(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-6">Create New Training Batch</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Choose a Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTemplate === t.id ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${t.color} flex items-center justify-center`}>
                          <t.icon size={20} className="text-white" />
                        </div>
                        <span className="font-semibold text-white">{t.name}</span>
                      </div>
                      <p className="text-sm text-slate-400">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Batch Name *</label>
                  <input type="text" value={newBatchTitle} onChange={(e) => setNewBatchTitle(e.target.value)} placeholder="e.g., Batch 01 - PostgreSQL Fundamentals" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea value={newBatchDesc} onChange={(e) => setNewBatchDesc(e.target.value)} placeholder="Brief description..." rows={3} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewBatch(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Cancel</button>
                <button onClick={createBatch} disabled={!newBatchTitle.trim() || isCreating} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isCreating ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Batch'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batches List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-purple-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{searchQuery ? 'No batches found' : 'No training batches yet'}</h3>
          <p className="text-slate-400 mb-6">{searchQuery ? 'Try a different search' : 'Create your first batch to get started.'}</p>
          {!searchQuery && <button onClick={() => setShowNewBatch(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 rounded-lg text-white font-semibold"><Plus size={18} /> Create First Batch</button>}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((batch, i) => {
            const t = getTemplate(batch.template);
            return (
              <motion.div key={batch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${t.color} flex items-center justify-center`}>
                        <t.icon size={16} className="text-white" />
                      </div>
                      <Link href={`/dashboard/training/${batch.id}`} className="text-lg font-semibold text-white hover:text-purple-400 truncate">{batch.title}</Link>
                      <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${batch.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : batch.status === 'draft' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {batch.status === 'active' ? <CheckCircle size={12} /> : batch.status === 'draft' ? <Clock size={12} /> : <AlertCircle size={12} />} {batch.status}
                      </span>
                    </div>
                    {batch.description && <p className="text-slate-400 text-sm mb-3 ml-11 line-clamp-2">{batch.description}</p>}
                    <div className="flex items-center gap-6 text-sm ml-11">
                      <span className="flex items-center gap-2 text-slate-400"><BookOpen size={16} /> {batch.module_count} modules</span>
                      <span className="flex items-center gap-2 text-slate-400"><Users size={16} /> {batch.student_count} students</span>
                      <button onClick={() => copyLink(batch.access_code)} className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                        {copiedCode === batch.access_code ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/training/${batch.id}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit size={18} /></Link>
                    <Link href={`/training/${batch.access_code}`} target="_blank" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><ExternalLink size={18} /></Link>
                    <div className="relative">
                      <button onClick={() => setActiveMenu(activeMenu === batch.id ? null : batch.id)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><MoreVertical size={18} /></button>
                      <AnimatePresence>
                        {activeMenu === batch.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                            <button onClick={() => { deleteBatch(batch.id); setActiveMenu(null); }} className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"><Trash2 size={16} /> Delete</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

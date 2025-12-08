'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Library,
  Search,
  Filter,
  Database,
  GitBranch,
  Cloud,
  Container,
  Shield,
  Activity,
  Network,
  Terminal,
  ThumbsUp,
  Eye,
  Clock,
  ChevronRight,
  Plus,
  Loader2,
  FileText,
  Presentation,
  X,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  entry_count: number;
  subcategories: Category[];
}

interface KBEntry {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  view_count: number;
  helpful_count: number;
  submitted_at: string;
  tags: string[];
  kb_categories: { id: string; name: string; slug: string; icon: string } | null;
  runbooks: { id: string; title: string; description: string } | null;
  documents: { id: string; title: string; description: string; file_type: string } | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Database, GitBranch, Cloud, Container, Shield, Activity, Network, Terminal
};

export default function KnowledgeBasePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [mySubmissions, setMySubmissions] = useState<KBEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'submit' | 'my'>('browse');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Submit form state
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitCategory, setSubmitCategory] = useState('');
  const [submitDifficulty, setSubmitDifficulty] = useState('intermediate');
  const [submitRunbookId, setSubmitRunbookId] = useState('');
  const [submitDocId, setSubmitDocId] = useState('');
  const [submitTags, setSubmitTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRunbooks, setUserRunbooks] = useState<{id: string; title: string}[]>([]);
  const [userDocs, setUserDocs] = useState<{id: string; title: string}[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchEntries();
    fetchMySubmissions();
    fetchUserContent();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/knowledge/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
      if (searchQuery) params.set('search', searchQuery);
      
      const res = await fetch(`/api/knowledge/entries?${params}`);
      if (res.ok) setEntries(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await fetch('/api/knowledge/entries?my=true');
      if (res.ok) setMySubmissions(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUserContent = async () => {
    try {
      const [rbRes, docRes] = await Promise.all([
        fetch('/api/runbooks'),
        fetch('/api/documents')
      ]);
      if (rbRes.ok) setUserRunbooks(await rbRes.json());
      if (docRes.ok) setUserDocs(await docRes.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (!submitTitle || (!submitRunbookId && !submitDocId)) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/knowledge/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: submitTitle,
          description: submitDesc,
          category_id: submitCategory || null,
          difficulty: submitDifficulty,
          runbook_id: submitRunbookId || null,
          document_id: submitDocId || null,
          tags: submitTags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      
      if (res.ok) {
        setShowSubmitModal(false);
        resetSubmitForm();
        fetchMySubmissions();
        alert('Submitted successfully! It will appear after admin approval.');
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const resetSubmitForm = () => {
    setSubmitTitle('');
    setSubmitDesc('');
    setSubmitCategory('');
    setSubmitDifficulty('intermediate');
    setSubmitRunbookId('');
    setSubmitDocId('');
    setSubmitTags('');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-400',
      approved: 'bg-emerald-500/20 text-emerald-400',
      rejected: 'bg-red-500/20 text-red-400'
    };
    return <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || ''}`}>{status}</span>;
  };

  const getDifficultyBadge = (diff: string) => {
    const styles: Record<string, string> = {
      beginner: 'bg-green-500/20 text-green-400',
      intermediate: 'bg-blue-500/20 text-blue-400',
      advanced: 'bg-purple-500/20 text-purple-400'
    };
    return <span className={`px-2 py-0.5 rounded text-xs ${styles[diff] || ''}`}>{diff}</span>;
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
            <Library className="text-blue-400" />
            Knowledge Base
          </h1>
          <p className="text-slate-400 mt-1">Community-contributed runbooks and guides</p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
        >
          <Plus size={18} />
          Submit Runbook
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 rounded-lg p-1 w-fit">
        {[
          { id: 'browse', label: 'Browse' },
          { id: 'my', label: 'My Submissions', count: mySubmissions.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => {
                  const Icon = ICON_MAP[cat.icon] || Database;
                  return (
                    <div key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          selectedCategory === cat.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={16} />
                          {cat.name}
                        </span>
                        <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{cat.entry_count}</span>
                      </button>
                      {cat.subcategories?.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategory(sub.id)}
                          className={`w-full text-left pl-8 pr-3 py-1.5 text-sm transition-colors ${
                            selectedCategory === sub.id ? 'text-blue-400' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <h3 className="font-semibold text-white mb-3">Difficulty</h3>
                <div className="space-y-1">
                  {['beginner', 'intermediate', 'advanced'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        selectedDifficulty === diff ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Entries */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-blue-400 animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Library size={48} className="mx-auto mb-4 opacity-50" />
                <p>No entries found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.runbooks ? 'bg-teal-500/20' : 'bg-amber-500/20'
                      }`}>
                        {entry.runbooks ? <FileText className="text-teal-400" size={20} /> : <Presentation className="text-amber-400" size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{entry.title}</h3>
                          {getDifficultyBadge(entry.difficulty)}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-2">{entry.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {entry.kb_categories && (
                            <span className="flex items-center gap-1">
                              <Database size={12} />
                              {entry.kb_categories.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {entry.view_count} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} />
                            {entry.helpful_count} helpful
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        href={entry.runbooks ? `/view/runbook/${entry.runbooks.id}` : `/view/presentation?id=${entry.documents?.id}`}
                        target="_blank"
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my' && (
        <div className="space-y-3">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Send size={48} className="mx-auto mb-4 opacity-50" />
              <p>You haven't submitted any runbooks yet</p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Submit Your First Runbook
              </button>
            </div>
          ) : (
            mySubmissions.map(entry => (
              <div key={entry.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{entry.title}</h3>
                      {getStatusBadge(entry.status)}
                    </div>
                    <p className="text-sm text-slate-400">{entry.description}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    Submitted {new Date(entry.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Submit to Knowledge Base</h2>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={submitTitle}
                    onChange={(e) => setSubmitTitle(e.target.value)}
                    placeholder="e.g., PostgreSQL Backup and Recovery Guide"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={submitDesc}
                    onChange={(e) => setSubmitDesc(e.target.value)}
                    placeholder="Brief description of what this covers..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={submitCategory}
                      onChange={(e) => setSubmitCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name}</option>
                          {cat.subcategories?.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                    <select
                      value={submitDifficulty}
                      onChange={(e) => setSubmitDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Runbook</label>
                  <select
                    value={submitRunbookId}
                    onChange={(e) => { setSubmitRunbookId(e.target.value); setSubmitDocId(''); }}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="">Select a runbook...</option>
                    {userRunbooks.map(rb => (
                      <option key={rb.id} value={rb.id}>{rb.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Or Select Document</label>
                  <select
                    value={submitDocId}
                    onChange={(e) => { setSubmitDocId(e.target.value); setSubmitRunbookId(''); }}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="">Select a document...</option>
                    {userDocs.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={submitTags}
                    onChange={(e) => setSubmitTags(e.target.value)}
                    placeholder="postgresql, backup, recovery"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!submitTitle || (!submitRunbookId && !submitDocId) || isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Submit for Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

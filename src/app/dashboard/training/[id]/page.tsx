'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, BookOpen, Settings, Trash2, ExternalLink, Copy, Check, Loader2,
  ChevronDown, ChevronRight, FileText, Presentation, Link as LinkIcon, UserPlus, X, Save, Sparkles,
  Video, HelpCircle, Target, ClipboardList, MessageSquare, Wrench, FolderOpen, Briefcase, ClipboardCheck, Send,
  CheckCircle, Clock, Archive, Zap, GraduationCap, Mail, Globe, Hash
} from 'lucide-react';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string; shadow: string }> = {
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-500', shadow: 'shadow-teal-500/25' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/25' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/25' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/25' },
};

const CONTENT_TYPES = [
  { id: 'presentation', name: 'Presentation', icon: Presentation, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'runbook', name: 'Runbook', icon: FileText, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { id: 'tutorial', name: 'Tutorial', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'assignment', name: 'Assignment', icon: ClipboardList, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'challenge', name: 'Challenge', icon: Target, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'interview_prep', name: 'Interview Prep', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'recording', name: 'Recording', icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'external_link', name: 'External Link', icon: LinkIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

interface Section { id: string; section_key: string; title: string; description: string; icon: string; color: string; sort_order: number; is_enabled: boolean; }
interface Content { id: string; title: string; content_type: string; document_id?: string; runbook_id?: string; external_url?: string; content_data?: Record<string, unknown>; sort_order: number; }
interface Module { id: string; section_id?: string; title: string; description?: string; sort_order: number; is_published: boolean; training_content: Content[]; }
interface Enrollment { id: string; student_email: string; student_name?: string; status: string; enrolled_at: string; access_token: string; }
interface Batch { id: string; title: string; description?: string; status: 'draft' | 'active' | 'archived'; access_code: string; settings?: { template_type?: string }; training_sections: Section[]; training_modules: Module[]; training_enrollments: Enrollment[]; }

export default function BatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'settings'>('content');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Modal states
  const [showAddContent, setShowAddContent] = useState<Section | null>(null);
  const [showEnrollStudents, setShowEnrollStudents] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState<{ section: Section; contentType: string } | null>(null);
  
  // Form states
  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState('presentation');
  const [contentUrl, setContentUrl] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Generate states
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { 
    if (id) fetchBatch(); 
  }, [id]);

  const fetchBatch = async () => {
    try {
      const res = await fetch(`/api/training/batches/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to load batch');
        setIsLoading(false);
        return;
      }
      
      const sections = Array.isArray(data.training_sections) ? data.training_sections : [];
      const modules = Array.isArray(data.training_modules) ? data.training_modules : [];
      const enrollments = Array.isArray(data.training_enrollments) ? data.training_enrollments : [];
      
      setBatch({
        id: data.id,
        title: data.title || 'Untitled Batch',
        description: data.description || '',
        status: data.status || 'draft',
        access_code: data.access_code || '',
        settings: data.settings || {},
        training_sections: sections,
        training_modules: modules.map((m: Module) => ({ 
          ...m, 
          training_content: Array.isArray(m.training_content) ? m.training_content : [] 
        })),
        training_enrollments: enrollments
      });
      
      if (sections.length > 0) {
        setExpandedSections(new Set(sections.map((s: Section) => s.id)));
      }
    } catch (e) {
      console.error('Fetch batch error:', e);
      setError('Failed to load batch');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(sectionId)) newSet.delete(sectionId);
    else newSet.add(sectionId);
    setExpandedSections(newSet);
  };

  const copyEnrollLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/training/${batch?.access_code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/training/batches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchBatch();
    } catch (e) { console.error(e); }
  };

  const enrollStudents = async () => {
    if (!studentEmails.trim()) return;
    setIsSubmitting(true);
    try {
      const emails = studentEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
      const res = await fetch(`/api/training/batches/${id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });
      if (res.ok) {
        setShowEnrollStudents(false);
        setStudentEmails('');
        fetchBatch();
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const addContent = async (section: Section) => {
    if (!contentTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/training/batches/${id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: section.id,
          title: contentTitle,
          content_type: contentType,
          external_url: contentUrl || null
        })
      });
      if (res.ok) {
        setShowAddContent(null);
        setContentTitle('');
        setContentType('presentation');
        setContentUrl('');
        fetchBatch();
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim() || !showAIGenerate) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: showAIGenerate.contentType,
          topic: aiTopic,
          difficulty: aiDifficulty
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPreview(data.content);
      }
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const saveGeneratedContent = async () => {
    if (!generatedPreview || !showAIGenerate) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/training/batches/${id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: showAIGenerate.section.id,
          title: (generatedPreview as { title?: string }).title || aiTopic,
          content_type: showAIGenerate.contentType,
          content_data: generatedPreview
        })
      });
      if (res.ok) {
        setShowAIGenerate(null);
        setAiTopic('');
        setGeneratedPreview(null);
        fetchBatch();
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Delete this content?')) return;
    try {
      const res = await fetch(`/api/training/content/${contentId}`, { method: 'DELETE' });
      if (res.ok) fetchBatch();
    } catch (e) { console.error(e); }
  };

  const removeStudent = async (enrollmentId: string) => {
    if (!confirm('Remove this student?')) return;
    try {
      const res = await fetch(`/api/training/batches/${id}/enroll/${enrollmentId}`, { method: 'DELETE' });
      if (res.ok) fetchBatch();
    } catch (e) { console.error(e); }
  };

  const getContentForSection = (sectionId: string): Content[] => {
    if (!batch?.training_modules) return [];
    return batch.training_modules
      .filter(m => m.section_id === sectionId)
      .flatMap(m => Array.isArray(m.training_content) ? m.training_content : []);
  };

  const getSectionContentTypes = (sectionKey: string) => {
    const mapping: Record<string, string[]> = {
      learn: ['presentation', 'tutorial', 'external_link', 'recording'],
      practice: ['runbook', 'tutorial', 'challenge'],
      assess: ['quiz', 'assignment', 'challenge'],
      resources: ['runbook', 'external_link', 'recording'],
      career: ['interview_prep', 'quiz', 'external_link'],
    };
    return CONTENT_TYPES.filter(ct => mapping[sectionKey]?.includes(ct.id) || !mapping[sectionKey]);
  };

  const getContentTypeInfo = (typeId: string) => CONTENT_TYPES.find(ct => ct.id === typeId) || CONTENT_TYPES[0];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
          <Loader2 size={32} className="text-purple-400 animate-spin" />
        </div>
        <p className="text-slate-400">Loading batch details...</p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
          <X size={32} className="text-red-400" />
        </div>
        <p className="text-red-400 mb-4">{error || 'Batch not found'}</p>
        <Link href="/dashboard/training" className="text-purple-400 hover:text-purple-300 flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Training Center
        </Link>
      </div>
    );
  }

  const totalContent = batch.training_sections.reduce((acc, s) => acc + getContentForSection(s.id).length, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard/training" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Training Center
        </Link>
        
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 border border-slate-700/50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <GraduationCap size={26} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">{batch.title}</h1>
                    {batch.description && (
                      <p className="text-slate-400 mt-1">{batch.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10">
                    <BookOpen size={18} className="text-purple-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{totalContent}</div>
                      <div className="text-xs text-slate-500">Content Items</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10">
                    <Users size={18} className="text-blue-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{batch.training_enrollments?.length || 0}</div>
                      <div className="text-xs text-slate-500">Students</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10">
                    <FolderOpen size={18} className="text-amber-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{batch.training_sections?.length || 0}</div>
                      <div className="text-xs text-slate-500">Sections</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status & Actions */}
              <div className="flex flex-col gap-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium self-start ${
                  batch.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : batch.status === 'archived' 
                    ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {batch.status === 'active' ? <CheckCircle size={16} /> : batch.status === 'archived' ? <Archive size={16} /> : <Clock size={16} />}
                  {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                </div>
                
                <div className="flex gap-2">
                  <motion.button 
                    onClick={copyEnrollLink} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </motion.button>
                  
                  {batch.status === 'draft' && (
                    <motion.button 
                      onClick={() => updateStatus('active')} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 rounded-xl text-white font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"
                    >
                      <Zap size={16} />
                      Publish
                    </motion.button>
                  )}
                  {batch.status === 'active' && (
                    <motion.button 
                      onClick={() => updateStatus('archived')} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 rounded-xl text-white font-medium hover:bg-slate-500 transition-all"
                    >
                      <Archive size={16} />
                      Archive
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 p-1.5 bg-slate-800/50 rounded-2xl w-fit border border-slate-700/50"
      >
        {[
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'students', label: 'Students', icon: Users, count: batch?.training_enrollments?.length ?? 0 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {(!batch?.training_sections || batch.training_sections.length === 0) ? (
            <div className="relative overflow-hidden text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700/50">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                  <FolderOpen size={36} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Sections Found</h3>
                <p className="text-slate-400">This batch was created without a template.</p>
              </div>
            </div>
          ) : (
            batch.training_sections.sort((a, b) => a.sort_order - b.sort_order).map((section, idx) => {
              const Icon = SECTION_ICONS[section.section_key] || FolderOpen;
              const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
              const sectionContent = getContentForSection(section.id);
              const isExpanded = expandedSections.has(section.id);

              return (
                <motion.div 
                  key={section.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-slate-800/30 border rounded-2xl overflow-hidden transition-all ${colors.border} ${isExpanded ? 'shadow-lg' : ''}`}
                >
                  <button 
                    onClick={() => toggleSection(section.id)} 
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.shadow}`}>
                        <Icon className="text-white" size={22} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-white text-lg">{section.title}</h3>
                        <p className="text-sm text-slate-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${colors.bg} ${colors.text}`}>
                        {sectionContent.length} items
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="text-slate-400" size={20} />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          {sectionContent.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              {sectionContent.map((content) => {
                                const typeInfo = getContentTypeInfo(content.content_type);
                                return (
                                  <motion.div 
                                    key={content.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 group hover:border-slate-600 transition-all"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg ${typeInfo.bg} flex items-center justify-center`}>
                                        <typeInfo.icon size={18} className={typeInfo.color} />
                                      </div>
                                      <div>
                                        <span className="text-white font-medium">{content.title}</span>
                                        <span className="text-xs text-slate-500 ml-2 capitalize">
                                          {content.content_type.replace('_', ' ')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {content.external_url && (
                                        <a href={content.external_url} target="_blank" rel="noopener" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                                          <ExternalLink size={16} />
                                        </a>
                                      )}
                                      <button onClick={() => deleteContent(content.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700 mb-4">
                              <FolderOpen size={28} className="mx-auto mb-2 opacity-50" />
                              <p>No content in this section yet</p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <motion.button 
                              onClick={() => setShowAddContent(section)} 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white text-sm font-medium transition-all"
                            >
                              <Plus size={16} /> Add Content
                            </motion.button>
                            <motion.button 
                              onClick={() => setShowAIGenerate({ section, contentType: getSectionContentTypes(section.section_key)[0]?.id || 'quiz' })} 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 text-sm font-medium border border-purple-500/30 transition-all"
                            >
                              <Sparkles size={16} /> AI Generate
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-400">{batch?.training_enrollments?.length ?? 0} enrolled student(s)</p>
            <motion.button 
              onClick={() => setShowEnrollStudents(true)} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              <UserPlus size={18} /> Enroll Students
            </motion.button>
          </div>

          {(!batch?.training_enrollments || batch.training_enrollments.length === 0) ? (
            <div className="relative overflow-hidden text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700/50">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20">
                  <Users size={36} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Students Yet</h3>
                <p className="text-slate-400 mb-6">Start enrolling students to give them access to your content.</p>
                <motion.button 
                  onClick={() => setShowEnrollStudents(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 rounded-xl text-white font-medium"
                >
                  <UserPlus size={18} /> Enroll Your First Student
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Student</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Enrolled</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.training_enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-purple-500/20">
                            <Mail size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{enrollment.student_email}</div>
                            {enrollment.student_name && <div className="text-sm text-slate-500">{enrollment.student_name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                          enrollment.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {enrollment.status === 'active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeStudent(enrollment.id)} 
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Settings className="text-purple-400" size={22} />
            Batch Settings
          </h3>
          
          <div className="grid gap-6">
            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Hash size={16} className="text-purple-400" />
                Access Code
              </label>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-emerald-400 font-mono text-lg border border-slate-700">
                  {batch.access_code}
                </code>
                <motion.button 
                  onClick={copyEnrollLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 hover:text-white transition-all"
                >
                  <Copy size={18} />
                </motion.button>
              </div>
            </div>
            
            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Globe size={16} className="text-blue-400" />
                Student Portal URL
              </label>
              <code className="block px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-mono text-sm break-all border border-slate-700">
                {typeof window !== 'undefined' ? `${window.location.origin}/training/${batch.access_code}` : ''}
              </code>
            </div>
            
            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <CheckCircle size={16} className="text-emerald-400" />
                Status
              </label>
              <select 
                value={batch.status} 
                onChange={(e) => updateStatus(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Content Modal */}
      <AnimatePresence>
        {showAddContent && (
          <Modal onClose={() => setShowAddContent(null)} title="Add Content">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Content Type</label>
                <select 
                  value={contentType} 
                  onChange={(e) => setContentType(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                >
                  {getSectionContentTypes(showAddContent.section_key).map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Title <span className="text-purple-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={contentTitle} 
                  onChange={(e) => setContentTitle(e.target.value)} 
                  placeholder="Content title..." 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all" 
                />
              </div>
              {(contentType === 'external_link' || contentType === 'recording') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">URL</label>
                  <input 
                    type="url" 
                    value={contentUrl} 
                    onChange={(e) => setContentUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all" 
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddContent(null)} 
                className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <motion.button 
                onClick={() => addContent(showAddContent)} 
                disabled={!contentTitle.trim() || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Add Content'}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enroll Students Modal */}
      <AnimatePresence>
        {showEnrollStudents && (
          <Modal onClose={() => { setShowEnrollStudents(false); setStudentEmails(''); }} title="Enroll Students">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Addresses</label>
              <textarea 
                value={studentEmails} 
                onChange={(e) => setStudentEmails(e.target.value)} 
                placeholder="Enter emails separated by commas or new lines..." 
                rows={5} 
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all" 
              />
              <p className="text-xs text-slate-500 mt-2">Students will receive a unique access link via email.</p>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { setShowEnrollStudents(false); setStudentEmails(''); }} 
                className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <motion.button 
                onClick={enrollStudents} 
                disabled={!studentEmails.trim() || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Enroll</>}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIGenerate && (
          <Modal onClose={() => { setShowAIGenerate(null); setAiTopic(''); setGeneratedPreview(null); }} title="Generate with AI" wide>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Content Type</label>
                  <select 
                    value={showAIGenerate.contentType} 
                    onChange={(e) => setShowAIGenerate({ ...showAIGenerate, contentType: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  >
                    {getSectionContentTypes(showAIGenerate.section.section_key).map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Topic <span className="text-purple-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={aiTopic} 
                    onChange={(e) => setAiTopic(e.target.value)} 
                    placeholder="e.g., PostgreSQL Backup and Recovery" 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty</label>
                  <select 
                    value={aiDifficulty} 
                    onChange={(e) => setAiDifficulty(e.target.value as typeof aiDifficulty)} 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <motion.button 
                  onClick={generateWithAI} 
                  disabled={!aiTopic.trim() || isGenerating}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full px-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate</>}
                </motion.button>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-5 max-h-[400px] overflow-y-auto">
                {generatedPreview ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                      <Sparkles size={16} className="text-purple-400" />
                      <h4 className="font-semibold text-white">{(generatedPreview as { title?: string }).title || 'Generated Content'}</h4>
                    </div>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">{JSON.stringify(generatedPreview, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                      <Sparkles size={28} className="opacity-50" />
                    </div>
                    <p className="text-center">AI-generated preview<br />will appear here</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { setShowAIGenerate(null); setAiTopic(''); setGeneratedPreview(null); }} 
                className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <motion.button 
                onClick={saveGeneratedContent} 
                disabled={!generatedPreview || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save to Section</>}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title, wide = false }: { children: React.ReactNode; onClose: () => void; title: string; wide?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className={`bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto ${wide ? 'w-full max-w-3xl' : 'w-full max-w-md'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

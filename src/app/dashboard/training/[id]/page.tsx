'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, BookOpen, Settings, Trash2, ExternalLink, Copy, Check, Loader2,
  ChevronDown, ChevronRight, FileText, Presentation, Link as LinkIcon, Eye, UserPlus, X, Save, Sparkles,
  Video, HelpCircle, Target, ClipboardList, MessageSquare, Wrench, FolderOpen, Briefcase, ClipboardCheck,
  Edit3, Play, GraduationCap, MoreVertical, Clock, Award, Layers, Link2
} from 'lucide-react';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-500' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-indigo-500' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-green-500' },
};

const CONTENT_TYPES = [
  { id: 'presentation', name: 'Presentation', icon: Presentation, color: 'text-blue-400' },
  { id: 'runbook', name: 'Runbook', icon: FileText, color: 'text-emerald-400' },
  { id: 'tutorial', name: 'Tutorial', icon: BookOpen, color: 'text-purple-400' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, color: 'text-amber-400' },
  { id: 'assignment', name: 'Assignment', icon: ClipboardList, color: 'text-pink-400' },
  { id: 'challenge', name: 'Challenge', icon: Target, color: 'text-red-400' },
  { id: 'interview_prep', name: 'Interview Prep', icon: MessageSquare, color: 'text-cyan-400' },
  { id: 'recording', name: 'Recording', icon: Video, color: 'text-rose-400' },
  { id: 'external_link', name: 'External Link', icon: LinkIcon, color: 'text-slate-400' },
];

interface Section { id: string; section_key: string; title: string; description: string; icon: string; color: string; sort_order: number; is_enabled: boolean; }
interface Content { id: string; title: string; content_type: string; document_id?: string; runbook_id?: string; external_url?: string; content_data?: Record<string, unknown>; sort_order: number; estimated_minutes?: number; }
interface Module { id: string; section_id?: string; title: string; description?: string; sort_order: number; is_published: boolean; training_content: Content[]; }
interface Enrollment { id: string; student_email: string; student_name?: string; status: string; enrolled_at: string; access_token: string; }
interface Batch { id: string; title: string; description?: string; status: 'draft' | 'active' | 'archived'; access_code: string; settings?: { template_type?: string }; training_sections: Section[]; training_modules: Module[]; training_enrollments: Enrollment[]; }
interface UserContent { runbooks: { id: string; title: string }[]; documents: { id: string; title: string }[]; }

export default function BatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
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
  const [showPreview, setShowPreview] = useState<Content | null>(null);
  const [showEditContent, setShowEditContent] = useState<Content | null>(null);
  const [showLinkContent, setShowLinkContent] = useState<Section | null>(null);
  
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
  
  // Link existing content
  const [userContent, setUserContent] = useState<UserContent | null>(null);
  const [linkType, setLinkType] = useState<'runbook' | 'document'>('runbook');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');

  useEffect(() => { 
    if (id) {
      fetchBatch();
      fetchUserContent();
    }
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

  const fetchUserContent = async () => {
    try {
      const res = await fetch('/api/training/user-content');
      if (res.ok) {
        const data = await res.json();
        setUserContent(data);
      }
    } catch (e) { console.error(e); }
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

  const previewAsStudent = () => {
    window.open(`/training/${batch?.access_code}?preview=true`, '_blank');
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

  const linkExistingContent = async (section: Section) => {
    if (!selectedLinkId) return;
    setIsSubmitting(true);
    try {
      const selectedItem = linkType === 'runbook' 
        ? userContent?.runbooks.find(r => r.id === selectedLinkId)
        : userContent?.documents.find(d => d.id === selectedLinkId);
      
      const res = await fetch(`/api/training/batches/${id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: section.id,
          title: selectedItem?.title || 'Linked Content',
          content_type: linkType,
          runbook_id: linkType === 'runbook' ? selectedLinkId : null,
          document_id: linkType === 'document' ? selectedLinkId : null
        })
      });
      if (res.ok) {
        setShowLinkContent(null);
        setSelectedLinkId('');
        fetchBatch();
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const generateContent = async () => {
    if (!aiTopic.trim() || !showAIGenerate) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: showAIGenerate.contentType, topic: aiTopic, difficulty: aiDifficulty })
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

  const updateContent = async (contentId: string, updates: Partial<Content>) => {
    try {
      const res = await fetch(`/api/training/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setShowEditContent(null);
        fetchBatch();
      }
    } catch (e) { console.error(e); }
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

  const getTotalContent = () => {
    return batch?.training_modules?.reduce((acc, m) => acc + (m.training_content?.length || 0), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading training batch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <X size={32} className="text-red-400" />
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/dashboard/training" className="text-purple-400 hover:underline">Go back to Training Center</Link>
      </div>
    );
  }

  if (!batch) {
    return <div className="text-center py-20"><p className="text-slate-400">Batch not found</p><Link href="/dashboard/training" className="text-purple-400 hover:underline">Go back</Link></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative mb-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-teal-500/5" />
        <div className="relative p-6 md:p-8">
          <Link href="/dashboard/training" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Training Center
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{batch.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      batch.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      batch.status === 'archived' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>{batch.status}</span>
                  </div>
                  {batch.description && <p className="text-slate-400 mt-1">{batch.description}</p>}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers size={18} className="text-purple-400" />
                  <span><strong className="text-white">{getTotalContent()}</strong> content items</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={18} className="text-teal-400" />
                  <span><strong className="text-white">{batch.training_enrollments?.length || 0}</strong> students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={18} className="text-amber-400" />
                  <span><strong className="text-white">{batch.training_sections?.length || 0}</strong> sections</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={previewAsStudent} 
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20"
              >
                <Eye size={18} /> Preview as Student
              </button>
              <button 
                onClick={copyEnrollLink} 
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 border border-slate-600 rounded-xl text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {copiedLink ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
              {batch.status === 'draft' && (
                <button onClick={() => updateStatus('active')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 rounded-xl text-white font-medium hover:bg-emerald-600 transition-colors">
                  <Play size={18} /> Publish
                </button>
              )}
              {batch.status === 'active' && (
                <button onClick={() => updateStatus('archived')} className="px-4 py-2.5 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors">
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-800/50 rounded-xl p-1.5 w-fit border border-slate-700/50">
        {[
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'students', label: 'Students', icon: Users, count: batch?.training_enrollments?.length ?? 0 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {(!batch?.training_sections || batch.training_sections.length === 0) ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Sections Yet</h3>
              <p className="text-slate-400 mb-6">This batch was created without a template.</p>
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
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm"
                >
                  {/* Section Header */}
                  <button 
                    onClick={() => toggleSection(section.id)} 
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="text-white" size={22} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                        <p className="text-sm text-slate-400">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                        {sectionContent.length} {sectionContent.length === 1 ? 'item' : 'items'}
                      </span>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="text-slate-400" size={22} />
                      </motion.div>
                    </div>
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2">
                          {sectionContent.length > 0 ? (
                            <div className="space-y-3 mb-5">
                              {sectionContent.map((content, cIdx) => {
                                const contentTypeInfo = CONTENT_TYPES.find(ct => ct.id === content.content_type);
                                const ContentIcon = contentTypeInfo?.icon || FileText;
                                const iconColor = contentTypeInfo?.color || 'text-slate-400';
                                
                                return (
                                  <motion.div 
                                    key={content.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: cIdx * 0.03 }}
                                    className="group flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center`}>
                                        <ContentIcon size={20} className={iconColor} />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-white">{content.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-800 rounded">
                                            {content.content_type.replace('_', ' ')}
                                          </span>
                                          {content.estimated_minutes && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                              <Clock size={12} /> {content.estimated_minutes} min
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Content Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => setShowPreview(content)}
                                        className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                                        title="Preview"
                                      >
                                        <Eye size={18} />
                                      </button>
                                      <button 
                                        onClick={() => setShowEditContent(content)}
                                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                        title="Edit"
                                      >
                                        <Edit3 size={18} />
                                      </button>
                                      {content.external_url && (
                                        <a 
                                          href={content.external_url} 
                                          target="_blank" 
                                          rel="noopener" 
                                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                          title="Open External Link"
                                        >
                                          <ExternalLink size={18} />
                                        </a>
                                      )}
                                      <button 
                                        onClick={() => deleteContent(content.id)}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-10 mb-5 border-2 border-dashed border-slate-700 rounded-xl">
                              <FolderOpen size={32} className="mx-auto text-slate-600 mb-3" />
                              <p className="text-slate-500">No content in this section yet</p>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => setShowAddContent(section)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 border border-slate-600 rounded-xl text-slate-200 hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                              <Plus size={18} /> Add Content
                            </button>
                            <button 
                              onClick={() => setShowLinkContent(section)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 border border-slate-600 rounded-xl text-slate-200 hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                              <Link2 size={18} /> Link Existing
                            </button>
                            <button 
                              onClick={() => {
                                setShowAIGenerate({ section, contentType: getSectionContentTypes(section.section_key)[0]?.id || 'presentation' });
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-sm font-medium"
                            >
                              <Sparkles size={18} /> AI Generate
                            </button>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Enrolled Students</h2>
            <button 
              onClick={() => setShowEnrollStudents(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <UserPlus size={18} /> Enroll Students
            </button>
          </div>
          
          {batch.training_enrollments?.length > 0 ? (
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Student</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Enrolled</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.training_enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{enrollment.student_name || 'No name'}</p>
                          <p className="text-sm text-slate-400">{enrollment.student_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          enrollment.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          enrollment.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeStudent(enrollment.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Students Yet</h3>
              <p className="text-slate-400 mb-6">Enroll students to get started</p>
              <button 
                onClick={() => setShowEnrollStudents(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <UserPlus size={18} /> Enroll Students
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Access Code</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={batch.access_code} 
                  readOnly 
                  className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white font-mono"
                />
                <button 
                  onClick={copyEnrollLink}
                  className="px-4 py-3 bg-slate-700 rounded-xl text-white hover:bg-slate-600 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Students can join using this code at /training/{batch.access_code}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Student Portal URL</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/training/${batch.access_code}`}
                  readOnly 
                  className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-300 text-sm"
                />
                <button 
                  onClick={previewAsStudent}
                  className="px-4 py-3 bg-teal-500 rounded-xl text-white hover:bg-teal-600 transition-colors"
                >
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this batch? This cannot be undone.')) {
                    fetch(`/api/training/batches/${id}`, { method: 'DELETE' })
                      .then(() => router.push('/dashboard/training'));
                  }
                }}
                className="px-4 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Content Modal */}
      <AnimatePresence>
        {showAddContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Add Content</h2>
                <button onClick={() => setShowAddContent(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                  <select 
                    value={contentType} 
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {getSectionContentTypes(showAddContent.section_key).map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input 
                    type="text" 
                    value={contentTitle} 
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder="Enter content title"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {contentType === 'external_link' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                    <input 
                      type="url" 
                      value={contentUrl} 
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button onClick={() => setShowAddContent(null)} className="px-5 py-2.5 bg-slate-700 rounded-xl text-white hover:bg-slate-600">Cancel</button>
                <button 
                  onClick={() => addContent(showAddContent)}
                  disabled={!contentTitle.trim() || isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Add Content'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Existing Content Modal */}
      <AnimatePresence>
        {showLinkContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Link Existing Content</h2>
                <button onClick={() => setShowLinkContent(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setLinkType('runbook'); setSelectedLinkId(''); }}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${linkType === 'runbook' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    <FileText size={18} className="inline mr-2" /> Runbooks
                  </button>
                  <button
                    onClick={() => { setLinkType('document'); setSelectedLinkId(''); }}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${linkType === 'document' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    <Presentation size={18} className="inline mr-2" /> Documents
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {linkType === 'runbook' ? (
                    userContent?.runbooks?.length ? (
                      userContent.runbooks.map(rb => (
                        <button
                          key={rb.id}
                          onClick={() => setSelectedLinkId(rb.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                            selectedLinkId === rb.id ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-900 border border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <FileText size={18} className={selectedLinkId === rb.id ? 'text-emerald-400' : 'text-slate-400'} />
                          <span className="text-white">{rb.title}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-slate-500 py-8">No runbooks found</p>
                    )
                  ) : (
                    userContent?.documents?.length ? (
                      userContent.documents.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedLinkId(doc.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                            selectedLinkId === doc.id ? 'bg-blue-500/20 border border-blue-500' : 'bg-slate-900 border border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <Presentation size={18} className={selectedLinkId === doc.id ? 'text-blue-400' : 'text-slate-400'} />
                          <span className="text-white">{doc.title}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-slate-500 py-8">No documents found</p>
                    )
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button onClick={() => setShowLinkContent(null)} className="px-5 py-2.5 bg-slate-700 rounded-xl text-white hover:bg-slate-600">Cancel</button>
                <button 
                  onClick={() => linkExistingContent(showLinkContent)}
                  disabled={!selectedLinkId || isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Link Content'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <Eye size={20} className="text-teal-400" />
                  <h2 className="text-xl font-bold text-white">Preview: {showPreview.title}</h2>
                </div>
                <button onClick={() => setShowPreview(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                <div className="mb-4 flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300 capitalize">{showPreview.content_type.replace('_', ' ')}</span>
                  {showPreview.estimated_minutes && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock size={14} /> {showPreview.estimated_minutes} minutes
                    </span>
                  )}
                </div>
                
                {showPreview.content_data ? (
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto">
                      {JSON.stringify(showPreview.content_data, null, 2)}
                    </pre>
                  </div>
                ) : showPreview.external_url ? (
                  <div className="text-center py-10">
                    <ExternalLink size={48} className="mx-auto text-slate-500 mb-4" />
                    <p className="text-slate-400 mb-4">External Link</p>
                    <a href={showPreview.external_url} target="_blank" rel="noopener" className="text-teal-400 hover:underline">
                      {showPreview.external_url}
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    No preview available
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button onClick={() => { setShowEditContent(showPreview); setShowPreview(null); }} className="px-5 py-2.5 bg-purple-500 rounded-xl text-white font-medium hover:bg-purple-600">
                  <Edit3 size={18} className="inline mr-2" /> Edit
                </button>
                <button onClick={() => setShowPreview(null)} className="px-5 py-2.5 bg-slate-700 rounded-xl text-white hover:bg-slate-600">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Content Modal */}
      <AnimatePresence>
        {showEditContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <Edit3 size={20} className="text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Edit Content</h2>
                </div>
                <button onClick={() => setShowEditContent(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const form = e.target as HTMLFormElement; updateContent(showEditContent.id, { title: (form.elements.namedItem('title') as HTMLInputElement).value, external_url: (form.elements.namedItem('url') as HTMLInputElement)?.value || undefined }); }} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input 
                    name="title"
                    type="text" 
                    defaultValue={showEditContent.title}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                  <input 
                    type="text" 
                    value={showEditContent.content_type.replace('_', ' ')}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 capitalize"
                  />
                </div>
                {showEditContent.content_type === 'external_link' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                    <input 
                      name="url"
                      type="url" 
                      defaultValue={showEditContent.external_url || ''}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowEditContent(null)} className="px-5 py-2.5 bg-slate-700 rounded-xl text-white hover:bg-slate-600">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90">
                    <Save size={18} className="inline mr-2" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIGenerate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Generate with AI</h2>
                </div>
                <button onClick={() => { setShowAIGenerate(null); setGeneratedPreview(null); setAiTopic(''); }} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="flex divide-x divide-slate-700 h-[calc(90vh-180px)]">
                {/* Left: Form */}
                <div className="w-1/2 p-6 space-y-5 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                    <select 
                      value={showAIGenerate.contentType}
                      onChange={(e) => setShowAIGenerate({ ...showAIGenerate, contentType: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
                    >
                      {getSectionContentTypes(showAIGenerate.section.section_key).map(ct => (
                        <option key={ct.id} value={ct.id}>{ct.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
                    <input 
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g., PostgreSQL Backup and Recovery"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                    <select 
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as typeof aiDifficulty)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <button 
                    onClick={generateContent}
                    disabled={!aiTopic.trim() || isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Generating...</> : <><Sparkles size={18} /> Generate</>}
                  </button>
                </div>
                
                {/* Right: Preview */}
                <div className="w-1/2 p-6 overflow-y-auto bg-slate-900/30">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Preview</h3>
                  {generatedPreview ? (
                    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                      <h4 className="text-lg font-bold text-white mb-3">{(generatedPreview as { title?: string }).title}</h4>
                      <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-auto max-h-64">
                        {JSON.stringify(generatedPreview, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-500">
                      <div className="text-center">
                        <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
                        <p>Preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button onClick={() => { setShowAIGenerate(null); setGeneratedPreview(null); setAiTopic(''); }} className="px-5 py-2.5 bg-slate-700 rounded-xl text-white hover:bg-slate-600">Cancel</button>
                <button 
                  onClick={saveGeneratedContent}
                  disabled={!generatedPreview || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save to Section</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enroll Students Modal */}
      <AnimatePresence>
        {showEnrollStudents && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <UserPlus size={20} className="text-teal-400" />
                  <h2 className="text-xl font-bold text-white">Enroll Students</h2>
                </div>
                <button onClick={() => setShowEnrollStudents(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Addresses</label>
                <textarea 
                  value={studentEmails}
                  onChange={(e) => setStudentEmails(e.target.value)}
                  placeholder="Enter emails (one per line or comma-separated)"
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">Students will receive access to the training portal</p>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
                <button onClick={() => setShowEnrollStudents(false)} className="px-5 py-2.5 bg-slate-700 rounded-xl text-white hover:bg-slate-600">Cancel</button>
                <button 
                  onClick={enrollStudents}
                  disabled={!studentEmails.trim() || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Enroll</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

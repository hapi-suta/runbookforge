'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, BookOpen, Settings, Trash2, ExternalLink, Copy, Check, Loader2,
  ChevronDown, ChevronRight, FileText, Presentation, Link as LinkIcon, Eye, UserPlus, X, Save, Sparkles,
  Video, HelpCircle, Target, ClipboardList, MessageSquare, Wrench, FolderOpen, Briefcase, ClipboardCheck, Send
} from 'lucide-react';

const SECTION_ICONS: Record<string, React.ElementType> = {
  learn: BookOpen, practice: Wrench, assess: ClipboardCheck, resources: FolderOpen, career: Briefcase
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const CONTENT_TYPES = [
  { id: 'presentation', name: 'Presentation', icon: Presentation },
  { id: 'runbook', name: 'Runbook', icon: FileText },
  { id: 'tutorial', name: 'Tutorial', icon: BookOpen },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle },
  { id: 'assignment', name: 'Assignment', icon: ClipboardList },
  { id: 'challenge', name: 'Challenge', icon: Target },
  { id: 'interview_prep', name: 'Interview Prep', icon: MessageSquare },
  { id: 'recording', name: 'Recording', icon: Video },
  { id: 'external_link', name: 'External Link', icon: LinkIcon },
];

interface Section { id: string; section_key: string; title: string; description: string; icon: string; color: string; sort_order: number; is_enabled: boolean; }
interface Content { id: string; title: string; content_type: string; document_id?: string; runbook_id?: string; external_url?: string; content_data?: Record<string, unknown>; sort_order: number; }
interface Module { id: string; section_id?: string; title: string; description?: string; sort_order: number; is_published: boolean; training_content: Content[]; }
interface Enrollment { id: string; student_email: string; student_name?: string; status: string; enrolled_at: string; access_token: string; }
interface Batch { id: string; title: string; description?: string; status: 'draft' | 'active' | 'archived'; access_code: string; settings?: { template_type?: string }; training_sections: Section[]; training_modules: Module[]; training_enrollments: Enrollment[]; }

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
      console.log('Fetching batch:', id);
      const res = await fetch(`/api/training/batches/${id}`);
      const data = await res.json();
      console.log('Batch response:', res.status, data);
      
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 size={32} className="text-purple-400 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/dashboard/training" className="text-purple-400 hover:underline">Go back</Link>
      </div>
    );
  }

  if (!batch) {
    return <div className="text-center py-20"><p className="text-slate-400">Batch not found</p><Link href="/dashboard/training" className="text-purple-400 hover:underline">Go back</Link></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard/training" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={18} /> Back to Training Center
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{batch.title}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                batch.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                batch.status === 'archived' ? 'bg-slate-500/20 text-slate-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>{batch.status}</span>
            </div>
            {batch.description && <p className="text-slate-400 mt-1">{batch.description}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={copyEnrollLink} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
              {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
            {batch.status === 'draft' && (
              <button onClick={() => updateStatus('active')} className="px-4 py-2 bg-emerald-500 rounded-lg text-white font-medium hover:bg-emerald-600">Publish</button>
            )}
            {batch.status === 'active' && (
              <button onClick={() => updateStatus('archived')} className="px-4 py-2 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600">Archive</button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 rounded-lg p-1 w-fit">
        {[
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'students', label: 'Students', icon: Users, count: batch?.training_enrollments?.length ?? 0 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {(!batch?.training_sections || batch.training_sections.length === 0) ? (
            <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
              <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 mb-4">No sections found. This batch was created without a template.</p>
            </div>
          ) : (
            batch.training_sections.sort((a, b) => a.sort_order - b.sort_order).map((section) => {
              const Icon = SECTION_ICONS[section.section_key] || FolderOpen;
              const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
              const sectionContent = getContentForSection(section.id);
              const isExpanded = expandedSections.has(section.id);

              return (
                <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-slate-800/30 border rounded-xl overflow-hidden ${colors.border}`}>
                  <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon className={colors.text} size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{sectionContent.length} items</span>
                      {isExpanded ? <ChevronDown className="text-slate-400" size={20} /> : <ChevronRight className="text-slate-400" size={20} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      {sectionContent.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {sectionContent.map((content) => {
                            const contentTypeInfo = CONTENT_TYPES.find(ct => ct.id === content.content_type);
                            const ContentIcon = contentTypeInfo?.icon || FileText;
                            return (
                              <div key={content.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                  <ContentIcon size={18} className="text-slate-400" />
                                  <span className="text-white">{content.title}</span>
                                  <span className="text-xs text-slate-500 capitalize">{content.content_type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {content.external_url && (
                                    <a href={content.external_url} target="_blank" rel="noopener" className="p-1.5 text-slate-400 hover:text-white"><ExternalLink size={16} /></a>
                                  )}
                                  <button onClick={() => deleteContent(content.id)} className="p-1.5 text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 mb-4">No content yet</div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => setShowAddContent(section)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">
                          <Plus size={16} /> Add Content
                        </button>
                        <button onClick={() => setShowAIGenerate({ section, contentType: getSectionContentTypes(section.section_key)[0]?.id || 'quiz' })} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 text-sm border border-purple-500/30">
                          <Sparkles size={16} /> AI Generate
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400">{batch?.training_enrollments?.length ?? 0} enrolled student(s)</p>
            <button onClick={() => setShowEnrollStudents(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-lg text-white font-medium hover:bg-purple-600">
              <UserPlus size={18} /> Enroll Students
            </button>
          </div>

          {(!batch?.training_enrollments || batch.training_enrollments.length === 0) ? (
            <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No students enrolled yet</p>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Enrolled</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.training_enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-slate-700/50 last:border-0">
                      <td className="px-4 py-3 text-white">{enrollment.student_email}</td>
                      <td className="px-4 py-3 text-slate-400">{enrollment.student_name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${enrollment.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>{enrollment.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeStudent(enrollment.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Batch Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Access Code</label>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-slate-900 rounded text-emerald-400 font-mono">{batch.access_code}</code>
                <button onClick={copyEnrollLink} className="p-2 text-slate-400 hover:text-white"><Copy size={16} /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Student Portal URL</label>
              <code className="block px-3 py-2 bg-slate-900 rounded text-slate-300 font-mono text-sm break-all">{typeof window !== 'undefined' ? `${window.location.origin}/training/${batch.access_code}` : ''}</code>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select value={batch.status} onChange={(e) => updateStatus(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      <AnimatePresence>
        {showAddContent && (
          <Modal onClose={() => setShowAddContent(null)} title="Add Content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white">
                  {getSectionContentTypes(showAddContent.section_key).map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input type="text" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} placeholder="Content title..." className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
              {(contentType === 'external_link' || contentType === 'recording') && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                  <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddContent(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
              <button onClick={() => addContent(showAddContent)} disabled={!contentTitle.trim() || isSubmitting} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50">
                {isSubmitting ? <Loader2 size={18} className="mx-auto animate-spin" /> : 'Add Content'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enroll Students Modal */}
      <AnimatePresence>
        {showEnrollStudents && (
          <Modal onClose={() => { setShowEnrollStudents(false); setStudentEmails(''); }} title="Enroll Students">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Addresses</label>
              <textarea value={studentEmails} onChange={(e) => setStudentEmails(e.target.value)} placeholder="Enter emails separated by commas or new lines..." rows={5} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none" />
              <p className="text-xs text-slate-500 mt-2">Students will receive a unique access link.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEnrollStudents(false); setStudentEmails(''); }} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
              <button onClick={enrollStudents} disabled={!studentEmails.trim() || isSubmitting} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Enroll</>}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIGenerate && (
          <Modal onClose={() => { setShowAIGenerate(null); setAiTopic(''); setGeneratedPreview(null); }} title="Generate with AI" wide>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                  <select value={showAIGenerate.contentType} onChange={(e) => setShowAIGenerate({ ...showAIGenerate, contentType: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white">
                    {getSectionContentTypes(showAIGenerate.section.section_key).map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
                  <input type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., PostgreSQL Backup and Recovery" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                  <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value as typeof aiDifficulty)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <button onClick={generateWithAI} disabled={!aiTopic.trim() || isGenerating} className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate</>}
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4 max-h-[400px] overflow-y-auto">
                {generatedPreview ? (
                  <div>
                    <h4 className="font-semibold text-white mb-3">{(generatedPreview as { title?: string }).title || 'Generated Content'}</h4>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap">{JSON.stringify(generatedPreview, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
                    <p>Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAIGenerate(null); setAiTopic(''); setGeneratedPreview(null); }} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
              <button onClick={saveGeneratedContent} disabled={!generatedPreview || isSubmitting} className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save to Section</>}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title, wide = false }: { children: React.ReactNode; onClose: () => void; title: string; wide?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`bg-slate-900 rounded-2xl p-6 border border-slate-700 max-h-[90vh] overflow-y-auto ${wide ? 'w-full max-w-3xl' : 'w-full max-w-md'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

'use client'

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, BookOpen, Settings, Trash2, Edit, ExternalLink, Copy, Check, Loader2,
  GripVertical, ChevronDown, ChevronRight, FileText, Presentation, Link as LinkIcon, Play, Clock,
  Eye, UserPlus, X, Save, Sparkles, Video, HelpCircle, Target, ClipboardList, MessageSquare
} from 'lucide-react';

// Content type configurations
const CONTENT_TYPES = [
  { id: 'presentation', name: 'Presentation', icon: Presentation, color: 'text-amber-400', bgColor: 'bg-amber-500/20', description: 'Slides with speaker notes' },
  { id: 'runbook', name: 'Runbook', icon: FileText, color: 'text-teal-400', bgColor: 'bg-teal-500/20', description: 'Step-by-step how-to guide' },
  { id: 'tutorial', name: 'Tutorial', icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-500/20', description: 'Educational content with examples' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, color: 'text-purple-400', bgColor: 'bg-purple-500/20', description: 'Test knowledge with questions' },
  { id: 'assignment', name: 'Assignment', icon: ClipboardList, color: 'text-green-400', bgColor: 'bg-green-500/20', description: 'Hands-on task with rubric' },
  { id: 'challenge', name: 'Challenge', icon: Target, color: 'text-red-400', bgColor: 'bg-red-500/20', description: 'Problem-solving without guidance' },
  { id: 'interview_prep', name: 'Interview Prep', icon: MessageSquare, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', description: 'Questions with model answers' },
  { id: 'recording', name: 'Recording', icon: Video, color: 'text-pink-400', bgColor: 'bg-pink-500/20', description: 'Video link (YouTube, Zoom, etc.)' },
  { id: 'external_link', name: 'External Link', icon: LinkIcon, color: 'text-slate-400', bgColor: 'bg-slate-500/20', description: 'Link to external resource' }
];

interface Content {
  id: string;
  title: string;
  content_type: string;
  document_id?: string;
  runbook_id?: string;
  external_url?: string;
  generated_content?: Record<string, unknown>;
  sort_order: number;
  estimated_duration?: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  is_published: boolean;
  recording_url?: string;
  recording_title?: string;
  recording_duration?: number;
  training_content: Content[];
}

interface Enrollment {
  id: string;
  student_email: string;
  student_name?: string;
  status: string;
  enrolled_at: string;
  access_token: string;
}

interface Batch {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  access_code: string;
  training_modules: Module[];
  training_enrollments: Enrollment[];
}

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'modules' | 'students' | 'settings'>('modules');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Modal states
  const [showNewModule, setShowNewModule] = useState(false);
  const [showAddContent, setShowAddContent] = useState<string | null>(null);
  const [showEnrollStudents, setShowEnrollStudents] = useState(false);
  const [showRecording, setShowRecording] = useState<Module | null>(null);
  const [showAIGenerate, setShowAIGenerate] = useState<{moduleId: string, contentType: string} | null>(null);
  const [showEditContent, setShowEditContent] = useState<Content | null>(null);
  
  // Form states
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Generate states
  const [aiTopic, setAiTopic] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, unknown> | null>(null);
  
  // Recording form
  const [recordingUrl, setRecordingUrl] = useState('');
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingDuration, setRecordingDuration] = useState('');
  
  // Content form for external/recording
  const [contentTitle, setContentTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => { fetchBatch(); }, [id]);

  const fetchBatch = async () => {
    try {
      const response = await fetch(`/api/training/batches/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBatch(data);
        setExpandedModules(new Set(data.training_modules?.map((m: Module) => m.id) || []));
      } else {
        router.push('/dashboard/training');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createModule = async () => {
    if (!newModuleTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/training/batches/${id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newModuleTitle, description: newModuleDesc })
      });
      if (response.ok) {
        await fetchBatch();
        setShowNewModule(false);
        setNewModuleTitle('');
        setNewModuleDesc('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its content?')) return;
    await fetch(`/api/training/batches/${id}/modules?moduleId=${moduleId}`, { method: 'DELETE' });
    await fetchBatch();
  };

  const toggleModulePublished = async (module: Module) => {
    await fetch(`/api/training/batches/${id}/modules`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: module.id, is_published: !module.is_published })
    });
    await fetchBatch();
  };

  const saveRecording = async () => {
    if (!showRecording) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/training/batches/${id}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: showRecording.id,
          recording_url: recordingUrl || null,
          recording_title: recordingTitle || null,
          recording_duration: recordingDuration ? parseInt(recordingDuration) : null
        })
      });
      await fetchBatch();
      setShowRecording(null);
      setRecordingUrl('');
      setRecordingTitle('');
      setRecordingDuration('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWithAI = async () => {
    if (!showAIGenerate || !aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: showAIGenerate.contentType,
          topic: aiTopic,
          context: aiContext,
          difficulty: aiDifficulty
        })
      });
      if (response.ok) {
        const result = await response.json();
        setGeneratedContent(result.data);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedContent = async () => {
    if (!showAIGenerate || !generatedContent) return;
    setIsSubmitting(true);
    try {
      const title = (generatedContent as {title?: string}).title || aiTopic;
      await fetch(`/api/training/batches/${id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: showAIGenerate.moduleId,
          title,
          content_type: showAIGenerate.contentType,
          generated_content: generatedContent,
          estimated_duration: (generatedContent as {estimatedTime?: string; timeLimit?: number}).estimatedTime ? 
            parseInt((generatedContent as {estimatedTime: string}).estimatedTime) : 
            (generatedContent as {timeLimit?: number}).timeLimit || null
        })
      });
      await fetchBatch();
      closeAIModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExternalContent = async (moduleId: string, contentType: string) => {
    if (!contentTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/training/batches/${id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          title: contentTitle,
          content_type: contentType,
          external_url: externalUrl || null
        })
      });
      await fetchBatch();
      setShowAddContent(null);
      setContentTitle('');
      setExternalUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteContent = async (contentId: string) => {
    await fetch(`/api/training/batches/${id}/content?contentId=${contentId}`, { method: 'DELETE' });
    await fetchBatch();
  };

  const enrollStudents = async () => {
    const emails = studentEmails.split(/[\n,]/).map(e => e.trim()).filter(e => e);
    if (!emails.length) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/training/batches/${id}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: emails.map(email => ({ email })) })
      });
      await fetchBatch();
      setShowEnrollStudents(false);
      setStudentEmails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeStudent = async (enrollmentId: string) => {
    if (!confirm('Remove this student?')) return;
    await fetch(`/api/training/batches/${id}/enrollments?enrollmentId=${enrollmentId}`, { method: 'DELETE' });
    await fetchBatch();
  };

  const updateBatchStatus = async (status: string) => {
    await fetch(`/api/training/batches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await fetchBatch();
  };

  const copyStudentLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/training/${batch?.access_code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const closeAIModal = () => {
    setShowAIGenerate(null);
    setAiTopic('');
    setAiContext('');
    setAiDifficulty('intermediate');
    setGeneratedContent(null);
  };

  const getContentType = (typeId: string) => CONTENT_TYPES.find(t => t.id === typeId) || CONTENT_TYPES[8];

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 size={32} className="text-purple-400 animate-spin" /></div>;
  if (!batch) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/training" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
          <ArrowLeft size={18} /> Back to Training Center
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{batch.title}</h1>
            {batch.description && <p className="text-slate-400 mt-1">{batch.description}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            <select value={batch.status} onChange={(e) => updateBatchStatus(e.target.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ${batch.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : batch.status === 'draft' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button onClick={copyStudentLink} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">
              {copiedLink ? <Check size={18} /> : <Copy size={18} />} {copiedLink ? 'Copied!' : 'Student Link'}
            </button>
            <Link href={`/training/${batch.access_code}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
              <Eye size={18} /> Preview
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 rounded-lg p-1 w-fit">
        {[
          { id: 'modules', label: 'Modules', icon: BookOpen, count: batch.training_modules?.length || 0 },
          { id: 'students', label: 'Students', icon: Users, count: batch.training_enrollments?.length || 0 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            <tab.icon size={18} /> {tab.label}
            {tab.count !== undefined && <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <button onClick={() => setShowNewModule(true)} className="w-full p-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-purple-500 hover:text-purple-400 flex items-center justify-center gap-2">
            <Plus size={20} /> Add Module
          </button>

          {batch.training_modules?.map((module, index) => (
            <motion.div key={module.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              {/* Module Header */}
              <div className="p-4 flex items-center gap-3">
                <button className="text-slate-500 cursor-grab"><GripVertical size={20} /></button>
                <button onClick={() => setExpandedModules(prev => { const n = new Set(prev); n.has(module.id) ? n.delete(module.id) : n.add(module.id); return n; })} className="text-slate-400 hover:text-white">
                  {expandedModules.has(module.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{module.title}</h3>
                    {module.recording_url && (
                      <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full flex items-center gap-1">
                        <Video size={12} /> Recording
                      </span>
                    )}
                  </div>
                  {module.description && <p className="text-sm text-slate-400">{module.description}</p>}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{module.training_content?.length || 0} items</span>
                  <button onClick={() => { setShowRecording(module); setRecordingUrl(module.recording_url || ''); setRecordingTitle(module.recording_title || ''); setRecordingDuration(module.recording_duration?.toString() || ''); }} className="p-2 text-slate-400 hover:text-pink-400" title="Add Recording">
                    <Video size={16} />
                  </button>
                  <button onClick={() => toggleModulePublished(module)} className={`px-3 py-1 rounded-lg text-xs font-medium ${module.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {module.is_published ? 'Published' : 'Unpublished'}
                  </button>
                  <button onClick={() => deleteModule(module.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Module Content */}
              <AnimatePresence>
                {expandedModules.has(module.id) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-700">
                    <div className="p-4 space-y-2">
                      {/* Recording indicator */}
                      {module.recording_url && (
                        <a href={module.recording_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg group hover:bg-pink-500/20">
                          <Video size={18} className="text-pink-400" />
                          <span className="flex-1 text-white">{module.recording_title || 'Class Recording'}</span>
                          {module.recording_duration && <span className="text-xs text-pink-400">{module.recording_duration} min</span>}
                          <ExternalLink size={16} className="text-pink-400 opacity-0 group-hover:opacity-100" />
                        </a>
                      )}

                      {/* Content items */}
                      {module.training_content?.map((content, cIndex) => {
                        const ct = getContentType(content.content_type);
                        return (
                          <div key={content.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg group">
                            <span className="text-slate-500 text-sm w-6">{cIndex + 1}.</span>
                            <div className={`p-1.5 rounded ${ct.bgColor}`}><ct.icon size={16} className={ct.color} /></div>
                            <span className="flex-1 text-white">{content.title}</span>
                            {content.estimated_duration && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {content.estimated_duration} min</span>}
                            <button onClick={() => setShowEditContent(content)} className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100"><Edit size={16} /></button>
                            <button onClick={() => deleteContent(content.id)} className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><X size={16} /></button>
                          </div>
                        );
                      })}

                      {/* Add Content Button */}
                      <button onClick={() => setShowAddContent(module.id)} className="w-full p-3 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:border-purple-500 hover:text-purple-400 flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} /> Add Content
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400">{batch.training_enrollments?.length || 0} students enrolled</p>
            <button onClick={() => setShowEnrollStudents(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <UserPlus size={18} /> Enroll Students
            </button>
          </div>

          {batch.training_enrollments?.length > 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.training_enrollments.map(e => (
                    <tr key={e.id} className="border-b border-slate-700/50 last:border-0">
                      <td className="p-4 text-white">{e.student_email}</td>
                      <td className="p-4 text-slate-400">{e.student_name || '-'}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${e.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>{e.status}</span></td>
                      <td className="p-4 text-right"><button onClick={() => removeStudent(e.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No students enrolled</h3>
              <p className="text-slate-400">Enroll students to give them access.</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Batch Settings</h3>
          <p className="text-slate-400">Settings configuration coming soon...</p>
        </div>
      )}

      {/* New Module Modal */}
      <AnimatePresence>
        {showNewModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowNewModule(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Add Module</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input type="text" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="e.g., Module 1: Introduction" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea value={newModuleDesc} onChange={(e) => setNewModuleDesc(e.target.value)} placeholder="Brief description..." rows={2} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewModule(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
                <button onClick={createModule} disabled={!newModuleTitle.trim() || isSubmitting} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Add Module'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Modal */}
      <AnimatePresence>
        {showRecording && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowRecording(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Video className="text-pink-400" /> Module Recording</h2>
              <p className="text-sm text-slate-400 mb-4">Add a class recording for &quot;{showRecording.title}&quot;</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Recording URL</label>
                  <input type="url" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} placeholder="https://youtube.com/... or Zoom link" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title (optional)</label>
                  <input type="text" value={recordingTitle} onChange={(e) => setRecordingTitle(e.target.value)} placeholder="e.g., Session 1 Recording" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                  <input type="number" value={recordingDuration} onChange={(e) => setRecordingDuration(e.target.value)} placeholder="60" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRecording(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
                <button onClick={saveRecording} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-pink-500 text-white rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Recording'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Content Modal */}
      <AnimatePresence>
        {showAddContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddContent(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-3xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-6">Add Content</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CONTENT_TYPES.map(ct => (
                  <button
                    key={ct.id}
                    onClick={() => {
                      if (ct.id === 'external_link' || ct.id === 'recording') {
                        setContentTitle('');
                        setExternalUrl('');
                      } else {
                        setShowAIGenerate({ moduleId: showAddContent, contentType: ct.id });
                        setShowAddContent(null);
                      }
                    }}
                    className="p-4 rounded-xl border border-slate-700 hover:border-purple-500 hover:bg-purple-500/10 text-left transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${ct.bgColor}`}>
                        <ct.icon size={20} className={ct.color} />
                      </div>
                      <span className="font-semibold text-white">{ct.name}</span>
                    </div>
                    <p className="text-sm text-slate-400">{ct.description}</p>
                    {ct.id !== 'external_link' && ct.id !== 'recording' && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-purple-400">
                        <Sparkles size={12} /> AI Generate
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowAddContent(null)} className="w-full mt-6 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIGenerate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeAIModal}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-4xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-purple-400" /> Generate {getContentType(showAIGenerate.contentType).name}
                </h2>
                <button onClick={closeAIModal} className="p-2 text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              {!generatedContent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
                    <input type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., PostgreSQL Indexing Strategies" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Additional Context</label>
                    <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Any specific requirements, focus areas, or context..." rows={3} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                    <div className="flex gap-2">
                      {['beginner', 'intermediate', 'advanced'].map(d => (
                        <button key={d} onClick={() => setAiDifficulty(d as typeof aiDifficulty)} className={`flex-1 py-2 rounded-lg capitalize ${aiDifficulty === d ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={closeAIModal} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
                    <button onClick={generateWithAI} disabled={!aiTopic.trim() || isGenerating} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                      {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-slate-800 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">{JSON.stringify(generatedContent, null, 2)}</pre>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setGeneratedContent(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2">
                      <Edit size={18} /> Regenerate
                    </button>
                    <button onClick={saveGeneratedContent} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Content</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Content Modal */}
      <AnimatePresence>
        {showEditContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEditContent(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-4xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit className="text-blue-400" /> Edit Content
                </h2>
                <button onClick={() => setShowEditContent(null)} className="p-2 text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">{JSON.stringify(showEditContent.generated_content || {}, null, 2)}</pre>
              </div>

              <p className="text-sm text-slate-500 mt-4">Full editing UI coming soon. For now, you can delete and regenerate content.</p>

              <button onClick={() => setShowEditContent(null)} className="w-full mt-6 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enroll Students Modal */}
      <AnimatePresence>
        {showEnrollStudents && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEnrollStudents(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Enroll Students</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Addresses</label>
                <textarea value={studentEmails} onChange={(e) => setStudentEmails(e.target.value)} placeholder="Enter emails, one per line or comma-separated..." rows={6} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none" />
                <p className="text-xs text-slate-500 mt-2">Each student will receive a unique access link.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEnrollStudents(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
                <button onClick={enrollStudents} disabled={!studentEmails.trim() || isSubmitting} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Enroll'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

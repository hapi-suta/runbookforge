'use client'

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Users,
  BookOpen,
  Settings,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  FileText,
  Presentation,
  Link as LinkIcon,
  Play,
  Clock,
  Eye,
  UserPlus,
  Mail,
  X,
  Save,
  CheckCircle
} from 'lucide-react';

interface Content {
  id: string;
  title: string;
  content_type: string;
  document_id?: string;
  runbook_id?: string;
  external_url?: string;
  sort_order: number;
  estimated_duration?: number;
  is_required: boolean;
  documents?: { id: string; title: string; file_type: string };
  runbooks?: { id: string; title: string };
}

interface Module {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  is_published: boolean;
  training_content: Content[];
}

interface Enrollment {
  id: string;
  student_email: string;
  student_name?: string;
  status: string;
  enrolled_at: string;
  last_accessed_at?: string;
  access_token: string;
}

interface Batch {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  access_code: string;
  settings: Record<string, unknown>;
  training_modules: Module[];
  training_enrollments: Enrollment[];
}

interface Document {
  id: string;
  title: string;
  file_type: string;
}

interface Runbook {
  id: string;
  title: string;
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
  const [showEditModule, setShowEditModule] = useState<Module | null>(null);
  
  // Form states
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Content selection
  const [availableDocs, setAvailableDocs] = useState<Document[]>([]);
  const [availableRunbooks, setAvailableRunbooks] = useState<Runbook[]>([]);
  const [contentType, setContentType] = useState<'document' | 'runbook' | 'external'>('document');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedRunbookId, setSelectedRunbookId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [contentTitle, setContentTitle] = useState('');

  useEffect(() => {
    fetchBatch();
    fetchUserContent();
  }, [id]);

  const fetchBatch = async () => {
    try {
      const response = await fetch(`/api/training/batches/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBatch(data);
        // Expand all modules by default
        setExpandedModules(new Set(data.training_modules?.map((m: Module) => m.id) || []));
      } else {
        router.push('/dashboard/training');
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      const [docsRes, runbooksRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/runbooks')
      ]);
      
      if (docsRes.ok) {
        const docs = await docsRes.json();
        setAvailableDocs(docs);
      }
      if (runbooksRes.ok) {
        const runbooks = await runbooksRes.json();
        setAvailableRunbooks(runbooks);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const createModule = async () => {
    if (!newModuleTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/training/batches/${id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDesc
        })
      });
      
      if (response.ok) {
        await fetchBatch();
        setShowNewModule(false);
        setNewModuleTitle('');
        setNewModuleDesc('');
      }
    } catch (error) {
      console.error('Error creating module:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its content?')) return;
    
    try {
      const response = await fetch(`/api/training/batches/${id}/modules?moduleId=${moduleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchBatch();
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const toggleModulePublished = async (module: Module) => {
    try {
      const response = await fetch(`/api/training/batches/${id}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          is_published: !module.is_published
        })
      });
      
      if (response.ok) {
        await fetchBatch();
      }
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const addContent = async (moduleId: string) => {
    if (!contentTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        moduleId,
        title: contentTitle,
        content_type: contentType === 'external' ? 'external_link' : contentType
      };

      if (contentType === 'document' && selectedDocId) {
        body.document_id = selectedDocId;
      } else if (contentType === 'runbook' && selectedRunbookId) {
        body.runbook_id = selectedRunbookId;
      } else if (contentType === 'external' && externalUrl) {
        body.external_url = externalUrl;
      }

      const response = await fetch(`/api/training/batches/${id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await fetchBatch();
        setShowAddContent(null);
        setContentTitle('');
        setSelectedDocId('');
        setSelectedRunbookId('');
        setExternalUrl('');
      }
    } catch (error) {
      console.error('Error adding content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/training/batches/${id}/content?contentId=${contentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchBatch();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const enrollStudents = async () => {
    const emails = studentEmails.split(/[\n,]/).map(e => e.trim()).filter(e => e);
    if (emails.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/training/batches/${id}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: emails.map(email => ({ email }))
        })
      });
      
      if (response.ok) {
        await fetchBatch();
        setShowEnrollStudents(false);
        setStudentEmails('');
      }
    } catch (error) {
      console.error('Error enrolling students:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeStudent = async (enrollmentId: string) => {
    if (!confirm('Remove this student from the batch?')) return;
    
    try {
      const response = await fetch(`/api/training/batches/${id}/enrollments?enrollmentId=${enrollmentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchBatch();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const updateBatchStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/training/batches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        await fetchBatch();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const copyStudentLink = () => {
    const url = `${window.location.origin}/training/${batch?.access_code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'document': return <Presentation size={16} className="text-amber-400" />;
      case 'runbook': return <FileText size={16} className="text-teal-400" />;
      case 'external_link': return <LinkIcon size={16} className="text-blue-400" />;
      default: return <FileText size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/training"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Training Center
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{batch.title}</h1>
            {batch.description && (
              <p className="text-slate-400 mt-1">{batch.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={batch.status}
              onChange={(e) => updateBatchStatus(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                batch.status === 'active' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : batch.status === 'draft'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            
            <button
              onClick={copyStudentLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              {copiedLink ? <Check size={18} /> : <Copy size={18} />}
              {copiedLink ? 'Copied!' : 'Student Link'}
            </button>
            
            <Link
              href={`/training/${batch.access_code}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Eye size={18} />
              Preview
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
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowNewModule(true)}
            className="w-full p-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Module
          </button>

          {batch.training_modules?.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
              {/* Module Header */}
              <div className="p-4 flex items-center gap-3">
                <button className="text-slate-500 cursor-grab">
                  <GripVertical size={20} />
                </button>
                
                <button
                  onClick={() => toggleModule(module.id)}
                  className="text-slate-400 hover:text-white"
                >
                  {expandedModules.has(module.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{module.title}</h3>
                  {module.description && (
                    <p className="text-sm text-slate-400">{module.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    {module.training_content?.length || 0} items
                  </span>
                  
                  <button
                    onClick={() => toggleModulePublished(module)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      module.is_published
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {module.is_published ? 'Published' : 'Unpublished'}
                  </button>
                  
                  <button
                    onClick={() => deleteModule(module.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Module Content */}
              <AnimatePresence>
                {expandedModules.has(module.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-700"
                  >
                    <div className="p-4 space-y-2">
                      {module.training_content?.map((content, cIndex) => (
                        <div
                          key={content.id}
                          className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg group"
                        >
                          <span className="text-slate-500 text-sm w-6">{cIndex + 1}.</span>
                          {getContentIcon(content.content_type)}
                          <span className="flex-1 text-white">{content.title}</span>
                          {content.estimated_duration && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} />
                              {content.estimated_duration} min
                            </span>
                          )}
                          <button
                            onClick={() => deleteContent(content.id)}
                            className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => setShowAddContent(module.id)}
                        className="w-full p-3 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus size={16} />
                        Add Content
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {batch.training_modules?.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              No modules yet. Click "Add Module" to create your first module.
            </p>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400">
              {batch.training_enrollments?.length || 0} students enrolled
            </p>
            <button
              onClick={() => setShowEnrollStudents(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <UserPlus size={18} />
              Enroll Students
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
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Last Active</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.training_enrollments.map(enrollment => (
                    <tr key={enrollment.id} className="border-b border-slate-700/50 last:border-0">
                      <td className="p-4 text-white">{enrollment.student_email}</td>
                      <td className="p-4 text-slate-400">{enrollment.student_name || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          enrollment.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {enrollment.last_accessed_at 
                          ? new Date(enrollment.last_accessed_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => removeStudent(enrollment.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No students enrolled</h3>
              <p className="text-slate-400 mb-4">Enroll students to give them access to this training.</p>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewModule(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Module</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="e.g., Module 1: Introduction"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newModuleDesc}
                    onChange={(e) => setNewModuleDesc(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewModule(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={createModule}
                  disabled={!newModuleTitle.trim() || isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Add Module'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Content Modal */}
      <AnimatePresence>
        {showAddContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Content</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'document', label: 'Document/PPT', icon: Presentation },
                      { id: 'runbook', label: 'Runbook', icon: FileText },
                      { id: 'external', label: 'External Link', icon: LinkIcon }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id as typeof contentType)}
                        className={`flex-1 p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                          contentType === type.id
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <type.icon size={18} />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder="Content title..."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                {contentType === 'document' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Document</label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => {
                        setSelectedDocId(e.target.value);
                        const doc = availableDocs.find(d => d.id === e.target.value);
                        if (doc && !contentTitle) setContentTitle(doc.title);
                      }}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Select a document...</option>
                      {availableDocs.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {contentType === 'runbook' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Runbook</label>
                    <select
                      value={selectedRunbookId}
                      onChange={(e) => {
                        setSelectedRunbookId(e.target.value);
                        const rb = availableRunbooks.find(r => r.id === e.target.value);
                        if (rb && !contentTitle) setContentTitle(rb.title);
                      }}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Select a runbook...</option>
                      {availableRunbooks.map(rb => (
                        <option key={rb.id} value={rb.id}>{rb.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {contentType === 'external' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                    <input
                      type="url"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddContent(null)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={() => addContent(showAddContent)}
                  disabled={!contentTitle.trim() || isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Add Content'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enroll Students Modal */}
      <AnimatePresence>
        {showEnrollStudents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEnrollStudents(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Enroll Students</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Addresses
                </label>
                <textarea
                  value={studentEmails}
                  onChange={(e) => setStudentEmails(e.target.value)}
                  placeholder="Enter emails, one per line or comma-separated..."
                  rows={6}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Each student will receive a unique access link.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEnrollStudents(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={enrollStudents}
                  disabled={!studentEmails.trim() || isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Enroll Students'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

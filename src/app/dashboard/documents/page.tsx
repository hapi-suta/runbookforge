'use client'

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Presentation, 
  Folder, 
  FolderPlus, 
  Search, 
  Loader2, 
  Trash2, 
  Download,
  Eye,
  MoreVertical,
  ArrowLeft,
  Grid,
  List,
  Plus,
  X,
  Check,
  Calendar,
  Layers,
  Edit3,
  Palette,
  Share2,
  Play,
  Mail,
  UserPlus,
  Copy,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_type: string;
  file_url: string | null;
  file_size: number | null;
  slide_count: number | null;
  category_id: string | null;
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

interface Share {
  id: string;
  shared_with_email: string;
  permission: string;
  created_at: string;
}

const colorOptions = [
  { name: 'violet', bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', solid: 'bg-violet-500' },
  { name: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', solid: 'bg-blue-500' },
  { name: 'teal', bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', solid: 'bg-teal-500' },
  { name: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', solid: 'bg-amber-500' },
  { name: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', solid: 'bg-emerald-500' },
  { name: 'pink', bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', solid: 'bg-pink-500' },
  { name: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', solid: 'bg-red-500' },
  { name: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', solid: 'bg-orange-500' },
];

const getColorClasses = (colorName: string) => {
  return colorOptions.find(c => c.name === colorName) || colorOptions[0];
};

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pptx':
      return Presentation;
    default:
      return FileText;
  }
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('violet');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  
  // Folder management state
  const [editingFolder, setEditingFolder] = useState<Category | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Sharing state
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [shares, setShares] = useState<Share[]>([]);
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [shareError, setShareError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);
  
  // Close folder menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setFolderMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, catsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/categories?type=document')
      ]);
      
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data);
      }
      
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newFolderName.trim()) return;
    
    setCreatingFolder(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          type: 'document',
          color: newFolderColor
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCategories([...categories, data]);
        setNewFolderName('');
        setShowNewFolder(false);
      } else {
        alert(data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create folder. Please try again.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this folder? Documents inside will be moved to "Uncategorized".')) return;
    
    try {
      const response = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
        if (selectedCategory === id) setSelectedCategory(null);
        setFolderMenuOpen(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingFolder(category);
    setEditFolderName(category.name);
    setEditFolderColor(category.color);
    setFolderMenuOpen(null);
  };

  const updateCategory = async () => {
    if (!editingFolder || !editFolderName.trim()) return;
    
    setSavingFolder(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFolder.id,
          name: editFolderName.trim(),
          color: editFolderColor
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCategories(categories.map(c => c.id === editingFolder.id ? data : c));
        setEditingFolder(null);
      } else {
        alert(data.error || 'Failed to update folder');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update folder. Please try again.');
    } finally {
      setSavingFolder(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setDeleteId(id);
    try {
      const response = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleteId(null);
    }
  };

  // Open presentation in new tab
  const openPresentation = (doc: Document) => {
    window.open(`/view/presentation?id=${doc.id}`, '_blank');
  };

  // Download document - generates real PPTX for presentations
  const downloadDocument = async (doc: Document) => {
    if (doc.file_type === 'pptx') {
      // Download real PPTX file via API
      try {
        const response = await fetch(`/api/documents/${doc.id}/download`);
        if (!response.ok) {
          throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download presentation');
      }
    } else {
      // For other file types, download as JSON
      const data = {
        title: doc.title,
        description: doc.description,
        slides: doc.metadata?.slides || [],
        style: doc.metadata?.style,
        created_at: doc.created_at
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Open share modal
  const openShareModal = async (doc: Document) => {
    setSharingDoc(doc);
    setShareEmail('');
    setSharePermission('view');
    setShareError('');
    
    // Fetch existing shares
    try {
      const response = await fetch(`/api/shares?resource_type=document&resource_id=${doc.id}`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  // Create a share
  const createShare = async () => {
    if (!sharingDoc || !shareEmail.trim()) return;
    
    setSharingInProgress(true);
    setShareError('');
    
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail.trim().toLowerCase(),
          resource_type: 'document',
          resource_id: sharingDoc.id,
          permission: sharePermission
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShares([data, ...shares]);
        setShareEmail('');
      } else {
        setShareError(data.error || 'Failed to share');
      }
    } catch (error) {
      setShareError('Failed to share. Please try again.');
    } finally {
      setSharingInProgress(false);
    }
  };

  // Remove a share
  const removeShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares?id=${shareId}`, { method: 'DELETE' });
      if (response.ok) {
        setShares(shares.filter(s => s.id !== shareId));
      }
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  // Copy share link
  const copyShareLink = (doc: Document) => {
    const link = `${window.location.origin}/view/presentation?id=${doc.id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const getFilteredDocuments = () => {
    let filtered = documents;
    
    if (selectedCategory === 'uncategorized') {
      filtered = filtered.filter(d => !d.category_id);
    } else if (selectedCategory) {
      filtered = filtered.filter(d => d.category_id === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getCategoryCount = (categoryId: string) => {
    return documents.filter(d => d.category_id === categoryId).length;
  };

  const getUncategorizedCount = () => {
    return documents.filter(d => !d.category_id).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredDocuments = getFilteredDocuments();
  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {selectedCategory 
                ? selectedCategory === 'uncategorized' 
                  ? 'Uncategorized'
                  : selectedCategoryData?.name || 'Folder' 
                : 'My Documents'
              }
            </h1>
            <p className="text-slate-400">
              {selectedCategory 
                ? `${filteredDocuments.length} documents in this folder`
                : `${documents.length} documents • ${categories.length} folders`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!selectedCategory && (
            <button
              onClick={() => setShowNewFolder(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <FolderPlus size={18} />
              <span className="hidden sm:inline">New Folder</span>
            </button>
          )}
          <Link
            href="/dashboard/import?tab=ppt"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={18} />
            Generate PPT
          </Link>
        </div>
      </motion.div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-slate-900 border border-slate-700 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                placeholder="Folder name (e.g., Course 1, Personal)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createCategory()}
                autoFocus
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={createCategory}
                disabled={!newFolderName.trim() || creatingFolder}
                className="p-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingFolder ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
              </button>
              <button
                onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Color:</span>
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setNewFolderColor(color.name)}
                  className={`w-6 h-6 rounded-full ${color.bg} ${color.border} border-2 ${
                    newFolderColor === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-violet-500 animate-spin" />
        </div>
      )}

      {/* Folders Grid */}
      {!isLoading && !selectedCategory && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((category, index) => {
              const colors = getColorClasses(category.color);
              const count = getCategoryCount(category.id);
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  className={`group relative p-4 ${colors.bg} ${colors.border} border rounded-xl text-left hover:scale-[1.02] transition-all cursor-pointer`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Folder size={24} className={colors.text} />
                    <div className="relative" ref={folderMenuOpen === category.id ? menuRef : null}>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setFolderMenuOpen(folderMenuOpen === category.id ? null : category.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {folderMenuOpen === category.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-8 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openEditModal(category)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              <Edit3 size={14} />
                              Rename
                            </button>
                            <button
                              onClick={() => openEditModal(category)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              <Palette size={14} />
                              Change Color
                            </button>
                            <div className="border-t border-slate-700" />
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <h3 className="font-medium text-white truncate">{category.name}</h3>
                  <p className="text-sm text-slate-400">{count} documents</p>
                </motion.div>
              );
            })}
            
            {/* Uncategorized folder */}
            {getUncategorizedCount() > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + categories.length * 0.03 }}
                onClick={() => setSelectedCategory('uncategorized')}
                className="group relative p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-left hover:scale-[1.02] transition-all"
              >
                <Folder size={24} className="text-slate-500 mb-2" />
                <h3 className="font-medium text-white truncate">Uncategorized</h3>
                <p className="text-sm text-slate-400">{getUncategorizedCount()} documents</p>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Documents Section */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!selectedCategory && categories.length > 0 && filteredDocuments.length > 0 && (
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              {searchQuery ? 'Search Results' : 'All Documents'}
            </h2>
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <Presentation size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No documents found' : selectedCategory ? 'Empty folder' : 'No documents yet'}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try a different search term'
                  : selectedCategory 
                    ? 'Generate a presentation and save it to this folder'
                    : 'Generate your first presentation using AI.'
                }
              </p>
              {!searchQuery && (
                <Link
                  href="/dashboard/import?tab=ppt"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Presentation size={18} />
                  Generate Presentation
                </Link>
              )}
            </div>
          )}

          {/* Grid View */}
          {filteredDocuments.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc, index) => {
                const FileIcon = getFileIcon(doc.file_type);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.03 }}
                    className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <FileIcon size={20} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 truncate">{doc.title}</h3>
                        <p className="text-xs text-slate-500 uppercase">{doc.file_type}</p>
                      </div>
                    </div>
                    
                    {doc.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{doc.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        {doc.slide_count || 0} slides
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => openPresentation(doc)}
                        className="flex-1 flex items-center justify-center gap-1 p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors text-sm"
                        title="Present in new tab"
                      >
                        <Play size={14} />
                        Present
                      </button>
                      <button
                        onClick={() => openShareModal(doc)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        disabled={deleteId === doc.id}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        {deleteId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {filteredDocuments.length > 0 && viewMode === 'list' && (
            <div className="space-y-3">
              {filteredDocuments.map((doc, index) => {
                const FileIcon = getFileIcon(doc.file_type);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.03 }}
                    className="group p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <FileIcon size={20} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{doc.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="uppercase">{doc.file_type}</span>
                            <span>•</span>
                            <span>{doc.slide_count || 0} slides</span>
                            <span>•</span>
                            <span>{formatDate(doc.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openPresentation(doc)}
                          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Present"
                        >
                          <Play size={18} />
                        </button>
                        <button
                          onClick={() => openShareModal(doc)}
                          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Share"
                        >
                          <Share2 size={18} />
                        </button>
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          disabled={deleteId === doc.id}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          {deleteId === doc.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setViewingDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-3xl max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">{viewingDoc.title}</h2>
                  <p className="text-sm text-slate-400">{viewingDoc.slide_count} slides • {viewingDoc.metadata?.style} style</p>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {viewingDoc.metadata?.slides?.map((slide: any, index: number) => (
                  <div key={index} className="mb-4 p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-7 h-7 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-medium text-white">{slide.title}</h3>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">{slide.layout}</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{slide.content}</p>
                    {slide.speakerNotes && (
                      <p className="text-xs text-slate-500 italic">Notes: {slide.speakerNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Folder Modal */}
      <AnimatePresence>
        {editingFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingFolder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white">Edit Folder</h2>
                <button
                  onClick={() => setEditingFolder(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Folder Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateCategory()}
                    placeholder="Enter folder name..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    autoFocus
                  />
                </div>
                
                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setEditFolderColor(color.name)}
                        className={`w-8 h-8 rounded-full ${color.solid} transition-all ${
                          editFolderColor === color.name 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' 
                            : 'hover:scale-110'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preview</label>
                  <div className={`p-4 ${getColorClasses(editFolderColor).bg} ${getColorClasses(editFolderColor).border} border rounded-xl`}>
                    <Folder size={24} className={getColorClasses(editFolderColor).text + ' mb-2'} />
                    <h3 className="font-medium text-white">{editFolderName || 'Folder Name'}</h3>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800">
                <button
                  onClick={() => setEditingFolder(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateCategory}
                  disabled={!editFolderName.trim() || savingFolder}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingFolder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {sharingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSharingDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">Share Presentation</h2>
                  <p className="text-sm text-slate-400 truncate">{sharingDoc.title}</p>
                </div>
                <button
                  onClick={() => setSharingDoc(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Copy Link */}
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <ExternalLink size={16} />
                      <span className="text-sm">Anyone with the link can view</span>
                    </div>
                    <button
                      onClick={() => copyShareLink(sharingDoc)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Copy size={14} />
                      Copy Link
                    </button>
                  </div>
                </div>
                
                {/* Share by Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <UserPlus size={16} />
                      Share with specific people
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="view">Can view</option>
                        <option value="download">Can download</option>
                        <option value="edit">Can edit</option>
                      </select>
                    </div>
                    <button
                      onClick={createShare}
                      disabled={!shareEmail.trim() || sharingInProgress}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sharingInProgress ? <Loader2 size={18} className="animate-spin" /> : 'Share'}
                    </button>
                  </div>
                  {shareError && (
                    <p className="mt-2 text-sm text-red-400">{shareError}</p>
                  )}
                </div>
                
                {/* Existing Shares */}
                {shares.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Shared with</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {shares.map((share) => (
                        <div key={share.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-slate-500" />
                            <span className="text-sm text-white">{share.shared_with_email}</span>
                            <span className="px-2 py-0.5 bg-slate-700 text-xs text-slate-400 rounded">
                              {share.permission}
                            </span>
                          </div>
                          <button
                            onClick={() => removeShare(share.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-800">
                <button
                  onClick={() => openPresentation(sharingDoc)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Play size={16} />
                  Open Presentation
                </button>
                <button
                  onClick={() => setSharingDoc(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

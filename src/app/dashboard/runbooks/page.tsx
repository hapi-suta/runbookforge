'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, FileText, Search, Trash2, Edit, Eye, Loader2, 
  Folder, FolderPlus, ChevronRight, ArrowLeft, Grid, List,
  MoreVertical, X, Check, Edit3, Palette
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  runbookCount?: number;
}

interface Runbook {
  id: string;
  title: string;
  description: string | null;
  sections: any[];
  is_public: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

const colorOptions = [
  { name: 'teal', bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', solid: 'bg-teal-500' },
  { name: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', solid: 'bg-blue-500' },
  { name: 'violet', bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', solid: 'bg-violet-500' },
  { name: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', solid: 'bg-amber-500' },
  { name: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', solid: 'bg-emerald-500' },
  { name: 'pink', bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', solid: 'bg-pink-500' },
  { name: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', solid: 'bg-red-500' },
  { name: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', solid: 'bg-orange-500' },
];

const getColorClasses = (colorName: string) => {
  return colorOptions.find(c => c.name === colorName) || colorOptions[0];
};

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('teal');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Folder management state
  const [editingFolder, setEditingFolder] = useState<Category | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      const [runbooksRes, categoriesRes] = await Promise.all([
        fetch('/api/runbooks'),
        fetch('/api/categories?type=runbook')
      ]);
      
      if (runbooksRes.ok) {
        const data = await runbooksRes.json();
        setRunbooks(data);
      }
      
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
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
          type: 'runbook',
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
    if (!confirm('Delete this folder? Runbooks inside will be moved to "Uncategorized".')) return;
    
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this runbook?')) return;
    
    setDeleteId(id);
    try {
      const response = await fetch(`/api/runbooks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setRunbooks(runbooks.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting runbook:', error);
    } finally {
      setDeleteId(null);
    }
  };

  // Get runbooks for current view
  const getFilteredRunbooks = () => {
    let filtered = runbooks;
    
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category_id === selectedCategory);
    } else if (selectedCategory === null && categories.length > 0) {
      // Show uncategorized when "All" is selected but we have categories
      // Actually show all runbooks in this case
    }
    
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Count runbooks per category
  const getCategoryCount = (categoryId: string) => {
    return runbooks.filter(r => r.category_id === categoryId).length;
  };

  const getUncategorizedCount = () => {
    return runbooks.filter(r => !r.category_id).length;
  };

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

  const filteredRunbooks = getFilteredRunbooks();
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
                ? selectedCategoryData?.name || 'Folder' 
                : 'My Runbooks'
              }
            </h1>
            <p className="text-slate-400">
              {selectedCategory 
                ? `${filteredRunbooks.length} runbooks in this folder`
                : `${runbooks.length} runbooks • ${categories.length} folders`
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
            href="/dashboard/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus size={18} />
            New Runbook
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
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={createCategory}
                disabled={!newFolderName.trim() || creatingFolder}
                className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            placeholder="Search runbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
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
          <Loader2 size={32} className="text-teal-500 animate-spin" />
        </div>
      )}

      {/* Folders Grid (only when not in a folder) */}
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
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group relative p-4 ${colors.bg} ${colors.border} border rounded-xl text-left hover:scale-[1.02] transition-all cursor-pointer`}
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
                  <p className="text-sm text-slate-400">{count} runbooks</p>
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
                <p className="text-sm text-slate-400">{getUncategorizedCount()} runbooks</p>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Runbooks Section */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!selectedCategory && categories.length > 0 && filteredRunbooks.length > 0 && (
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              {searchQuery ? 'Search Results' : 'All Runbooks'}
            </h2>
          )}

          {/* Empty State */}
          {filteredRunbooks.length === 0 && (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <FileText size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No runbooks found' : selectedCategory ? 'Empty folder' : 'No runbooks yet'}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try a different search term'
                  : selectedCategory 
                    ? 'Create a runbook and add it to this folder'
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
            </div>
          )}

          {/* Grid View */}
          {filteredRunbooks.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRunbooks.map((runbook, index) => (
                <motion.div
                  key={runbook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.03 }}
                  className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <Link href={`/dashboard/runbooks/${runbook.id}`}>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors line-clamp-1">
                      {runbook.title}
                    </h3>
                    {runbook.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{runbook.description}</p>
                    )}
                  </Link>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{runbook.sections?.length || 0} sections • {countBlocks(runbook.sections)} blocks</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-600">{formatDate(runbook.updated_at)}</span>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/runbooks/${runbook.id}`}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/dashboard/runbooks/${runbook.id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(runbook.id)}
                        disabled={deleteId === runbook.id}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                      >
                        {deleteId === runbook.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* List View */}
          {filteredRunbooks.length > 0 && viewMode === 'list' && (
            <div className="space-y-3">
              {filteredRunbooks.map((runbook, index) => (
                <motion.div
                  key={runbook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.03 }}
                  className="group p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/runbooks/${runbook.id}`}>
                        <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors truncate">
                          {runbook.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span>{runbook.sections?.length || 0} sections</span>
                        <span>•</span>
                        <span>{countBlocks(runbook.sections)} blocks</span>
                        <span>•</span>
                        <span>{formatDate(runbook.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/runbooks/${runbook.id}`}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/dashboard/runbooks/${runbook.id}/edit`}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(runbook.id)}
                        disabled={deleteId === runbook.id}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleteId === runbook.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

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
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
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
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}

'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Plus, Folder, FolderOpen, File, Sparkles,
  Trash2, Edit3, ExternalLink, Play, MoreVertical, Upload, Video,
  FileText, Presentation, HelpCircle, Target, ClipboardList, MessageSquare,
  BookOpen, Link as LinkIcon, GripVertical
} from 'lucide-react';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  document_id?: string;
  runbook_id?: string;
  external_url?: string;
  content_data?: Record<string, unknown>;
  sort_order: number;
  estimated_minutes?: number;
}

export interface FolderNode {
  id: string;
  title: string;
  description?: string;
  is_folder: boolean;
  parent_id?: string | null;
  section_id?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  children: FolderNode[];
  content: ContentItem[];
}

const CONTENT_TYPE_INFO: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  presentation: { icon: Presentation, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  runbook: { icon: FileText, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  tutorial: { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  quiz: { icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  assignment: { icon: ClipboardList, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  challenge: { icon: Target, color: 'text-red-400', bg: 'bg-red-500/10' },
  interview_prep: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  recording: { icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  external_link: { icon: LinkIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

interface FolderTreeProps {
  folders: FolderNode[];
  sectionId: string;
  depth?: number;
  canAIGenerate: boolean;
  aiDisabledReason?: string;
  onAddFolder: (parentId: string | null, sectionId: string) => void;
  onAddContent: (moduleId: string, sectionId: string) => void;
  onAIGenerate: (moduleId: string, sectionId: string) => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (contentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onEditFolder: (folder: FolderNode) => void;
  onViewPresentation: (content: ContentItem) => void;
  onSelectContent?: (content: ContentItem) => void;
  selectedContentId?: string;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
}

export function FolderTree({
  folders,
  sectionId,
  depth = 0,
  canAIGenerate,
  aiDisabledReason,
  onAddFolder,
  onAddContent,
  onAIGenerate,
  onEditContent,
  onDeleteContent,
  onDeleteFolder,
  onEditFolder,
  onViewPresentation,
  onSelectContent,
  selectedContentId,
  expandedFolders,
  onToggleFolder,
}: FolderTreeProps) {
  return (
    <div className={`space-y-1 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-700/50' : ''}`}>
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          sectionId={sectionId}
          depth={depth}
          canAIGenerate={canAIGenerate}
          aiDisabledReason={aiDisabledReason}
          onAddFolder={onAddFolder}
          onAddContent={onAddContent}
          onAIGenerate={onAIGenerate}
          onEditContent={onEditContent}
          onDeleteContent={onDeleteContent}
          onDeleteFolder={onDeleteFolder}
          onEditFolder={onEditFolder}
          onViewPresentation={onViewPresentation}
          onSelectContent={onSelectContent}
          selectedContentId={selectedContentId}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
        />
      ))}
    </div>
  );
}

interface FolderItemProps {
  folder: FolderNode;
  sectionId: string;
  depth: number;
  canAIGenerate: boolean;
  aiDisabledReason?: string;
  onAddFolder: (parentId: string | null, sectionId: string) => void;
  onAddContent: (moduleId: string, sectionId: string) => void;
  onAIGenerate: (moduleId: string, sectionId: string) => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (contentId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onEditFolder: (folder: FolderNode) => void;
  onViewPresentation: (content: ContentItem) => void;
  onSelectContent?: (content: ContentItem) => void;
  selectedContentId?: string;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
}

function FolderItem({
  folder,
  sectionId,
  depth,
  canAIGenerate,
  aiDisabledReason,
  onAddFolder,
  onAddContent,
  onAIGenerate,
  onEditContent,
  onDeleteContent,
  onDeleteFolder,
  onEditFolder,
  onViewPresentation,
  onSelectContent,
  selectedContentId,
  expandedFolders,
  onToggleFolder,
}: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isExpanded = expandedFolders.has(folder.id);
  const hasChildren = folder.children.length > 0 || folder.content.length > 0;
  const totalItems = folder.children.length + folder.content.length;

  const getFolderColor = () => {
    const colors: Record<string, string> = {
      amber: 'from-amber-500 to-orange-500',
      teal: 'from-teal-500 to-emerald-500',
      purple: 'from-purple-500 to-violet-500',
      blue: 'from-blue-500 to-indigo-500',
      pink: 'from-pink-500 to-rose-500',
      slate: 'from-slate-500 to-slate-600',
    };
    return colors[folder.color || 'slate'] || colors.slate;
  };

  return (
    <div className="group/folder">
      {/* Folder Header */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
          ${isExpanded ? 'bg-slate-800/60 border border-slate-700/50' : 'hover:bg-slate-800/40'}
        `}
        onClick={() => onToggleFolder(folder.id)}
      >
        {/* Drag Handle */}
        <div className="opacity-0 group-hover/folder:opacity-100 cursor-grab text-slate-600 hover:text-slate-400 transition-opacity">
          <GripVertical size={14} />
        </div>

        {/* Expand/Collapse Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-slate-500"
        >
          <ChevronRight size={16} />
        </motion.div>

        {/* Folder Icon */}
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getFolderColor()} flex items-center justify-center shadow-sm`}>
          {isExpanded ? (
            <FolderOpen size={16} className="text-white" />
          ) : (
            <Folder size={16} className="text-white" />
          )}
        </div>

        {/* Title & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium truncate">{folder.title}</span>
            <span className="text-xs text-slate-500 shrink-0">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
          {folder.description && (
            <p className="text-xs text-slate-500 truncate">{folder.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onAddContent(folder.id, sectionId)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
            title="Add Content"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onAddFolder(folder.id, sectionId)}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
            title="Add Sub-folder"
          >
            <Folder size={14} />
          </button>
          {canAIGenerate ? (
            <button
              onClick={() => onAIGenerate(folder.id, sectionId)}
              className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg"
              title="AI Generate"
            >
              <Sparkles size={14} />
            </button>
          ) : aiDisabledReason && (
            <button
              className="p-1.5 text-slate-600 cursor-not-allowed rounded-lg"
              title={aiDisabledReason}
              disabled
            >
              <Sparkles size={14} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => { onEditFolder(folder); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => { onDeleteFolder(folder.id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {/* Content Items */}
              {folder.content.length > 0 && (
                <div className={`space-y-1 ${depth >= 0 ? 'ml-6 pl-4 border-l-2 border-slate-700/30' : ''}`}>
                  {folder.content.map((content) => (
                    <ContentItemRow
                      key={content.id}
                      content={content}
                      onEdit={onEditContent}
                      onDelete={onDeleteContent}
                      onViewPresentation={onViewPresentation}
                      onSelect={onSelectContent}
                      isSelected={selectedContentId === content.id}
                    />
                  ))}
                </div>
              )}

              {/* Nested Folders */}
              {folder.children.length > 0 && (
                <FolderTree
                  folders={folder.children}
                  sectionId={sectionId}
                  depth={depth + 1}
                  canAIGenerate={canAIGenerate}
                  aiDisabledReason={aiDisabledReason}
                  onAddFolder={onAddFolder}
                  onAddContent={onAddContent}
                  onAIGenerate={onAIGenerate}
                  onEditContent={onEditContent}
                  onDeleteContent={onDeleteContent}
                  onDeleteFolder={onDeleteFolder}
                  onEditFolder={onEditFolder}
                  onViewPresentation={onViewPresentation}
                  onSelectContent={onSelectContent}
                  selectedContentId={selectedContentId}
                  expandedFolders={expandedFolders}
                  onToggleFolder={onToggleFolder}
                />
              )}

              {/* Empty State */}
              {folder.children.length === 0 && folder.content.length === 0 && (
                <div className={`py-6 text-center ${depth >= 0 ? 'ml-6 pl-4 border-l-2 border-slate-700/30' : ''}`}>
                  <div className="text-slate-600 text-sm">
                    No content yet
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={() => onAddContent(folder.id, sectionId)}
                      className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                    >
                      <Plus size={12} className="inline mr-1" /> Add Content
                    </button>
                    <button
                      onClick={() => onAddFolder(folder.id, sectionId)}
                      className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-500/10"
                    >
                      <Folder size={12} className="inline mr-1" /> Add Folder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ContentItemRowProps {
  content: ContentItem;
  onEdit: (content: ContentItem) => void;
  onDelete: (contentId: string) => void;
  onViewPresentation: (content: ContentItem) => void;
  onSelect?: (content: ContentItem) => void;
  isSelected?: boolean;
}

function ContentItemRow({ content, onEdit, onDelete, onViewPresentation, onSelect, isSelected }: ContentItemRowProps) {
  const typeInfo = CONTENT_TYPE_INFO[content.content_type] || CONTENT_TYPE_INFO.external_link;
  const Icon = typeInfo.icon;
  const hasPresentation = content.content_type === 'presentation' && content.content_data;

  const handleClick = () => {
    if (onSelect) {
      onSelect(content);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className={`group/content flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
        isSelected 
          ? 'bg-purple-500/20 border border-purple-500/40 ring-1 ring-purple-500/30' 
          : 'hover:bg-slate-800/40'
      }`}
    >
      {/* Drag Handle */}
      <div className="opacity-0 group-hover/content:opacity-100 cursor-grab text-slate-600 hover:text-slate-400 transition-opacity">
        <GripVertical size={14} />
      </div>

      {/* Type Icon */}
      <div className={`w-8 h-8 rounded-lg ${typeInfo.bg} flex items-center justify-center`}>
        <Icon size={16} className={typeInfo.color} />
      </div>

      {/* Title & Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-medium truncate">{content.title}</span>
          <span className="text-xs text-slate-600 capitalize shrink-0">
            {content.content_type.replace('_', ' ')}
          </span>
          {content.content_data && (
            <span className="text-xs text-purple-400 shrink-0">• AI</span>
          )}
        </div>
        {content.description && (
          <p className="text-xs text-slate-500 truncate">{content.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover/content:opacity-100 transition-opacity">
        {hasPresentation && (
          <button
            onClick={() => onViewPresentation(content)}
            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
            title="View Presentation"
          >
            <Play size={14} />
          </button>
        )}
        {content.external_url && (
          <a
            href={content.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
            title="Open Link"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button
          onClick={() => onEdit(content)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
          title="Edit"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={() => onDelete(content.id)}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default FolderTree;


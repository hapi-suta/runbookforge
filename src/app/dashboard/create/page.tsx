'use client'

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Code, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Server,
  ChevronDown,
  ChevronUp,
  Eye,
  Save,
  Download,
  Settings
} from "lucide-react";

type BlockType = 'step' | 'code' | 'warning' | 'info' | 'success' | 'note';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  title?: string;
  language?: string;
  serverRole?: string;
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
  isCollapsed: boolean;
}

const blockTypes: { type: BlockType; label: string; icon: any; color: string }[] = [
  { type: 'step', label: 'Step', icon: CheckCircle, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { type: 'code', label: 'Code Block', icon: Code, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  { type: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { type: 'info', label: 'Info', icon: Info, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { type: 'success', label: 'Success', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { type: 'note', label: 'Note', icon: Info, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
];

const serverRoles = ['All Servers', 'Primary', 'Replica', 'Witness', 'Load Balancer', 'Custom...'];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function CreateRunbookPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([
    {
      id: generateId(),
      title: 'Getting Started',
      blocks: [],
      isCollapsed: false,
    }
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: generateId(),
        title: `Section ${sections.length + 1}`,
        blocks: [],
        isCollapsed: false,
      }
    ]);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    ));
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== sectionId));
    }
  };

  const addBlock = (sectionId: string, type: BlockType) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: [
            ...s.blocks,
            {
              id: generateId(),
              type,
              content: '',
              title: type === 'step' ? 'New Step' : undefined,
              language: type === 'code' ? 'bash' : undefined,
            }
          ]
        };
      }
      return s;
    }));
  };

  const updateBlock = (sectionId: string, blockId: string, updates: Partial<Block>) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: s.blocks.map(b => 
            b.id === blockId ? { ...b, ...updates } : b
          )
        };
      }
      return s;
    }));
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: s.blocks.filter(b => b.id !== blockId)
        };
      }
      return s;
    }));
  };

  const reorderBlocks = (sectionId: string, newBlocks: Block[]) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, blocks: newBlocks } : s
    ));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Runbook</h1>
          <p className="text-slate-400">Build your technical procedure step by step</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-all"
          >
            <Eye size={18} />
            Preview
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20">
            <Save size={18} />
            Save
          </button>
        </div>
      </motion.div>

      {/* Main Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Title & Description */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Runbook Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., PostgreSQL Patroni HA Setup"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this runbook..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 border-b border-slate-800">
              <button
                onClick={() => updateSection(section.id, { isCollapsed: !section.isCollapsed })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {section.isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="flex-1 bg-transparent text-white font-semibold focus:outline-none"
                placeholder="Section Title"
              />
              <span className="text-sm text-slate-500">
                {section.blocks.length} block{section.blocks.length !== 1 ? 's' : ''}
              </span>
              {sections.length > 1 && (
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Section Content */}
            <AnimatePresence>
              {!section.isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 space-y-4"
                >
                  {/* Blocks */}
                  <Reorder.Group
                    axis="y"
                    values={section.blocks}
                    onReorder={(newBlocks) => reorderBlocks(section.id, newBlocks)}
                    className="space-y-3"
                  >
                    {section.blocks.map((block, blockIndex) => {
                      const blockType = blockTypes.find(b => b.type === block.type);
                      return (
                        <Reorder.Item
                          key={block.id}
                          value={block}
                          className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
                        >
                          <div className="flex items-start gap-3 p-4">
                            <div className="cursor-grab text-slate-600 hover:text-slate-400 mt-1">
                              <GripVertical size={18} />
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${blockType?.color}`}>
                                  {blockType && <blockType.icon size={12} />}
                                  {blockType?.label}
                                </span>
                                
                                {block.type === 'step' && (
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
                                    className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                                    placeholder="Step title..."
                                  />
                                )}
                                
                                {block.type === 'code' && (
                                  <select
                                    value={block.language || 'bash'}
                                    onChange={(e) => updateBlock(section.id, block.id, { language: e.target.value })}
                                    className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none"
                                  >
                                    <option value="bash">bash</option>
                                    <option value="sql">sql</option>
                                    <option value="yaml">yaml</option>
                                    <option value="json">json</option>
                                    <option value="python">python</option>
                                  </select>
                                )}
                              </div>
                              
                              {block.type === 'step' && (
                                <select
                                  value={block.serverRole || ''}
                                  onChange={(e) => updateBlock(section.id, block.id, { serverRole: e.target.value })}
                                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none"
                                >
                                  <option value="">Select server role...</option>
                                  {serverRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                </select>
                              )}
                              
                              <textarea
                                value={block.content}
                                onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
                                placeholder={block.type === 'code' ? 'Enter your code...' : 'Enter content...'}
                                rows={block.type === 'code' ? 4 : 2}
                                className={`w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors resize-none ${block.type === 'code' ? 'font-mono text-sm' : ''}`}
                              />
                            </div>
                            
                            <button
                              onClick={() => deleteBlock(section.id, block.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors mt-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>

                  {/* Add Block Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {blockTypes.map((bt) => (
                      <button
                        key={bt.type}
                        onClick={() => addBlock(section.id, bt.type)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                      >
                        <Plus size={14} />
                        <bt.icon size={14} />
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Add Section */}
        <button
          onClick={addSection}
          className="w-full p-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Section
        </button>
      </motion.div>
    </div>
  );
}

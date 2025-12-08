'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Code, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  ArrowLeft,
  Table,
  LayoutGrid,
  Columns,
  FileText,
  X,
  Server
} from "lucide-react";
import Link from "next/link";

type BlockType = 'step' | 'code' | 'warning' | 'info' | 'success' | 'note' | 'table' | 'cardgrid' | 'twocolumn' | 'header';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  title?: string;
  language?: string;
  serverRole?: string;
  tableData?: { headers: string[]; rows: string[][] };
  cards?: { title: string; content: string; color?: string }[];
  leftContent?: string;
  rightContent?: string;
  leftTitle?: string;
  rightTitle?: string;
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
  isCollapsed: boolean;
}

const blockTypes: { type: BlockType; label: string; icon: any; color: string; description: string }[] = [
  { type: 'step', label: 'Step', icon: CheckCircle, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', description: 'Action step' },
  { type: 'code', label: 'Code', icon: Code, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', description: 'Code block' },
  { type: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', description: 'Warning callout' },
  { type: 'info', label: 'Info', icon: Info, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', description: 'Info callout' },
  { type: 'header', label: 'Header', icon: FileText, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', description: 'Section header' },
  { type: 'table', label: 'Table', icon: Table, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', description: 'Data table' },
  { type: 'cardgrid', label: 'Cards', icon: LayoutGrid, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', description: 'Card grid' },
  { type: 'twocolumn', label: '2-Column', icon: Columns, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', description: 'Side by side' },
];

const suggestedRoles = ['All Servers', 'Primary', 'Replica', 'Standby', 'Witness', 'Load Balancer', 'etcd', 'App Server', 'DR Replica'];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Tag Input Component
function TagInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  const filteredSuggestions = suggestedRoles.filter(role => 
    role.toLowerCase().includes(inputValue.toLowerCase()) && role !== inputValue
  );

  const handleSelect = (role: string) => {
    setInputValue(role);
    onChange(role);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Server size={14} className="text-slate-500" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder || "Server role (e.g., Primary, etcd)"}
          className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        {inputValue && (
          <button
            onClick={() => { setInputValue(''); onChange(''); }}
            className="text-slate-500 hover:text-slate-300"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
          {filteredSuggestions.map(role => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Table Editor Component
function TableEditor({ data, onChange }: { data: { headers: string[]; rows: string[][] }; onChange: (d: any) => void }) {
  const addColumn = () => {
    onChange({
      headers: [...data.headers, `Column ${data.headers.length + 1}`],
      rows: data.rows.map(row => [...row, ''])
    });
  };

  const addRow = () => {
    onChange({
      ...data,
      rows: [...data.rows, data.headers.map(() => '')]
    });
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...data.headers];
    newHeaders[index] = value;
    onChange({ ...data, headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...data.rows];
    newRows[rowIndex][colIndex] = value;
    onChange({ ...data, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (data.headers.length <= 1) return;
    onChange({
      headers: data.headers.filter((_, i) => i !== index),
      rows: data.rows.map(row => row.filter((_, i) => i !== index))
    });
  };

  const removeRow = (index: number) => {
    onChange({
      ...data,
      rows: data.rows.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {data.headers.map((header, i) => (
                <th key={i} className="relative group">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 text-white font-medium focus:outline-none focus:border-teal-500"
                    placeholder="Header"
                  />
                  {data.headers.length > 1 && (
                    <button
                      onClick={() => removeColumn(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  )}
                </th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-teal-500"
                      placeholder="..."
                    />
                  </td>
                ))}
                <td className="w-8">
                  <button
                    onClick={() => removeRow(rowIndex)}
                    className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={addColumn} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Column</button>
        <button onClick={addRow} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Row</button>
      </div>
    </div>
  );
}

// Card Grid Editor Component
function CardGridEditor({ cards, onChange }: { cards: { title: string; content: string; color?: string }[]; onChange: (c: any) => void }) {
  const colors = ['teal', 'blue', 'violet', 'amber', 'emerald', 'rose'];

  const addCard = () => {
    onChange([...cards, { title: 'New Card', content: '', color: colors[cards.length % colors.length] }]);
  };

  const updateCard = (index: number, updates: any) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], ...updates };
    onChange(newCards);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div key={i} className="relative group">
            <div className={`p-3 bg-slate-800 border border-slate-700 rounded-lg`}>
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCard(i, { title: e.target.value })}
                className="w-full bg-transparent text-sm font-medium text-teal-400 focus:outline-none mb-1"
                placeholder="Title"
              />
              <input
                type="text"
                value={card.content}
                onChange={(e) => updateCard(i, { content: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-400 focus:outline-none"
                placeholder="Content"
              />
            </div>
            <button
              onClick={() => removeCard(i)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addCard} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Card</button>
    </div>
  );
}

// Two Column Editor Component
function TwoColumnEditor({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <input
          type="text"
          value={block.leftTitle || ''}
          onChange={(e) => onChange({ leftTitle: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-emerald-400 font-medium focus:outline-none focus:border-teal-500"
          placeholder="Left column title"
        />
        <textarea
          value={block.leftContent || ''}
          onChange={(e) => onChange({ leftContent: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none focus:border-teal-500 resize-none"
          rows={4}
          placeholder="Left column content (use • for bullets)"
        />
      </div>
      <div className="space-y-2">
        <input
          type="text"
          value={block.rightTitle || ''}
          onChange={(e) => onChange({ rightTitle: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-amber-400 font-medium focus:outline-none focus:border-teal-500"
          placeholder="Right column title"
        />
        <textarea
          value={block.rightContent || ''}
          onChange={(e) => onChange({ rightContent: e.target.value })}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none focus:border-teal-500 resize-none"
          rows={4}
          placeholder="Right column content (use • for bullets)"
        />
      </div>
    </div>
  );
}

export default function CreateRunbookPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([
    {
      id: generateId(),
      title: 'Overview',
      blocks: [],
      isCollapsed: false,
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      title: type === 'step' ? 'New Step' : type === 'header' ? 'Section Header' : undefined,
      language: type === 'code' ? 'bash' : undefined,
      tableData: type === 'table' ? { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', '']] } : undefined,
      cards: type === 'cardgrid' ? [{ title: 'Card 1', content: '/path/example', color: 'teal' }] : undefined,
      leftTitle: type === 'twocolumn' ? 'Left Side' : undefined,
      rightTitle: type === 'twocolumn' ? 'Right Side' : undefined,
      leftContent: type === 'twocolumn' ? '' : undefined,
      rightContent: type === 'twocolumn' ? '' : undefined,
    };

    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, blocks: [...s.blocks, newBlock] };
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
        return { ...s, blocks: s.blocks.filter(b => b.id !== blockId) };
      }
      return s;
    }));
  };

  const reorderBlocks = (sectionId: string, newBlocks: Block[]) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, blocks: newBlocks } : s
    ));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your runbook');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/runbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, sections }),
      });

      if (!response.ok) throw new Error('Failed to save runbook');

      router.push('/dashboard/runbooks');
    } catch (err) {
      setError('Failed to save runbook. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderBlockEditor = (section: Section, block: Block) => {
    const blockType = blockTypes.find(b => b.type === block.type);

    switch (block.type) {
      case 'table':
        return (
          <TableEditor
            data={block.tableData || { headers: ['Col 1'], rows: [['']] }}
            onChange={(tableData) => updateBlock(section.id, block.id, { tableData })}
          />
        );

      case 'cardgrid':
        return (
          <CardGridEditor
            cards={block.cards || []}
            onChange={(cards) => updateBlock(section.id, block.id, { cards })}
          />
        );

      case 'twocolumn':
        return (
          <TwoColumnEditor
            block={block}
            onChange={(updates) => updateBlock(section.id, block.id, updates)}
          />
        );

      case 'header':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-lg text-teal-400 font-semibold focus:outline-none focus:border-teal-500"
              placeholder="Header title"
            />
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500 resize-none"
              rows={2}
              placeholder="Subtitle or description..."
            />
          </div>
        );

      case 'step':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={block.title || ''}
                onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
                className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                placeholder="Step title..."
              />
            </div>
            <TagInput
              value={block.serverRole || ''}
              onChange={(serverRole) => updateBlock(section.id, block.id, { serverRole })}
              placeholder="Server role (type or select)"
            />
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
              placeholder="Step instructions..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-2">
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
              <option value="javascript">javascript</option>
            </select>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
              placeholder="Enter your code..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>
        );

      default:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
            placeholder="Enter content..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 resize-none"
          />
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/runbooks"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Create Runbook</h1>
            <p className="text-slate-400">Build rich technical documentation</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Runbook</>}
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </motion.div>
      )}

      {/* Editor */}
      <div className="space-y-6">
        {/* Title & Description */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Runbook Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., PostgreSQL Patroni HA Setup"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <motion.div key={section.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 border-b border-slate-800">
              <button onClick={() => updateSection(section.id, { isCollapsed: !section.isCollapsed })} className="text-slate-400 hover:text-white">
                {section.isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="flex-1 bg-transparent text-white font-semibold focus:outline-none"
                placeholder="Section Title"
              />
              <span className="text-sm text-slate-500">{section.blocks.length} blocks</span>
              {sections.length > 1 && (
                <button onClick={() => deleteSection(section.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Section Content */}
            <AnimatePresence>
              {!section.isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 space-y-4">
                  {/* Blocks */}
                  <Reorder.Group axis="y" values={section.blocks} onReorder={(newBlocks) => reorderBlocks(section.id, newBlocks)} className="space-y-3">
                    {section.blocks.map((block) => {
                      const blockType = blockTypes.find(b => b.type === block.type);
                      return (
                        <Reorder.Item key={block.id} value={block} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                          <div className="flex items-start gap-3 p-4">
                            <div className="cursor-grab text-slate-600 hover:text-slate-400 mt-1">
                              <GripVertical size={18} />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${blockType?.color}`}>
                                  {blockType && <blockType.icon size={12} />}
                                  {blockType?.label}
                                </span>
                              </div>
                              {renderBlockEditor(section, block)}
                            </div>
                            <button onClick={() => deleteBlock(section.id, block.id)} className="text-slate-600 hover:text-red-400 mt-1">
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
                        title={bt.description}
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
      </div>
    </div>
  );
}

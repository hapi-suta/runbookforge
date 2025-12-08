'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Tag,
  ListChecks
} from "lucide-react";
import Link from "next/link";

type BlockType = 'step' | 'code' | 'warning' | 'info' | 'note' | 'table' | 'cardgrid' | 'twocolumn' | 'header' | 'checklist';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Block {
  id: string;
  type: BlockType;
  content: string;
  title?: string;
  language?: string;
  tags?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  cards?: { title: string; content: string }[];
  leftContent?: string;
  rightContent?: string;
  leftTitle?: string;
  rightTitle?: string;
  checklist?: ChecklistItem[];
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
  isCollapsed: boolean;
}

const blockTypes: { type: BlockType; label: string; icon: any; color: string }[] = [
  { type: 'step', label: 'Step', icon: CheckCircle, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { type: 'code', label: 'Code', icon: Code, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  { type: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { type: 'info', label: 'Info', icon: Info, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { type: 'note', label: 'Note', icon: FileText, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { type: 'header', label: 'Header', icon: FileText, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { type: 'table', label: 'Table', icon: Table, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { type: 'cardgrid', label: 'Cards', icon: LayoutGrid, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { type: 'twocolumn', label: '2-Column', icon: Columns, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { type: 'checklist', label: 'Checklist', icon: ListChecks, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
];

const suggestedTags = ['Primary', 'Replica', 'Standby', 'Leader', 'etcd', 'Production', 'Staging', 'DevOps', 'DBA', 'Manual', 'Critical', 'All'];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestedTags.filter(tag => 
    tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag)
  ).slice(0, 6);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => onChange(tags.filter(t => t !== tagToRemove));

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded-lg min-h-[38px]">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
            <Tag size={10} />{tag}
            <button onClick={() => removeTag(tag)} className="hover:text-teal-200"><X size={10} /></button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => { if (e.key === 'Enter' && inputValue.trim()) { e.preventDefault(); addTag(inputValue); } }}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
          {filteredSuggestions.map(tag => (
            <button key={tag} onClick={() => addTag(tag)} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
              <Tag size={12} className="text-slate-500" />{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TableEditor({ data, onChange }: { data: { headers: string[]; rows: string[][] }; onChange: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {data.headers.map((header, i) => (
                <th key={i} className="p-0">
                  <input type="text" value={header} onChange={(e) => { const h = [...data.headers]; h[i] = e.target.value; onChange({ ...data, headers: h }); }}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 text-white font-medium focus:outline-none" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-0">
                    <input type="text" value={cell} onChange={(e) => { const r = [...data.rows]; r[ri] = [...r[ri]]; r[ri][ci] = e.target.value; onChange({ ...data, rows: r }); }}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onChange({ headers: [...data.headers, 'Column'], rows: data.rows.map(r => [...r, '']) })} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Column</button>
        <button onClick={() => onChange({ ...data, rows: [...data.rows, data.headers.map(() => '')] })} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Row</button>
      </div>
    </div>
  );
}

function CardGridEditor({ cards, onChange }: { cards: { title: string; content: string }[]; onChange: (c: any) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div key={i} className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
            <input type="text" value={card.title} onChange={(e) => { const c = [...cards]; c[i] = { ...c[i], title: e.target.value }; onChange(c); }}
              className="w-full bg-transparent text-sm font-medium text-teal-400 focus:outline-none mb-1" placeholder="Title" />
            <input type="text" value={card.content} onChange={(e) => { const c = [...cards]; c[i] = { ...c[i], content: e.target.value }; onChange(c); }}
              className="w-full bg-transparent text-xs text-slate-400 focus:outline-none" placeholder="Content" />
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...cards, { title: 'Title', content: '' }])} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Card</button>
    </div>
  );
}

function ChecklistEditor({ items, onChange }: { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2">
          <input type="checkbox" checked={item.checked} onChange={(e) => { const it = [...items]; it[i] = { ...it[i], checked: e.target.checked }; onChange(it); }} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500" />
          <input type="text" value={item.text} onChange={(e) => { const it = [...items]; it[i] = { ...it[i], text: e.target.value }; onChange(it); }} placeholder={`Item ${i + 1}`}
            className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none" />
        </div>
      ))}
      <button onClick={() => onChange([...items, { id: generateId(), text: '', checked: false }])} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Item</button>
    </div>
  );
}

export default function EditRunbookPage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRunbook();
  }, [params.id]);

  const fetchRunbook = async () => {
    try {
      const response = await fetch(`/api/runbooks/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch runbook');
      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description || '');
      setSections(data.sections?.map((s: any) => ({ ...s, isCollapsed: false })) || [{ id: generateId(), title: 'Section 1', blocks: [], isCollapsed: false }]);
    } catch (err) {
      setError('Failed to load runbook');
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => setSections([...sections, { id: generateId(), title: `Section ${sections.length + 1}`, blocks: [], isCollapsed: false }]);
  const updateSection = (id: string, updates: Partial<Section>) => setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  const deleteSection = (id: string) => { if (sections.length > 1) setSections(sections.filter(s => s.id !== id)); };

  const addBlock = (sectionId: string, type: BlockType) => {
    const newBlock: Block = {
      id: generateId(), type, content: '',
      title: ['step', 'header'].includes(type) ? '' : undefined,
      language: type === 'code' ? 'bash' : undefined,
      tags: ['step', 'code', 'warning'].includes(type) ? [] : undefined,
      tableData: type === 'table' ? { headers: ['Col 1', 'Col 2'], rows: [['', '']] } : undefined,
      cards: type === 'cardgrid' ? [{ title: 'Title', content: '' }] : undefined,
      leftTitle: type === 'twocolumn' ? '' : undefined,
      rightTitle: type === 'twocolumn' ? '' : undefined,
      checklist: type === 'checklist' ? [{ id: generateId(), text: '', checked: false }] : undefined,
    };
    setSections(sections.map(s => s.id === sectionId ? { ...s, blocks: [...s.blocks, newBlock] } : s));
  };

  const updateBlock = (sectionId: string, blockId: string, updates: Partial<Block>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, blocks: s.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) } : s));
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) } : s));
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a title'); return; }
    setIsSaving(true); setError(null);
    try {
      const response = await fetch(`/api/runbooks/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), sections }),
      });
      if (!response.ok) throw new Error('Failed to save');
      router.push(`/dashboard/runbooks/${params.id}`);
    } catch (err) {
      setError('Failed to save runbook');
    } finally {
      setIsSaving(false);
    }
  };

  const renderBlockEditor = (section: Section, block: Block) => {
    switch (block.type) {
      case 'table': return <TableEditor data={block.tableData || { headers: ['Col'], rows: [['']] }} onChange={(d) => updateBlock(section.id, block.id, { tableData: d })} />;
      case 'cardgrid': return <CardGridEditor cards={block.cards || []} onChange={(c) => updateBlock(section.id, block.id, { cards: c })} />;
      case 'checklist': return <ChecklistEditor items={block.checklist || []} onChange={(items) => updateBlock(section.id, block.id, { checklist: items })} />;
      case 'twocolumn':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <input type="text" value={block.leftTitle || ''} onChange={(e) => updateBlock(section.id, block.id, { leftTitle: e.target.value })} className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-emerald-400 font-medium focus:outline-none" placeholder="Left title" />
              <textarea value={block.leftContent || ''} onChange={(e) => updateBlock(section.id, block.id, { leftContent: e.target.value })} rows={3} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none resize-none" placeholder="Content..." />
            </div>
            <div className="space-y-2">
              <input type="text" value={block.rightTitle || ''} onChange={(e) => updateBlock(section.id, block.id, { rightTitle: e.target.value })} className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-amber-400 font-medium focus:outline-none" placeholder="Right title" />
              <textarea value={block.rightContent || ''} onChange={(e) => updateBlock(section.id, block.id, { rightContent: e.target.value })} rows={3} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none resize-none" placeholder="Content..." />
            </div>
          </div>
        );
      case 'header':
        return (
          <div className="space-y-2">
            <input type="text" value={block.title || ''} onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-lg text-teal-400 font-semibold focus:outline-none" placeholder="Header title" />
            <textarea value={block.content} onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none resize-none" placeholder="Subtitle..." />
          </div>
        );
      case 'step':
        return (
          <div className="space-y-3">
            <input type="text" value={block.title || ''} onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })} className="w-full bg-transparent text-white font-medium focus:outline-none" placeholder="Step title..." />
            <TagsInput tags={block.tags || []} onChange={(tags) => updateBlock(section.id, block.id, { tags })} />
            <textarea value={block.content} onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none resize-none" placeholder="Instructions..." />
          </div>
        );
      case 'code':
        return (
          <div className="space-y-2">
            <select value={block.language || 'bash'} onChange={(e) => updateBlock(section.id, block.id, { language: e.target.value })} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none">
              <option value="bash">bash</option><option value="sql">sql</option><option value="yaml">yaml</option><option value="json">json</option><option value="python">python</option>
            </select>
            <TagsInput tags={block.tags || []} onChange={(tags) => updateBlock(section.id, block.id, { tags })} />
            <textarea value={block.content} onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })} rows={4} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none resize-none" placeholder="Code..." />
          </div>
        );
      case 'warning':
        return (
          <div className="space-y-2">
            <TagsInput tags={block.tags || []} onChange={(tags) => updateBlock(section.id, block.id, { tags })} />
            <textarea value={block.content} onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 focus:outline-none resize-none" placeholder="Warning..." />
          </div>
        );
      default:
        return <textarea value={block.content} onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none resize-none" placeholder="Content..." />;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 size={32} className="text-teal-500 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/runbooks/${params.id}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Edit Runbook</h1>
            <p className="text-slate-400">Make changes to your runbook</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50">
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
        </button>
      </motion.div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex justify-between"><span>{error}</span><button onClick={() => setError(null)}><X size={18} /></button></div>}

      <div className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none" />
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 border-b border-slate-800">
              <button onClick={() => updateSection(section.id, { isCollapsed: !section.isCollapsed })} className="text-slate-400 hover:text-white">
                {section.isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              <input type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} className="flex-1 bg-transparent text-white font-semibold focus:outline-none" />
              <span className="text-sm text-slate-500">{section.blocks.length} blocks</span>
              {sections.length > 1 && <button onClick={() => deleteSection(section.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>}
            </div>
            <AnimatePresence>
              {!section.isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 space-y-4">
                  <Reorder.Group axis="y" values={section.blocks} onReorder={(blocks) => updateSection(section.id, { blocks })} className="space-y-3">
                    {section.blocks.map((block) => {
                      const bt = blockTypes.find(b => b.type === block.type);
                      return (
                        <Reorder.Item key={block.id} value={block} className="bg-slate-800/50 border border-slate-700 rounded-lg">
                          <div className="flex items-start gap-3 p-4">
                            <div className="cursor-grab text-slate-600 hover:text-slate-400 mt-1"><GripVertical size={18} /></div>
                            <div className="flex-1 space-y-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${bt?.color}`}>{bt && <bt.icon size={12} />}{bt?.label}</span>
                              {renderBlockEditor(section, block)}
                            </div>
                            <button onClick={() => deleteBlock(section.id, block.id)} className="text-slate-600 hover:text-red-400 mt-1"><Trash2 size={16} /></button>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {blockTypes.map((bt) => (
                      <button key={bt.type} onClick={() => addBlock(section.id, bt.type)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-white hover:border-slate-600">
                        <Plus size={14} /><bt.icon size={14} />{bt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <button onClick={addSection} className="w-full p-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center gap-2">
          <Plus size={20} /> Add Section
        </button>
      </div>
    </div>
  );
}

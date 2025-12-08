'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Plus, Trash2, GripVertical, Code, AlertTriangle, Info, CheckCircle,
  ChevronDown, ChevronUp, Save, Loader2, ArrowLeft, Table, LayoutGrid,
  Columns, FileText, X, Tag, ListChecks
} from "lucide-react";
import Link from "next/link";

type BlockType = 'step' | 'code' | 'warning' | 'info' | 'note' | 'table' | 'cardgrid' | 'twocolumn' | 'header' | 'checklist';

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
  checklist?: { id: string; text: string; checked: boolean }[];
}

interface Section {
  id: string;
  title: string;
  blocks: Block[];
  isCollapsed: boolean;
}

const blockTypes: { type: BlockType; label: string; icon: any; color: string; desc: string }[] = [
  { type: 'step', label: 'Step', icon: CheckCircle, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', desc: 'Action step' },
  { type: 'code', label: 'Code', icon: Code, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', desc: 'Code block' },
  { type: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', desc: 'Warning' },
  { type: 'info', label: 'Info', icon: Info, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', desc: 'Info box' },
  { type: 'note', label: 'Note', icon: FileText, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', desc: 'Note' },
  { type: 'header', label: 'Header', icon: FileText, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', desc: 'Section header' },
  { type: 'table', label: 'Table', icon: Table, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', desc: 'Data table' },
  { type: 'cardgrid', label: 'Cards', icon: LayoutGrid, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', desc: 'Card grid' },
  { type: 'twocolumn', label: '2-Col', icon: Columns, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', desc: 'Two columns' },
  { type: 'checklist', label: 'Checklist', icon: ListChecks, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', desc: 'Task list' },
];

const suggestedTags = ['Primary', 'Replica', 'Standby', 'Leader', 'etcd', 'Production', 'Staging', 'DevOps', 'DBA', 'Manual', 'Critical', 'All'];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Components
function TagsInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const filtered = suggestedTags.filter(t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t)).slice(0, 6);
  const add = (t: string) => { if (t.trim() && !tags.includes(t.trim())) onChange([...tags, t.trim()]); setInput(''); setShow(false); };
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-800 border border-slate-700 rounded-lg min-h-[38px]">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
            <Tag size={10} />{t}<button onClick={() => onChange(tags.filter(x => x !== t))}><X size={10} /></button>
          </span>
        ))}
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 150)}
          onKeyDown={e => e.key === 'Enter' && input.trim() && (e.preventDefault(), add(input))}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none" placeholder={tags.length ? '' : 'Tags...'} />
      </div>
      {show && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
          {filtered.map(t => <button key={t} onClick={() => add(t)} className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"><Tag size={12} />{t}</button>)}
        </div>
      )}
    </div>
  );
}

function TableEditor({ data, onChange }: { data: { headers: string[]; rows: string[][] }; onChange: (d: any) => void }) {
  return (
    <div className="space-y-2 overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr>{data.headers.map((h, i) => <th key={i} className="p-0"><input type="text" value={h} onChange={e => { const hs = [...data.headers]; hs[i] = e.target.value; onChange({ ...data, headers: hs }); }} className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 text-white font-medium focus:outline-none" /></th>)}</tr></thead>
        <tbody>{data.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} className="p-0"><input type="text" value={c} onChange={e => { const rs = [...data.rows]; rs[ri] = [...rs[ri]]; rs[ri][ci] = e.target.value; onChange({ ...data, rows: rs }); }} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none" /></td>)}</tr>)}</tbody>
      </table>
      <div className="flex gap-2">
        <button onClick={() => onChange({ headers: [...data.headers, 'Col'], rows: data.rows.map(r => [...r, '']) })} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">+ Col</button>
        <button onClick={() => onChange({ ...data, rows: [...data.rows, data.headers.map(() => '')] })} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">+ Row</button>
      </div>
    </div>
  );
}

function CardGridEditor({ cards, onChange }: { cards: { title: string; content: string }[]; onChange: (c: any) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c, i) => (
          <div key={i} className="p-2 bg-slate-800 border border-slate-700 rounded">
            <input type="text" value={c.title} onChange={e => { const cs = [...cards]; cs[i] = { ...cs[i], title: e.target.value }; onChange(cs); }} className="w-full bg-transparent text-xs font-medium text-teal-400 focus:outline-none" placeholder="Title" />
            <input type="text" value={c.content} onChange={e => { const cs = [...cards]; cs[i] = { ...cs[i], content: e.target.value }; onChange(cs); }} className="w-full bg-transparent text-xs text-slate-400 focus:outline-none" placeholder="Content" />
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...cards, { title: '', content: '' }])} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">+ Card</button>
    </div>
  );
}

function ChecklistEditor({ items, onChange }: { items: { id: string; text: string; checked: boolean }[]; onChange: (i: any) => void }) {
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={it.id} className="flex items-center gap-2">
          <input type="checkbox" checked={it.checked} onChange={e => { const is = [...items]; is[i] = { ...is[i], checked: e.target.checked }; onChange(is); }} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500" />
          <input type="text" value={it.text} onChange={e => { const is = [...items]; is[i] = { ...is[i], text: e.target.value }; onChange(is); }} className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none" placeholder={`Item ${i + 1}`} />
        </div>
      ))}
      <button onClick={() => onChange([...items, { id: generateId(), text: '', checked: false }])} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">+ Item</button>
    </div>
  );
}

export default function CreateRunbookPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([{ id: generateId(), title: 'Getting Started', blocks: [], isCollapsed: false }]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSection = () => setSections([...sections, { id: generateId(), title: `Section ${sections.length + 1}`, blocks: [], isCollapsed: false }]);
  const updateSection = (id: string, u: Partial<Section>) => setSections(sections.map(s => s.id === id ? { ...s, ...u } : s));
  const deleteSection = (id: string) => sections.length > 1 && setSections(sections.filter(s => s.id !== id));

  const addBlock = (sid: string, type: BlockType) => {
    const b: Block = {
      id: generateId(), type, content: '',
      title: ['step', 'header'].includes(type) ? '' : undefined,
      language: type === 'code' ? 'bash' : undefined,
      tags: ['step', 'code', 'warning'].includes(type) ? [] : undefined,
      tableData: type === 'table' ? { headers: ['Column 1', 'Column 2'], rows: [['', '']] } : undefined,
      cards: type === 'cardgrid' ? [{ title: '', content: '' }] : undefined,
      leftTitle: type === 'twocolumn' ? '' : undefined, rightTitle: type === 'twocolumn' ? '' : undefined,
      checklist: type === 'checklist' ? [{ id: generateId(), text: '', checked: false }] : undefined,
    };
    setSections(sections.map(s => s.id === sid ? { ...s, blocks: [...s.blocks, b] } : s));
  };

  const updateBlock = (sid: string, bid: string, u: Partial<Block>) => setSections(sections.map(s => s.id === sid ? { ...s, blocks: s.blocks.map(b => b.id === bid ? { ...b, ...u } : b) } : s));
  const deleteBlock = (sid: string, bid: string) => setSections(sections.map(s => s.id === sid ? { ...s, blocks: s.blocks.filter(b => b.id !== bid) } : s));

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a title'); return; }
    setIsSaving(true); setError(null);
    try {
      const res = await fetch('/api/runbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), description: description.trim(), sections }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push('/dashboard/runbooks');
    } catch (e: any) { setError(e.message); } finally { setIsSaving(false); }
  };

  const renderEditor = (s: Section, b: Block) => {
    switch (b.type) {
      case 'table': return <TableEditor data={b.tableData || { headers: ['Col'], rows: [['']] }} onChange={d => updateBlock(s.id, b.id, { tableData: d })} />;
      case 'cardgrid': return <CardGridEditor cards={b.cards || []} onChange={c => updateBlock(s.id, b.id, { cards: c })} />;
      case 'checklist': return <ChecklistEditor items={b.checklist || []} onChange={i => updateBlock(s.id, b.id, { checklist: i })} />;
      case 'twocolumn': return (
        <div className="grid grid-cols-2 gap-3">
          <div><input type="text" value={b.leftTitle || ''} onChange={e => updateBlock(s.id, b.id, { leftTitle: e.target.value })} className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-emerald-400 font-medium focus:outline-none mb-1" placeholder="Left title" />
            <textarea value={b.leftContent || ''} onChange={e => updateBlock(s.id, b.id, { leftContent: e.target.value })} rows={3} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none resize-none" placeholder="Content..." /></div>
          <div><input type="text" value={b.rightTitle || ''} onChange={e => updateBlock(s.id, b.id, { rightTitle: e.target.value })} className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-amber-400 font-medium focus:outline-none mb-1" placeholder="Right title" />
            <textarea value={b.rightContent || ''} onChange={e => updateBlock(s.id, b.id, { rightContent: e.target.value })} rows={3} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 focus:outline-none resize-none" placeholder="Content..." /></div>
        </div>
      );
      case 'header': return (
        <div className="space-y-1.5">
          <input type="text" value={b.title || ''} onChange={e => updateBlock(s.id, b.id, { title: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-lg text-teal-400 font-semibold focus:outline-none" placeholder="Header title" />
          <textarea value={b.content} onChange={e => updateBlock(s.id, b.id, { content: e.target.value })} rows={1} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-300 focus:outline-none resize-none" placeholder="Subtitle..." />
        </div>
      );
      case 'step': return (
        <div className="space-y-2">
          <input type="text" value={b.title || ''} onChange={e => updateBlock(s.id, b.id, { title: e.target.value })} className="w-full bg-transparent text-white font-medium focus:outline-none" placeholder="Step title..." />
          <TagsInput tags={b.tags || []} onChange={t => updateBlock(s.id, b.id, { tags: t })} />
          <textarea value={b.content} onChange={e => updateBlock(s.id, b.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none resize-none" placeholder="Instructions..." />
        </div>
      );
      case 'code': return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select value={b.language || 'bash'} onChange={e => updateBlock(s.id, b.id, { language: e.target.value })} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none">
              <option value="bash">bash</option><option value="sql">sql</option><option value="yaml">yaml</option><option value="json">json</option><option value="python">python</option>
            </select>
          </div>
          <TagsInput tags={b.tags || []} onChange={t => updateBlock(s.id, b.id, { tags: t })} />
          <textarea value={b.content} onChange={e => updateBlock(s.id, b.id, { content: e.target.value })} rows={4} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-sm focus:outline-none resize-none" placeholder="Code..." />
        </div>
      );
      case 'warning': return (
        <div className="space-y-2">
          <TagsInput tags={b.tags || []} onChange={t => updateBlock(s.id, b.id, { tags: t })} />
          <textarea value={b.content} onChange={e => updateBlock(s.id, b.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 focus:outline-none resize-none" placeholder="Warning..." />
        </div>
      );
      default: return <textarea value={b.content} onChange={e => updateBlock(s.id, b.id, { content: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none resize-none" placeholder="Content..." />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/runbooks" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-white">Create Runbook</h1>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 text-sm">
          {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save</>}
        </button>
      </motion.div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex justify-between"><span>{error}</span><button onClick={() => setError(null)}><X size={16} /></button></div>}

      <div className="space-y-4">
        {/* Title & Description */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Runbook title *" className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg font-medium focus:outline-none focus:border-teal-500" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500 resize-none" />
        </div>

        {/* Sections */}
        {sections.map(section => (
          <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-800">
              <button onClick={() => updateSection(section.id, { isCollapsed: !section.isCollapsed })} className="text-slate-400 hover:text-white">{section.isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
              <input type="text" value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })} className="flex-1 bg-transparent text-white font-medium focus:outline-none text-sm" />
              <span className="text-xs text-slate-500">{section.blocks.length}</span>
              {sections.length > 1 && <button onClick={() => deleteSection(section.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>}
            </div>
            <AnimatePresence>
              {!section.isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 space-y-3">
                  <Reorder.Group axis="y" values={section.blocks} onReorder={blocks => updateSection(section.id, { blocks })} className="space-y-3">
                    {section.blocks.map(block => {
                      const bt = blockTypes.find(x => x.type === block.type);
                      return (
                        <Reorder.Item key={block.id} value={block} className="bg-slate-800/50 border border-slate-700 rounded-lg">
                          <div className="flex items-start gap-2 p-3">
                            <div className="cursor-grab text-slate-600 hover:text-slate-400 mt-1"><GripVertical size={16} /></div>
                            <div className="flex-1 space-y-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${bt?.color}`}>{bt && <bt.icon size={10} />}{bt?.label}</span>
                              {renderEditor(section, block)}
                            </div>
                            <button onClick={() => deleteBlock(section.id, block.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {blockTypes.map(bt => (
                      <button key={bt.type} onClick={() => addBlock(section.id, bt.type)} title={bt.desc} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-white hover:border-slate-600">
                        <bt.icon size={12} />{bt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <button onClick={addSection} className="w-full p-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 text-sm flex items-center justify-center gap-2">
          <Plus size={16} /> Add Section
        </button>
      </div>
    </div>
  );
}

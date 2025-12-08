'use client'

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Plus, Trash2, GripVertical, Code, AlertTriangle, Info, CheckCircle,
  ChevronDown, ChevronUp, Save, Loader2, ArrowLeft, Table, LayoutGrid,
  Columns, FileText, X, Tag, ListChecks, Server, Network, FolderOpen, ArrowRight
} from "lucide-react";
import Link from "next/link";
import ColorPicker, { getColorClasses, colorOptions } from "@/components/ColorPicker";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />
});

type BlockType = 'step' | 'code' | 'warning' | 'info' | 'note' | 'table' | 'cardgrid' | 'twocolumn' | 'header' | 'checklist' | 'servertable' | 'portref' | 'infocards' | 'flowcards';

interface Card {
  title: string;
  content: string;
  color?: string;
}

interface ServerRow {
  hostname: string;
  role: string;
  roleColor: string;
  ip: string;
  region: string;
  components: string;
}

interface PortItem {
  name: string;
  port: string;
  color: string;
}

interface FlowItem {
  flow: string;
  color: string;
}

interface Block {
  id: string;
  type: BlockType;
  content: string;
  title?: string;
  language?: string;
  tags?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  cards?: Card[];
  leftContent?: string;
  rightContent?: string;
  leftTitle?: string;
  rightTitle?: string;
  leftColor?: string;
  rightColor?: string;
  checklist?: { id: string; text: string; checked: boolean }[];
  servers?: ServerRow[];
  ports?: PortItem[];
  infocards?: Card[];
  flows?: FlowItem[];
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
  { type: 'header', label: 'Header', icon: FileText, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', desc: 'Section header' },
  { type: 'table', label: 'Table', icon: Table, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', desc: 'Data table' },
  { type: 'servertable', label: 'Servers', icon: Server, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', desc: 'Server inventory' },
  { type: 'cardgrid', label: 'Cards', icon: LayoutGrid, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', desc: 'Colored cards' },
  { type: 'infocards', label: 'Info Cards', icon: FolderOpen, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', desc: 'Directory/Info style' },
  { type: 'portref', label: 'Ports', icon: Network, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', desc: 'Port reference' },
  { type: 'flowcards', label: 'Flow', icon: ArrowRight, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', desc: 'Traffic flow' },
  { type: 'twocolumn', label: '2-Col', icon: Columns, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', desc: 'Two columns' },
  { type: 'checklist', label: 'Checklist', icon: ListChecks, color: 'bg-lime-500/20 text-lime-400 border-lime-500/30', desc: 'Task list' },
];

const suggestedTags = ['Primary', 'Replica', 'Standby', 'Leader', 'etcd', 'Production', 'Staging', 'DevOps', 'DBA', 'Manual', 'Critical', 'All', 'Each Node'];
const generateId = () => Math.random().toString(36).substr(2, 9);

// Tag Input Component
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

// Server Table Editor
function ServerTableEditor({ servers, onChange }: { servers: ServerRow[]; onChange: (s: ServerRow[]) => void }) {
  const updateServer = (index: number, field: keyof ServerRow, value: string) => {
    const updated = [...servers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  const addServer = () => onChange([...servers, { hostname: '', role: 'Primary', roleColor: 'green', ip: '', region: '', components: '' }]);
  const removeServer = (index: number) => servers.length > 1 && onChange(servers.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {servers.map((server, i) => (
        <div key={i} className="grid grid-cols-6 gap-2 p-2 bg-slate-800/50 rounded-lg">
          <input type="text" value={server.hostname} onChange={e => updateServer(i, 'hostname', e.target.value)} placeholder="hostname" className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-teal-400 font-mono focus:outline-none" />
          <div className="flex gap-1">
            <input type="text" value={server.role} onChange={e => updateServer(i, 'role', e.target.value)} placeholder="Role" className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none" />
            <ColorPicker value={server.roleColor} onChange={v => updateServer(i, 'roleColor', v)} />
          </div>
          <input type="text" value={server.ip} onChange={e => updateServer(i, 'ip', e.target.value)} placeholder="IP" className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none" />
          <input type="text" value={server.region} onChange={e => updateServer(i, 'region', e.target.value)} placeholder="Region" className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none" />
          <input type="text" value={server.components} onChange={e => updateServer(i, 'components', e.target.value)} placeholder="Components" className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400 focus:outline-none" />
          <button onClick={() => removeServer(i)} className="text-slate-500 hover:text-red-400 justify-self-center"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={addServer} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Server</button>
    </div>
  );
}

// Port Reference Editor
function PortRefEditor({ ports, onChange }: { ports: PortItem[]; onChange: (p: PortItem[]) => void }) {
  const updatePort = (index: number, field: keyof PortItem, value: string) => {
    const updated = [...ports];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  const addPort = () => onChange([...ports, { name: '', port: '', color: 'teal' }]);
  const removePort = (index: number) => ports.length > 1 && onChange(ports.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {ports.map((port, i) => (
          <div key={i} className="flex items-center gap-1 p-2 bg-slate-800/50 rounded-lg">
            <input type="text" value={port.name} onChange={e => updatePort(i, 'name', e.target.value)} placeholder="Service" className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none" />
            <input type="text" value={port.port} onChange={e => updatePort(i, 'port', e.target.value)} placeholder="Port" className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none" />
            <ColorPicker value={port.color} onChange={v => updatePort(i, 'color', v)} />
            <button onClick={() => removePort(i)} className="text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      <button onClick={addPort} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Port</button>
    </div>
  );
}

// Info Cards Editor (Directory Structure style)
function InfoCardsEditor({ cards, onChange }: { cards: Card[]; onChange: (c: Card[]) => void }) {
  const updateCard = (index: number, field: keyof Card, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  const addCard = () => onChange([...cards, { title: '', content: '', color: 'teal' }]);
  const removeCard = (index: number) => cards.length > 1 && onChange(cards.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => (
          <div key={i} className="p-2 bg-slate-800/50 rounded-lg space-y-1">
            <div className="flex items-center gap-1">
              <ColorPicker value={card.color || 'teal'} onChange={v => updateCard(i, 'color', v)} />
              <input type="text" value={card.title} onChange={e => updateCard(i, 'title', e.target.value)} placeholder="Title" className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-bold focus:outline-none" style={{ color: getColorClasses(card.color || 'teal').hex }} />
              <button onClick={() => removeCard(i)} className="text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
            <input type="text" value={card.content} onChange={e => updateCard(i, 'content', e.target.value)} placeholder="Content/Path" className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400 font-mono focus:outline-none" />
          </div>
        ))}
      </div>
      <button onClick={addCard} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Card</button>
    </div>
  );
}

// Flow Cards Editor
function FlowCardsEditor({ flows, onChange }: { flows: FlowItem[]; onChange: (f: FlowItem[]) => void }) {
  const updateFlow = (index: number, field: keyof FlowItem, value: string) => {
    const updated = [...flows];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  const addFlow = () => onChange([...flows, { flow: '', color: 'teal' }]);
  const removeFlow = (index: number) => flows.length > 1 && onChange(flows.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {flows.map((flow, i) => (
          <div key={i} className="flex items-center gap-1 p-2 bg-slate-800/50 rounded-lg">
            <ColorPicker value={flow.color} onChange={v => updateFlow(i, 'color', v)} />
            <input type="text" value={flow.flow} onChange={e => updateFlow(i, 'flow', e.target.value)} placeholder="App → Service :port → Target" className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none" style={{ color: getColorClasses(flow.color).hex }} />
            <button onClick={() => removeFlow(i)} className="text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      <button onClick={addFlow} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Flow</button>
    </div>
  );
}

// Card Grid Editor with Colors
function CardGridEditor({ cards, onChange }: { cards: Card[]; onChange: (c: Card[]) => void }) {
  const updateCard = (index: number, field: keyof Card, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  const addCard = () => onChange([...cards, { title: '', content: '', color: 'teal' }]);
  const removeCard = (index: number) => cards.length > 1 && onChange(cards.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => (
          <div key={i} className="p-2 bg-slate-800 border border-slate-700 rounded">
            <div className="flex items-center gap-1 mb-1">
              <ColorPicker value={card.color || 'teal'} onChange={v => updateCard(i, 'color', v)} />
              <input type="text" value={card.title} onChange={e => updateCard(i, 'title', e.target.value)} className="flex-1 bg-transparent text-xs font-medium focus:outline-none" style={{ color: getColorClasses(card.color || 'teal').hex }} placeholder="Title" />
              <button onClick={() => removeCard(i)} className="text-slate-500 hover:text-red-400"><Trash2 size={10} /></button>
            </div>
            <input type="text" value={card.content} onChange={e => updateCard(i, 'content', e.target.value)} className="w-full bg-transparent text-xs text-slate-400 focus:outline-none" placeholder="Content" />
          </div>
        ))}
      </div>
      <button onClick={addCard} className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">+ Add Card</button>
    </div>
  );
}

// Table Editor
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

// Checklist Editor
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

// Block Editor Component
function BlockEditor({ section, block, updateBlock }: { section: Section; block: Block; updateBlock: (sid: string, bid: string, u: Partial<Block>) => void }) {
  const handleContentChange = useCallback((content: string) => {
    updateBlock(section.id, block.id, { content });
  }, [section.id, block.id, updateBlock]);

  switch (block.type) {
    case 'servertable':
      return <ServerTableEditor servers={block.servers || []} onChange={s => updateBlock(section.id, block.id, { servers: s })} />;
    case 'portref':
      return <PortRefEditor ports={block.ports || []} onChange={p => updateBlock(section.id, block.id, { ports: p })} />;
    case 'infocards':
      return <InfoCardsEditor cards={block.infocards || []} onChange={c => updateBlock(section.id, block.id, { infocards: c })} />;
    case 'flowcards':
      return <FlowCardsEditor flows={block.flows || []} onChange={f => updateBlock(section.id, block.id, { flows: f })} />;
    case 'cardgrid':
      return <CardGridEditor cards={block.cards || []} onChange={c => updateBlock(section.id, block.id, { cards: c })} />;
    case 'table':
      return <TableEditor data={block.tableData || { headers: ['Col'], rows: [['']] }} onChange={d => updateBlock(section.id, block.id, { tableData: d })} />;
    case 'checklist':
      return <ChecklistEditor items={block.checklist || []} onChange={i => updateBlock(section.id, block.id, { checklist: i })} />;
    case 'twocolumn':
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ColorPicker value={block.leftColor || 'emerald'} onChange={v => updateBlock(section.id, block.id, { leftColor: v })} />
                <input type="text" value={block.leftTitle || ''} onChange={e => updateBlock(section.id, block.id, { leftTitle: e.target.value })} className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm font-medium focus:outline-none" style={{ color: getColorClasses(block.leftColor || 'emerald').hex }} placeholder="Left title" />
              </div>
              <RichTextEditor content={block.leftContent || ''} onChange={c => updateBlock(section.id, block.id, { leftContent: c })} placeholder="Left content..." minHeight="80px" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ColorPicker value={block.rightColor || 'amber'} onChange={v => updateBlock(section.id, block.id, { rightColor: v })} />
                <input type="text" value={block.rightTitle || ''} onChange={e => updateBlock(section.id, block.id, { rightTitle: e.target.value })} className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm font-medium focus:outline-none" style={{ color: getColorClasses(block.rightColor || 'amber').hex }} placeholder="Right title" />
              </div>
              <RichTextEditor content={block.rightContent || ''} onChange={c => updateBlock(section.id, block.id, { rightContent: c })} placeholder="Right content..." minHeight="80px" />
            </div>
          </div>
        </div>
      );
    case 'header':
      return (
        <div className="space-y-2">
          <input type="text" value={block.title || ''} onChange={e => updateBlock(section.id, block.id, { title: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-lg text-teal-400 font-semibold focus:outline-none" placeholder="Header title" />
          <RichTextEditor content={block.content} onChange={handleContentChange} placeholder="Subtitle..." minHeight="60px" />
        </div>
      );
    case 'step':
      return (
        <div className="space-y-2">
          <input type="text" value={block.title || ''} onChange={e => updateBlock(section.id, block.id, { title: e.target.value })} className="w-full bg-transparent text-white font-medium focus:outline-none" placeholder="Step title..." />
          <TagsInput tags={block.tags || []} onChange={t => updateBlock(section.id, block.id, { tags: t })} />
          <RichTextEditor content={block.content} onChange={handleContentChange} placeholder="Step instructions..." minHeight="80px" />
        </div>
      );
    case 'code':
      return (
        <div className="space-y-2">
          <select value={block.language || 'bash'} onChange={e => updateBlock(section.id, block.id, { language: e.target.value })} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 focus:outline-none">
            <option value="bash">bash</option><option value="sql">sql</option><option value="yaml">yaml</option><option value="json">json</option><option value="python">python</option>
          </select>
          <TagsInput tags={block.tags || []} onChange={t => updateBlock(section.id, block.id, { tags: t })} />
          <textarea value={block.content} onChange={e => updateBlock(section.id, block.id, { content: e.target.value })} rows={4} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-sm focus:outline-none resize-none" placeholder="Code..." />
        </div>
      );
    case 'warning':
      return (
        <div className="space-y-2">
          <TagsInput tags={block.tags || []} onChange={t => updateBlock(section.id, block.id, { tags: t })} />
          <RichTextEditor content={block.content} onChange={handleContentChange} placeholder="Warning message..." minHeight="60px" />
        </div>
      );
    default:
      return <RichTextEditor content={block.content} onChange={handleContentChange} placeholder="Enter content..." minHeight="60px" />;
  }
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
  const updateSection = (id: string, u: Partial<Section>) => setSections(sections.map(s => s.id === id ? { ...s, ...u } : s));
  const deleteSection = (id: string) => sections.length > 1 && setSections(sections.filter(s => s.id !== id));

  const addBlock = (sid: string, type: BlockType) => {
    const b: Block = {
      id: generateId(), type, content: '',
      title: ['step', 'header'].includes(type) ? '' : undefined,
      language: type === 'code' ? 'bash' : undefined,
      tags: ['step', 'code', 'warning'].includes(type) ? [] : undefined,
      tableData: type === 'table' ? { headers: ['Column 1', 'Column 2'], rows: [['', '']] } : undefined,
      cards: type === 'cardgrid' ? [{ title: '', content: '', color: 'teal' }] : undefined,
      infocards: type === 'infocards' ? [{ title: 'DATA', content: '/opt/pgsql/data', color: 'red' }, { title: 'LOG', content: '/opt/pgsql/log', color: 'orange' }, { title: 'WAL', content: '/opt/pgsql/wal', color: 'green' }] : undefined,
      servers: type === 'servertable' ? [{ hostname: 'server-01', role: 'Primary', roleColor: 'green', ip: '10.0.1.10', region: 'us-east-1', components: 'PostgreSQL, Patroni' }] : undefined,
      ports: type === 'portref' ? [{ name: 'PostgreSQL', port: '5432', color: 'teal' }, { name: 'Patroni API', port: '8008', color: 'amber' }] : undefined,
      flows: type === 'flowcards' ? [{ flow: 'App → HAProxy :5000 → Primary :5432', color: 'teal' }] : undefined,
      leftTitle: type === 'twocolumn' ? '' : undefined, rightTitle: type === 'twocolumn' ? '' : undefined,
      leftContent: type === 'twocolumn' ? '' : undefined, rightContent: type === 'twocolumn' ? '' : undefined,
      leftColor: type === 'twocolumn' ? 'emerald' : undefined, rightColor: type === 'twocolumn' ? 'amber' : undefined,
      checklist: type === 'checklist' ? [{ id: generateId(), text: '', checked: false }] : undefined,
    };
    setSections(sections.map(s => s.id === sid ? { ...s, blocks: [...s.blocks, b] } : s));
  };

  const updateBlock = useCallback((sid: string, bid: string, u: Partial<Block>) => {
    setSections(prev => prev.map(s => s.id === sid ? { ...s, blocks: s.blocks.map(b => b.id === bid ? { ...b, ...u } : b) } : s));
  }, []);

  const deleteBlock = (sid: string, bid: string) => setSections(sections.map(s => s.id === sid ? { ...s, blocks: s.blocks.filter(b => b.id !== bid) } : s));

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a title'); return; }
    setIsSaving(true); setError(null);
    try {
      const res = await fetch(`/api/runbooks/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), description: description.trim(), sections }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/dashboard/runbooks/${params.id}`);
    } catch (e: any) { setError(e.message); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 size={32} className="text-teal-500 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/runbooks/${params.id}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-white">Edit Runbook</h1>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 text-sm">
          {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save</>}
        </button>
      </motion.div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex justify-between"><span>{error}</span><button onClick={() => setError(null)}><X size={16} /></button></div>}

      <div className="space-y-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Runbook title *" className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg font-medium focus:outline-none focus:border-teal-500" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500 resize-none" />
        </div>

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
                              <BlockEditor section={section} block={block} updateBlock={updateBlock} />
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

'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  List, 
  ListOrdered, 
  Code,
  Link as LinkIcon,
  Highlighter,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Palette
} from 'lucide-react'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false,
  children,
  title
}: { 
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      isActive 
        ? 'bg-teal-500/20 text-teal-400' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-5 bg-slate-700 mx-1" />

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-700 bg-slate-800/50">
      {/* Text Style */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code size={14} />
      </MenuButton>

      <Divider />

      {/* Headings */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </MenuButton>

      <Divider />

      {/* Lists */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={14} />
      </MenuButton>

      <Divider />

      {/* Link */}
      <MenuButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Add Link"
      >
        <LinkIcon size={14} />
      </MenuButton>

      {/* Color Picker */}
      <div className="relative group">
        <MenuButton onClick={() => {}} title="Text Color">
          <Palette size={14} />
        </MenuButton>
        <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex gap-1">
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="w-5 h-5 rounded border border-slate-600 bg-white"
            title="Default"
          />
          {colors.map(color => (
            <button
              key={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-5 h-5 rounded border border-slate-600"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Undo/Redo */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={14} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo size={14} />
      </MenuButton>
    </div>
  )
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Start typing...',
  className = '',
  minHeight = '100px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-teal-400 underline cursor-pointer hover:text-teal-300',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-500/30 rounded px-0.5',
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm max-w-none focus:outline-none px-3 py-2 ${className}`,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #64748b;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #14b8a6;
          margin: 0.5rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #5eead4;
          margin: 0.5rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #99f6e4;
          margin: 0.5rem 0;
        }
        .ProseMirror p {
          color: #e2e8f0;
          margin: 0.25rem 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          color: #e2e8f0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          color: #e2e8f0;
        }
        .ProseMirror li {
          margin: 0.125rem 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #14b8a6;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #94a3b8;
          font-style: italic;
        }
        .ProseMirror code {
          background: #1e293b;
          color: #f472b6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .ProseMirror hr {
          border-color: #334155;
          margin: 0.75rem 0;
        }
        .ProseMirror strong {
          color: #f8fafc;
          font-weight: 600;
        }
        .ProseMirror em {
          color: #e2e8f0;
        }
        .ProseMirror s {
          color: #64748b;
        }
      `}</style>
    </div>
  )
}

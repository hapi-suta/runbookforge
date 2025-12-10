'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Code,
  Link as LinkIcon,
  Highlighter,
} from 'lucide-react'
import { useCallback, useEffect } from 'react'

interface RichTextEditorCompactProps {
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
    className={`p-1 rounded transition-colors ${
      isActive 
        ? 'bg-purple-500/20 text-purple-400' 
        : 'text-slate-500 hover:text-white hover:bg-slate-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
)

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

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-slate-700/50 bg-slate-800/30">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold size={12} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic size={12} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon size={12} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter size={12} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Code"
      >
        <Code size={12} />
      </MenuButton>
      <div className="w-px h-4 bg-slate-700 mx-1" />
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={12} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered size={12} />
      </MenuButton>
      <div className="w-px h-4 bg-slate-700 mx-1" />
      <MenuButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Add Link"
      >
        <LinkIcon size={12} />
      </MenuButton>
    </div>
  )
}

export default function RichTextEditorCompact({ 
  content, 
  onChange, 
  placeholder = 'Add description...',
  className = '',
  minHeight = '60px'
}: RichTextEditorCompactProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 underline cursor-pointer hover:text-purple-300',
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
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm max-w-none focus:outline-none px-3 py-2 text-sm ${className}`,
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
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
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
          font-size: 0.875rem;
        }
        .ProseMirror p {
          color: #e2e8f0;
          margin: 0.125rem 0;
          font-size: 0.875rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          color: #e2e8f0;
          font-size: 0.875rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          color: #e2e8f0;
          font-size: 0.875rem;
        }
        .ProseMirror li {
          margin: 0.1rem 0;
        }
        .ProseMirror code {
          background: #1e293b;
          color: #f472b6;
          padding: 0.1rem 0.2rem;
          border-radius: 0.2rem;
          font-family: monospace;
          font-size: 0.8rem;
        }
        .ProseMirror strong {
          color: #f8fafc;
          font-weight: 600;
        }
        .ProseMirror em {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  )
}


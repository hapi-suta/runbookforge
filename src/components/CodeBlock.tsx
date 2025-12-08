'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import Prism from 'prismjs'

// Import languages
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-markdown'

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  zsh: 'Zsh',
  sql: 'SQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  python: 'Python',
  py: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  docker: 'Dockerfile',
  dockerfile: 'Dockerfile',
  nginx: 'Nginx',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  java: 'Java',
  csharp: 'C#',
  cs: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  markdown: 'Markdown',
  md: 'Markdown',
  text: 'Plain Text',
  plaintext: 'Plain Text',
}

// Map aliases to Prism language keys
const LANGUAGE_MAP: Record<string, string> = {
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  postgresql: 'sql',
  mysql: 'sql',
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  yml: 'yaml',
  dockerfile: 'docker',
  golang: 'go',
  cs: 'csharp',
  rb: 'ruby',
  md: 'markdown',
  html: 'markup',
  xml: 'markup',
}

// Language colors for the badge
const LANGUAGE_COLORS: Record<string, { bg: string; text: string }> = {
  bash: { bg: 'bg-green-500/20', text: 'text-green-400' },
  sql: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  python: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  javascript: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  typescript: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  json: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  yaml: { bg: 'bg-red-500/20', text: 'text-red-400' },
  docker: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  nginx: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  go: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  rust: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  java: { bg: 'bg-red-500/20', text: 'text-red-400' },
  csharp: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  php: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  ruby: { bg: 'bg-red-500/20', text: 'text-red-400' },
  css: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  markup: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  markdown: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
}

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
}

export default function CodeBlock({ 
  code, 
  language = 'bash', 
  title,
  showLineNumbers = false,
  className = ''
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState<string>('')

  // Normalize language
  const normalizedLang = language.toLowerCase()
  const prismLang = LANGUAGE_MAP[normalizedLang] || normalizedLang
  const displayName = LANGUAGE_NAMES[normalizedLang] || language.toUpperCase()
  const colors = LANGUAGE_COLORS[prismLang] || { bg: 'bg-slate-500/20', text: 'text-slate-400' }

  useEffect(() => {
    // Highlight using Prism
    const grammar = Prism.languages[prismLang]
    if (grammar) {
      const html = Prism.highlight(code, grammar, prismLang)
      setHighlighted(html)
    } else {
      setHighlighted(escapeHtml(code))
    }
  }, [code, prismLang])

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  // Inline styles for syntax highlighting
  const tokenStyles = `
    .prism-code .token.comment,
    .prism-code .token.prolog,
    .prism-code .token.doctype,
    .prism-code .token.cdata { color: #6b7280; font-style: italic; }
    .prism-code .token.punctuation { color: #94a3b8; }
    .prism-code .token.namespace { opacity: 0.7; }
    .prism-code .token.property,
    .prism-code .token.tag,
    .prism-code .token.boolean,
    .prism-code .token.number,
    .prism-code .token.constant,
    .prism-code .token.symbol,
    .prism-code .token.deleted { color: #f472b6; }
    .prism-code .token.selector,
    .prism-code .token.attr-name,
    .prism-code .token.string,
    .prism-code .token.char,
    .prism-code .token.builtin,
    .prism-code .token.inserted { color: #34d399; }
    .prism-code .token.operator,
    .prism-code .token.entity,
    .prism-code .token.url { color: #fbbf24; }
    .prism-code .token.atrule,
    .prism-code .token.attr-value,
    .prism-code .token.keyword { color: #60a5fa; }
    .prism-code .token.function,
    .prism-code .token.class-name { color: #c084fc; }
    .prism-code .token.regex,
    .prism-code .token.important,
    .prism-code .token.variable { color: #fb923c; }
    .prism-code .token.important,
    .prism-code .token.bold { font-weight: bold; }
    .prism-code .token.italic { font-style: italic; }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tokenStyles }} />
      <div className={`rounded-xl overflow-hidden border border-slate-700 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {/* Terminal dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            
            {/* Title or language */}
            {title ? (
              <span className="text-sm text-slate-300 font-medium">{title}</span>
            ) : (
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                {displayName}
              </span>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Code */}
        <div className="relative bg-[#1a1f2e] overflow-x-auto">
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900/50 border-r border-slate-700/50 flex flex-col items-end pt-4 pr-3 select-none">
              {lines.map((_, i) => (
                <span key={i} className="text-xs text-slate-600 leading-6">{i + 1}</span>
              ))}
            </div>
          )}
          <pre className={`p-4 overflow-x-auto ${showLineNumbers ? 'pl-16' : ''}`}>
            <code 
              ref={codeRef}
              className="prism-code text-sm leading-6 text-slate-300 font-mono"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace" }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      </div>
    </>
  )
}

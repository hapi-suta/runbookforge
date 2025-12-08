'use client'

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Tag,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Play,
  Download,
  FileJson,
  FileType,
  ChevronDown,
  ShoppingBag,
  DollarSign,
  X,
  Menu,
  Share2,
  Mail,
  UserPlus
} from "lucide-react";
import { getColorClasses } from "@/components/ColorPicker";

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
  type: string;
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
}

interface Runbook {
  id: string;
  title: string;
  description: string | null;
  sections: Section[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Syntax highlighting for code blocks
function highlightCode(code: string, language: string = 'bash'): React.ReactNode[] {
  if (!code) return [];
  
  const lines = code.split('\n');
  const lang = language.toLowerCase();
  
  return lines.map((line, lineIndex) => {
    let highlightedLine: React.ReactNode[];
    
    if (['bash', 'shell', 'sh', 'zsh', 'powershell', 'ps1'].includes(lang)) {
      highlightedLine = highlightBashLine(line);
    } else if (['sql', 'psql', 'mysql', 'plsql', 'pgsql'].includes(lang)) {
      highlightedLine = highlightSQLLine(line);
    } else if (['yaml', 'yml', 'ansible'].includes(lang)) {
      highlightedLine = highlightYAMLLine(line);
    } else if (['json', 'jsonc'].includes(lang)) {
      highlightedLine = highlightJSONLine(line);
    } else if (['python', 'py', 'python3'].includes(lang)) {
      highlightedLine = highlightPythonLine(line);
    } else if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(lang)) {
      highlightedLine = highlightJSLine(line);
    } else if (['go', 'golang'].includes(lang)) {
      highlightedLine = highlightGoLine(line);
    } else if (['rust', 'rs'].includes(lang)) {
      highlightedLine = highlightRustLine(line);
    } else if (['java', 'kotlin', 'scala', 'c', 'cpp', 'c++', 'csharp', 'cs'].includes(lang)) {
      highlightedLine = highlightCLikeLine(line);
    } else if (['dockerfile', 'docker'].includes(lang)) {
      highlightedLine = highlightDockerfileLine(line);
    } else if (['terraform', 'tf', 'hcl'].includes(lang)) {
      highlightedLine = highlightTerraformLine(line);
    } else if (['toml', 'ini', 'conf', 'cfg'].includes(lang)) {
      highlightedLine = highlightTOMLLine(line);
    } else if (['xml', 'html', 'svg'].includes(lang)) {
      highlightedLine = highlightXMLLine(line);
    } else {
      // Default generic highlighting
      highlightedLine = highlightGenericLine(line);
    }
    
    return (
      <div key={lineIndex}>
        {highlightedLine}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </div>
    );
  });
}

function highlightBashLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let key = 0;
  
  // Check for comment
  if (line.trim().startsWith('#')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  // Common shell commands
  const commands = new Set([
    'sudo', 'apt', 'apt-get', 'yum', 'dnf', 'brew', 'npm', 'pip', 'pip3', 'git', 'docker', 'docker-compose',
    'kubectl', 'systemctl', 'service', 'curl', 'wget', 'cat', 'echo', 'printf', 'grep', 'egrep', 'fgrep',
    'sed', 'awk', 'find', 'ls', 'll', 'cd', 'mv', 'cp', 'rm', 'mkdir', 'rmdir', 'chmod', 'chown', 'chgrp',
    'tar', 'gzip', 'gunzip', 'zip', 'unzip', 'ssh', 'scp', 'rsync', 'sftp',
    'psql', 'pg_dump', 'pg_restore', 'pg_basebackup', 'pg_ctl', 'postgres', 'pgbackrest', 'pg_isready',
    'patronictl', 'patroni', 'etcdctl', 'etcd', 'haproxy', 'nginx', 'apache2', 'httpd',
    'vim', 'vi', 'nano', 'emacs', 'less', 'more', 'head', 'tail', 'cat', 'tac',
    'sort', 'uniq', 'wc', 'xargs', 'tee', 'touch', 'ln', 'readlink', 'realpath',
    'df', 'du', 'free', 'top', 'htop', 'ps', 'pgrep', 'kill', 'pkill', 'killall',
    'nohup', 'screen', 'tmux', 'bg', 'fg', 'jobs', 'disown',
    'crontab', 'at', 'batch', 'journalctl', 'dmesg', 'logger',
    'mount', 'umount', 'fdisk', 'parted', 'mkfs', 'fsck', 'lsblk', 'blkid',
    'useradd', 'userdel', 'usermod', 'passwd', 'groupadd', 'groupdel', 'groups', 'id', 'whoami', 'su',
    'chroot', 'export', 'source', 'alias', 'unalias', 'unset', 'set', 'env', 'printenv',
    'which', 'whereis', 'type', 'file', 'stat', 'man', 'info', 'help', 'apropos',
    'exit', 'logout', 'reboot', 'shutdown', 'poweroff', 'halt', 'init',
    'make', 'cmake', 'gcc', 'g++', 'clang', 'ld', 'ar', 'nm',
    'python', 'python3', 'node', 'npm', 'npx', 'yarn', 'java', 'javac', 'go', 'ruby', 'perl', 'php',
    'bash', 'sh', 'zsh', 'dash', 'fish', 'csh', 'tcsh',
    'test', 'true', 'false', 'yes', 'no', 'sleep', 'wait', 'time', 'date', 'cal',
    'hostname', 'hostnamectl', 'uname', 'arch', 'nproc', 'lscpu', 'lsmem',
    'ip', 'ifconfig', 'netstat', 'ss', 'ping', 'traceroute', 'dig', 'nslookup', 'host', 'nmap',
    'iptables', 'firewall-cmd', 'ufw', 'fail2ban-client',
    'aws', 'gcloud', 'az', 'terraform', 'ansible', 'ansible-playbook', 'vagrant',
    'openssl', 'gpg', 'base64', 'md5sum', 'sha256sum', 'sha1sum',
    'jq', 'yq', 'xmllint', 'csvtool',
    'cut', 'paste', 'join', 'comm', 'diff', 'patch', 'cmp',
    'tr', 'rev', 'fold', 'fmt', 'column', 'expand', 'unexpand',
  ]);
  
  // Shell keywords
  const keywords = new Set([
    'if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done',
    'in', 'function', 'select', 'time', 'coproc', 'break', 'continue', 'return',
  ]);
  
  // Split line into tokens while preserving whitespace
  const tokenRegex = /(\s+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\$\{[^}]+\}|\$[A-Za-z_][A-Za-z0-9_]*|\$\(|\$\?|\$\$|\$!|\$@|\$\*|\$#|\$\d)|(\|\||&&|;;|<<|>>|[|><;&])|(-{1,2}[A-Za-z][A-Za-z0-9_-]*)|([A-Za-z_][A-Za-z0-9_.-]*)|(\d+)|(.)/g;
  
  let match;
  let isFirstWord = true;
  let afterPipe = false;
  
  while ((match = tokenRegex.exec(line)) !== null) {
    const token = match[0];
    
    // Whitespace
    if (match[1]) {
      tokens.push(<span key={key++} className="text-white">{token}</span>);
      continue;
    }
    
    // String (double or single quoted)
    if (match[2]) {
      tokens.push(<span key={key++} className="text-amber-300">{token}</span>);
      isFirstWord = false;
      continue;
    }
    
    // Variable
    if (match[3]) {
      tokens.push(<span key={key++} className="text-violet-400">{token}</span>);
      isFirstWord = false;
      continue;
    }
    
    // Operators (pipe, redirect, etc.)
    if (match[4]) {
      tokens.push(<span key={key++} className="text-pink-400 font-semibold">{token}</span>);
      if (token === '|' || token === '||' || token === '&&' || token === ';') {
        afterPipe = true;
      }
      continue;
    }
    
    // Flags (--flag or -f)
    if (match[5]) {
      tokens.push(<span key={key++} className="text-cyan-400">{token}</span>);
      isFirstWord = false;
      continue;
    }
    
    // Word (potential command or keyword)
    if (match[6]) {
      if ((isFirstWord || afterPipe) && commands.has(token)) {
        tokens.push(<span key={key++} className="text-blue-400 font-semibold">{token}</span>);
      } else if (keywords.has(token)) {
        tokens.push(<span key={key++} className="text-pink-400 font-semibold">{token}</span>);
      } else if (token.includes('/') || token.includes('.')) {
        // Path or filename
        tokens.push(<span key={key++} className="text-emerald-300">{token}</span>);
      } else {
        tokens.push(<span key={key++} className="text-slate-200">{token}</span>);
      }
      isFirstWord = false;
      afterPipe = false;
      continue;
    }
    
    // Number
    if (match[7]) {
      tokens.push(<span key={key++} className="text-orange-400">{token}</span>);
      isFirstWord = false;
      continue;
    }
    
    // Any other character
    tokens.push(<span key={key++} className="text-slate-300">{token}</span>);
    isFirstWord = false;
  }
  
  return tokens;
}

function highlightSQLLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  // Check for comment
  if (remaining.trim().startsWith('--')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const patterns: { regex: RegExp; className: string }[] = [
    // Strings
    { regex: /'(?:[^'\\]|\\.)*'/, className: 'text-amber-300' },
    // Keywords
    { regex: /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|DATABASE|SCHEMA|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|NOT|NULL|DEFAULT|UNIQUE|CHECK|AND|OR|IN|BETWEEN|LIKE|IS|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|IF|EXISTS|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK|TRANSACTION|CASCADE|RESTRICT|WITH|RECURSIVE|RETURNING|TRIGGER|FUNCTION|PROCEDURE|EXECUTE|CALL)\b/i, className: 'text-blue-400 font-semibold' },
    // Functions
    { regex: /\b(now|current_timestamp|current_date|coalesce|nullif|cast|to_char|to_date|to_timestamp|extract|date_trunc|pg_sleep|generate_series|array_agg|string_agg|row_number|rank|dense_rank|lag|lead|first_value|last_value)\b/i, className: 'text-violet-400' },
    // Numbers
    { regex: /\b\d+\.?\d*\b/, className: 'text-orange-400' },
    // Operators
    { regex: /[=<>!]+|::|->|->>/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-emerald-400">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      tokens.push(<span key={key++} className="text-emerald-400">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  
  return tokens;
}

function highlightYAMLLine(line: string): React.ReactNode[] {
  // Check for comment
  if (line.trim().startsWith('#')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  // Key: value pattern
  const keyValueMatch = line.match(/^(\s*)([^:]+)(:)(.*)$/);
  if (keyValueMatch) {
    const [, indent, key, colon, value] = keyValueMatch;
    const tokens: React.ReactNode[] = [];
    tokens.push(<span key={0} className="text-white">{indent}</span>);
    tokens.push(<span key={1} className="text-cyan-400">{key}</span>);
    tokens.push(<span key={2} className="text-white">{colon}</span>);
    
    // Highlight value
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('"') || trimmedValue.startsWith("'")) {
      tokens.push(<span key={3} className="text-amber-300">{value}</span>);
    } else if (/^(true|false|yes|no|null|~)$/i.test(trimmedValue)) {
      tokens.push(<span key={3} className="text-orange-400">{value}</span>);
    } else if (/^\d+\.?\d*$/.test(trimmedValue)) {
      tokens.push(<span key={3} className="text-orange-400">{value}</span>);
    } else {
      tokens.push(<span key={3} className="text-emerald-400">{value}</span>);
    }
    return tokens;
  }
  
  return [<span key={0} className="text-emerald-400">{line}</span>];
}

function highlightJSONLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  const patterns: { regex: RegExp; className: string }[] = [
    // Strings (keys and values)
    { regex: /"(?:[^"\\]|\\.)*"/, className: 'text-amber-300' },
    // Numbers
    { regex: /-?\d+\.?\d*([eE][+-]?\d+)?/, className: 'text-orange-400' },
    // Booleans and null
    { regex: /\b(true|false|null)\b/, className: 'text-violet-400' },
    // Brackets and braces
    { regex: /[{}\[\]]/, className: 'text-white' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-400">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-400">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  
  return tokens;
}

function highlightPythonLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  // Check for comment
  if (remaining.trim().startsWith('#')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const patterns: { regex: RegExp; className: string }[] = [
    // Triple-quoted strings
    { regex: /"""[\s\S]*?"""|'''[\s\S]*?'''/, className: 'text-amber-300' },
    // Strings
    { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, className: 'text-amber-300' },
    // Keywords
    { regex: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|True|False|None)\b/, className: 'text-blue-400 font-semibold' },
    // Built-in functions
    { regex: /\b(print|len|range|str|int|float|list|dict|set|tuple|bool|type|isinstance|hasattr|getattr|setattr|open|input|format|sorted|reversed|enumerate|zip|map|filter|reduce|sum|min|max|abs|round|pow|divmod|hex|oct|bin|chr|ord|repr|eval|exec|compile|globals|locals|vars|dir|help|id|hash|callable|iter|next)\b/, className: 'text-cyan-400' },
    // Decorators
    { regex: /@\w+/, className: 'text-violet-400' },
    // Numbers
    { regex: /\b\d+\.?\d*\b/, className: 'text-orange-400' },
    // Self
    { regex: /\bself\b/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-emerald-400">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      tokens.push(<span key={key++} className="text-emerald-400">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  
  return tokens;
}

// JavaScript/TypeScript highlighter
function highlightJSLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  // Check for comment
  if (remaining.trim().startsWith('//')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|delete|typeof|instanceof|void|this|super|class|extends|import|export|default|from|as|async|await|yield|static|get|set|of|in|null|undefined|true|false)\b/;
  const builtins = /\b(console|document|window|Array|Object|String|Number|Boolean|Date|Math|JSON|Promise|Map|Set|Symbol|RegExp|Error|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|setTimeout|setInterval|fetch|require|module|exports)\b/;
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /`(?:[^`\\]|\\.)*`/, className: 'text-amber-300' }, // Template literals
    { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, className: 'text-amber-300' }, // Strings
    { regex: /\/(?:[^\/\\]|\\.)+\/[gimsuy]*/, className: 'text-pink-400' }, // Regex
    { regex: keywords, className: 'text-blue-400 font-semibold' },
    { regex: builtins, className: 'text-cyan-400' },
    { regex: /\b\d+\.?\d*\b/, className: 'text-orange-400' },
    { regex: /[{}()\[\];,.]/, className: 'text-slate-300' },
    { regex: /=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:]/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

// Go highlighter
function highlightGoLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  if (remaining.trim().startsWith('//')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const keywords = /\b(package|import|func|return|var|const|type|struct|interface|map|chan|go|select|case|default|if|else|for|range|switch|break|continue|goto|fallthrough|defer|nil|true|false|iota)\b/;
  const types = /\b(string|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float32|float64|complex64|complex128|byte|rune|bool|error|any)\b/;
  const builtins = /\b(make|new|len|cap|append|copy|delete|close|panic|recover|print|println|complex|real|imag)\b/;
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /`[^`]*`/, className: 'text-amber-300' }, // Raw strings
    { regex: /"(?:[^"\\]|\\.)*"/, className: 'text-amber-300' },
    { regex: keywords, className: 'text-blue-400 font-semibold' },
    { regex: types, className: 'text-cyan-400' },
    { regex: builtins, className: 'text-violet-400' },
    { regex: /\b\d+\.?\d*\b/, className: 'text-orange-400' },
    { regex: /:=|<-|&&|\|\||[+\-*/%=<>!&|^]/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

// Rust highlighter
function highlightRustLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  if (remaining.trim().startsWith('//')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const keywords = /\b(fn|let|mut|const|static|struct|enum|impl|trait|type|where|pub|mod|use|crate|super|self|Self|if|else|match|loop|while|for|in|break|continue|return|async|await|move|ref|dyn|unsafe|extern|true|false)\b/;
  const types = /\b(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Option|Result|Box|Rc|Arc|Cell|RefCell|HashMap|HashSet|BTreeMap|BTreeSet)\b/;
  const macros = /\b\w+!/;
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /r#*"[^"]*"#*|"(?:[^"\\]|\\.)*"/, className: 'text-amber-300' },
    { regex: keywords, className: 'text-blue-400 font-semibold' },
    { regex: types, className: 'text-cyan-400' },
    { regex: macros, className: 'text-violet-400' },
    { regex: /'[a-z_]\w*/, className: 'text-pink-400' }, // Lifetimes
    { regex: /#\[[\w:(),\s="]*\]/, className: 'text-slate-400' }, // Attributes
    { regex: /\b\d+\.?\d*\b/, className: 'text-orange-400' },
    { regex: /=>|->|::|\.\.|&&|\|\||[+\-*/%=<>!&|^?]/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

// C-like languages (Java, C, C++, C#, Kotlin)
function highlightCLikeLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  if (remaining.trim().startsWith('//')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const keywords = /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|import|package|void|null|true|false|this|super|synchronized|volatile|transient|native|instanceof|enum|const|goto|assert|virtual|override|sealed|readonly|namespace|using|internal|extern|sizeof|typedef|struct|union)\b/;
  const types = /\b(int|long|short|byte|float|double|char|boolean|bool|string|String|var|val|auto|void|Integer|Long|Double|Float|Boolean|Character|Object|List|ArrayList|Map|HashMap|Set|HashSet)\b/;
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, className: 'text-amber-300' },
    { regex: keywords, className: 'text-blue-400 font-semibold' },
    { regex: types, className: 'text-cyan-400' },
    { regex: /@\w+/, className: 'text-violet-400' }, // Annotations
    { regex: /\b\d+\.?\d*[fFdDlL]?\b/, className: 'text-orange-400' },
    { regex: /&&|\|\||[+\-*/%=<>!&|^~?:]/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

// Dockerfile highlighter
function highlightDockerfileLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let key = 0;
  
  if (line.trim().startsWith('#')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const instructions = /^(FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL|MAINTAINER)\b/i;
  const match = line.match(instructions);
  
  if (match) {
    tokens.push(<span key={key++} className="text-blue-400 font-semibold">{match[0]}</span>);
    const rest = line.slice(match[0].length);
    // Highlight the rest with basic bash-like highlighting
    const varMatch = rest.match(/\$\{?[\w]+\}?/g);
    if (varMatch) {
      let remaining = rest;
      for (const v of varMatch) {
        const idx = remaining.indexOf(v);
        if (idx > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, idx)}</span>);
        }
        tokens.push(<span key={key++} className="text-violet-400">{v}</span>);
        remaining = remaining.slice(idx + v.length);
      }
      if (remaining) {
        tokens.push(<span key={key++} className="text-slate-200">{remaining}</span>);
      }
    } else {
      tokens.push(<span key={key++} className="text-slate-200">{rest}</span>);
    }
    return tokens;
  }
  
  return [<span key={0} className="text-slate-200">{line}</span>];
}

// Terraform/HCL highlighter
function highlightTerraformLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  if (remaining.trim().startsWith('#') || remaining.trim().startsWith('//')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const blocks = /\b(resource|data|variable|output|provider|terraform|module|locals|backend|required_providers)\b/;
  const keywords = /\b(for|for_each|if|count|depends_on|lifecycle|provisioner|connection|dynamic|content|each|self|var|local|path|null|true|false)\b/;
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /"(?:[^"\\]|\\.)*"/, className: 'text-amber-300' },
    { regex: blocks, className: 'text-blue-400 font-semibold' },
    { regex: keywords, className: 'text-cyan-400' },
    { regex: /\$\{[^}]+\}/, className: 'text-violet-400' },
    { regex: /\b\d+\.?\d*\b/, className: 'text-orange-400' },
    { regex: /[{}()\[\]=]/, className: 'text-pink-400' },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

// TOML/INI highlighter
function highlightTOMLLine(line: string): React.ReactNode[] {
  if (line.trim().startsWith('#') || line.trim().startsWith(';')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  // Section headers
  if (line.trim().match(/^\[[\w.-]+\]$/)) {
    return [<span key={0} className="text-blue-400 font-semibold">{line}</span>];
  }
  
  // Key = value
  const kvMatch = line.match(/^(\s*)([^=]+)(=)(.*)$/);
  if (kvMatch) {
    const [, indent, key, eq, value] = kvMatch;
    const tokens: React.ReactNode[] = [];
    tokens.push(<span key={0} className="text-white">{indent}</span>);
    tokens.push(<span key={1} className="text-cyan-400">{key}</span>);
    tokens.push(<span key={2} className="text-pink-400">{eq}</span>);
    
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('"') || trimmedValue.startsWith("'")) {
      tokens.push(<span key={3} className="text-amber-300">{value}</span>);
    } else if (/^(true|false)$/i.test(trimmedValue)) {
      tokens.push(<span key={3} className="text-orange-400">{value}</span>);
    } else if (/^\d+\.?\d*$/.test(trimmedValue)) {
      tokens.push(<span key={3} className="text-orange-400">{value}</span>);
    } else {
      tokens.push(<span key={3} className="text-slate-200">{value}</span>);
    }
    return tokens;
  }
  
  return [<span key={0} className="text-slate-200">{line}</span>];
}

// XML/HTML highlighter
function highlightXMLLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  // Comments
  if (remaining.includes('<!--')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /<\/?[\w:-]+/, className: 'text-blue-400' }, // Tags
    { regex: /[\w:-]+(?==)/, className: 'text-cyan-400' }, // Attribute names
    { regex: /"[^"]*"|'[^']*'/, className: 'text-amber-300' }, // Attribute values
    { regex: /[<>=\/]/, className: 'text-slate-400' }, // Brackets
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-slate-200">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-slate-200">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

// Generic highlighter for unknown languages
function highlightGenericLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  
  // Check for common comment patterns
  if (remaining.trim().startsWith('//') || remaining.trim().startsWith('#') || remaining.trim().startsWith('--')) {
    return [<span key={0} className="text-slate-500 italic">{line}</span>];
  }
  
  const patterns: { regex: RegExp; className: string }[] = [
    { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/, className: 'text-amber-300' }, // Strings
    { regex: /\b(true|false|null|nil|none|undefined)\b/i, className: 'text-orange-400' }, // Constants
    { regex: /\b\d+\.?\d*([eE][+-]?\d+)?\b/, className: 'text-orange-400' }, // Numbers
    { regex: /\$[\w{][^}\s]*\}?/, className: 'text-violet-400' }, // Variables
    { regex: /[{}()\[\];,]/, className: 'text-slate-400' }, // Brackets
    { regex: /[+\-*/%=<>!&|^~?:]+/, className: 'text-pink-400' }, // Operators
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          tokens.push(<span key={key++} className="text-emerald-400">{remaining.slice(0, match.index)}</span>);
        }
        tokens.push(<span key={key++} className={className}>{match[0]}</span>);
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(<span key={key++} className="text-emerald-400">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

function CodeBlock({ content, language, tags }: { content: string; language?: string; tags?: string[] }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lang = language?.toLowerCase() || 'bash';

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{language || 'bash'}</span>
        <div className="flex items-center gap-2">
          {tags?.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
              {tag}
            </span>
          ))}
          <button 
            onClick={copyToClipboard}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono whitespace-pre">{highlightCode(content, lang)}</code>
      </pre>
    </div>
  );
}

function StepBlock({ block, stepNumber }: { block: Block; stepNumber: number }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
        {stepNumber}
      </div>
      <div className="flex-1 space-y-3">
        {block.title && <h3 className="text-lg font-semibold text-white">{block.title}</h3>}
        {block.content && (
          <div 
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )}
      </div>
    </div>
  );
}

function BlockRenderer({ block, stepNumber }: { block: Block; stepNumber?: number }) {
  switch (block.type) {
    case 'step':
      return <StepBlock block={block} stepNumber={stepNumber || 1} />;

    case 'code':
      return <CodeBlock content={block.content} language={block.language} tags={block.tags} />;

    case 'warning':
      return (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div 
            className="prose prose-invert prose-sm max-w-none prose-p:text-amber-200"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'info':
      return (
        <div className="flex items-start gap-3 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
          <Info size={20} className="text-sky-400 flex-shrink-0 mt-0.5" />
          <div 
            className="prose prose-invert prose-sm max-w-none prose-p:text-sky-200"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'note':
      return (
        <div className="flex items-start gap-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
          <FileText size={20} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <div 
            className="prose prose-invert prose-sm max-w-none prose-p:text-violet-200"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'header':
      return null; // Headers are rendered as section titles

    case 'table':
      if (!block.tableData) return null;
      return (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                {block.tableData.headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-slate-400 font-medium border-b border-r border-slate-700 last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.tableData.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-white border-r border-slate-800 last:border-r-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'keyvalue':
      if (!block.tableData) return null;
      return (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {block.tableData.headers.map((header, i) => (
                <tr key={i} className="border-b border-slate-800 last:border-b-0">
                  <td className="px-4 py-3 text-slate-400 font-medium bg-slate-800/50 w-1/3 border-r border-slate-700">
                    {header}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {block.tableData!.rows[0]?.[i] || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'cardgrid':
      if (!block.cards) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {block.cards.map((card, i) => {
            const colors = getColorClasses(card.color || 'teal');
            return (
              <div key={i} className={`p-4 ${colors.bg} border ${colors.border} rounded-lg`}>
                <div className={`text-sm font-medium ${colors.text} mb-1`}>{card.title}</div>
                <div className="text-xs text-slate-400">{card.content}</div>
              </div>
            );
          })}
        </div>
      );

    case 'servertable':
      if (!block.servers) return null;
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Hostname</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Role</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Private IP</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Region</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Components</th>
              </tr>
            </thead>
            <tbody>
              {block.servers.map((server, i) => {
                const roleColors = getColorClasses(server.roleColor || 'green');
                return (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="px-4 py-3 text-teal-400 font-mono">{server.hostname}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 ${roleColors.bg} ${roleColors.text} text-xs rounded border ${roleColors.border}`}>
                        {server.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{server.ip}</td>
                    <td className="px-4 py-3 text-slate-400">{server.region}</td>
                    <td className="px-4 py-3 text-slate-500">{server.components}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case 'portref':
      if (!block.ports) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.ports.map((port, i) => {
            const colors = getColorClasses(port.color || 'teal');
            return (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className="text-sm text-slate-300">{port.name}</span>
                <span className={`text-sm font-bold ${colors.text}`}>{port.port}</span>
              </div>
            );
          })}
        </div>
      );

    case 'infocards':
      if (!block.infocards) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {block.infocards.map((card, i) => {
            const colors = getColorClasses(card.color || 'teal');
            return (
              <div key={i} className={`p-4 ${colors.bg} border ${colors.border} rounded-lg`}>
                <div className={`text-sm font-bold ${colors.text} mb-1`}>{card.title}</div>
                <div className={`text-xs ${colors.text} opacity-70 font-mono`}>{card.content}</div>
              </div>
            );
          })}
        </div>
      );

    case 'flowcards':
      if (!block.flows) return null;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {block.flows.map((flow, i) => {
            const colors = getColorClasses(flow.color || 'teal');
            return (
              <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className={`text-sm ${colors.text}`}>{flow.flow}</span>
              </div>
            );
          })}
        </div>
      );

    case 'twocolumn':
      const leftColors = getColorClasses(block.leftColor || 'emerald');
      const rightColors = getColorClasses(block.rightColor || 'amber');
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 bg-slate-800/50 border ${leftColors.border} rounded-lg`}>
            {block.leftTitle && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${leftColors.solid}`}></div>
                <h4 className={`${leftColors.text} font-medium`}>{block.leftTitle}</h4>
              </div>
            )}
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.leftContent || '' }}
            />
          </div>
          <div className={`p-4 bg-slate-800/50 border ${rightColors.border} rounded-lg`}>
            {block.rightTitle && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${rightColors.solid}`}></div>
                <h4 className={`${rightColors.text} font-medium`}>{block.rightTitle}</h4>
              </div>
            )}
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.rightContent || '' }}
            />
          </div>
        </div>
      );

    case 'checklist':
      if (!block.checklist) return null;
      return (
        <div className="space-y-2">
          {block.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.checked ? 'bg-teal-500 border-teal-500' : 'border-slate-600'}`}>
                {item.checked && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div 
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );
  }
}

export default function ViewRunbookPage() {
  const params = useParams();
  const router = useRouter();
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState('25.00');
  const [sellCategory, setSellCategory] = useState('Database');
  const [sellDescription, setSellDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [shares, setShares] = useState<{ id: string; shared_with_email: string; permission: string; created_at: string }[]>([]);
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [shareError, setShareError] = useState('');

  const handleSubmitToMarketplace = async () => {
    if (!runbook || !sellPrice) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runbook_id: runbook.id,
          price_personal: parseFloat(sellPrice),
          category: sellCategory,
          description: sellDescription || runbook.description,
          tags: []
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowSellModal(false);
        alert('Your runbook has been submitted for review! You\'ll be notified when it\'s approved.');
      } else {
        alert(data.error || 'Failed to submit listing');
      }
    } catch (error) {
      console.error('Error submitting to marketplace:', error);
      alert('Failed to submit listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRunbook();
  }, [params.id]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowExportMenu(false);
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  const fetchRunbook = async () => {
    try {
      const response = await fetch(`/api/runbooks/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Runbook not found');
        } else {
          throw new Error('Failed to fetch runbook');
        }
        return;
      }
      const data = await response.json();
      setRunbook(data);
    } catch (err) {
      setError('Failed to load runbook');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!runbook) return;
    setIsExporting(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Create a temporary container with all sections for PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '850px';
      tempContainer.style.backgroundColor = '#0f172a';
      tempContainer.style.padding = '50px';
      tempContainer.style.color = 'white';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      
      // Build HTML content with improved styling
      let htmlContent = `
        <div style="margin-bottom: 40px; border-bottom: 1px solid #334155; padding-bottom: 30px;">
          <h1 style="font-size: 32px; color: #2dd4bf; margin: 0 0 15px 0; font-weight: 700;">${runbook.title}</h1>
          ${runbook.description ? `<p style="color: #94a3b8; font-size: 16px; margin: 0 0 15px 0; line-height: 1.6;">${runbook.description}</p>` : ''}
          <p style="color: #475569; font-size: 12px; margin: 0;">Generated by RunbookForge • ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      
      runbook.sections.forEach((section, sectionIndex) => {
        htmlContent += `
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 24px; color: white; margin: 0 0 25px 0; font-weight: 600;">
              ${sectionIndex + 1}. ${section.title}
            </h2>
        `;
        
        let stepNumber = 0;
        section.blocks.forEach(block => {
          if (block.type === 'step') {
            stepNumber++;
            htmlContent += `
              <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: flex-start;">
                <div style="width: 32px; height: 32px; min-width: 32px; background: linear-gradient(135deg, #14b8a6, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">${stepNumber}</div>
                <div style="flex: 1;">
                  <h3 style="font-size: 18px; color: white; margin: 0 0 8px 0; font-weight: 600;">${block.title || 'Step'}</h3>
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0; line-height: 1.6;">${block.content?.replace(/<[^>]*>/g, '') || ''}</p>
                  ${block.tags && block.tags.length > 0 ? `<div style="margin-top: 8px;">${block.tags.map(tag => `<span style="display: inline-block; background: rgba(20, 184, 166, 0.2); color: #2dd4bf; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 6px;">${tag}</span>`).join('')}</div>` : ''}
                </div>
              </div>
            `;
          } else if (block.type === 'code') {
            htmlContent += `
              <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
                <div style="background: #0f172a; padding: 10px 16px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 12px; font-family: monospace;">${block.language || 'bash'}</span>
                  ${block.tags && block.tags.length > 0 ? `<div>${block.tags.map(tag => `<span style="background: rgba(20, 184, 166, 0.2); color: #2dd4bf; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 6px;">${tag}</span>`).join('')}</div>` : ''}
                </div>
                <pre style="margin: 0; padding: 20px; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 13px; color: #34d399; line-height: 1.6; white-space: pre-wrap; overflow-x: auto;">${block.content?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''}</pre>
              </div>
            `;
          } else if (block.type === 'warning') {
            htmlContent += `
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span style="font-size: 16px;">⚠️</span>
                  <span style="color: #fbbf24; font-weight: 600; font-size: 14px;">Warning</span>
                </div>
                <p style="color: #fcd34d; font-size: 14px; margin: 0; line-height: 1.6;">${block.content?.replace(/<[^>]*>/g, '') || ''}</p>
              </div>
            `;
          } else if (block.type === 'info') {
            htmlContent += `
              <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span style="font-size: 16px;">ℹ️</span>
                  <span style="color: #38bdf8; font-weight: 600; font-size: 14px;">Info</span>
                </div>
                <p style="color: #7dd3fc; font-size: 14px; margin: 0; line-height: 1.6;">${block.content?.replace(/<[^>]*>/g, '') || ''}</p>
              </div>
            `;
          } else if (block.type === 'table' && block.tableData) {
            htmlContent += `
              <div style="border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <thead>
                    <tr style="background: #1e293b;">
                      ${block.tableData.headers.map(h => `<th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155; border-right: 1px solid #334155;">${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${block.tableData.rows.map(row => `
                      <tr style="border-bottom: 1px solid #1e293b;">
                        ${row.map(cell => `<td style="padding: 14px 16px; color: white; border-right: 1px solid #1e293b;">${cell}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          } else if (block.type === 'servertable' && block.servers) {
            const roleColors: Record<string, string> = {
              green: '#22c55e', blue: '#3b82f6', amber: '#f59e0b', orange: '#f97316',
              red: '#ef4444', violet: '#8b5cf6', teal: '#14b8a6', pink: '#ec4899'
            };
            htmlContent += `
              <div style="border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background: #1e293b;">
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Hostname</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Role</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">IP</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Region</th>
                      <th style="padding: 14px 16px; text-align: left; color: #94a3b8; font-weight: 500; border-bottom: 1px solid #334155;">Components</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${block.servers.map(s => `
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 14px 16px; color: #2dd4bf; font-family: monospace;">${s.hostname}</td>
                        <td style="padding: 14px 16px;">
                          <span style="background: ${roleColors[s.roleColor] || '#14b8a6'}22; color: ${roleColors[s.roleColor] || '#14b8a6'}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;">${s.role}</span>
                        </td>
                        <td style="padding: 14px 16px; color: #cbd5e1; font-family: monospace;">${s.ip}</td>
                        <td style="padding: 14px 16px; color: #94a3b8;">${s.region}</td>
                        <td style="padding: 14px 16px; color: #64748b; font-size: 12px;">${s.components}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          } else if (block.type === 'portref' && block.ports) {
            const portColors: Record<string, string> = {
              teal: '#14b8a6', green: '#22c55e', blue: '#3b82f6', amber: '#f59e0b',
              violet: '#8b5cf6', red: '#ef4444', orange: '#f97316', pink: '#ec4899'
            };
            htmlContent += `
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
                ${block.ports.map(p => `
                  <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8; font-size: 13px;">${p.name}</span>
                    <span style="color: ${portColors[p.color] || '#14b8a6'}; font-weight: 700; font-size: 15px;">${p.port}</span>
                  </div>
                `).join('')}
              </div>
            `;
          } else if (block.type === 'infocards' && block.infocards) {
            const cardColors: Record<string, { bg: string; text: string }> = {
              red: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
              orange: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' },
              amber: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
              green: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
              teal: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf' },
              blue: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
              violet: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa' },
              pink: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' }
            };
            htmlContent += `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                ${block.infocards.map(card => {
                  const colors = cardColors[card.color || 'teal'] || cardColors.teal;
                  return `
                    <div style="background: ${colors.bg}; border: 1px solid ${colors.text}33; border-radius: 10px; padding: 16px;">
                      <div style="color: ${colors.text}; font-weight: 700; font-size: 14px; margin-bottom: 4px;">${card.title}</div>
                      <div style="color: ${colors.text}; opacity: 0.8; font-family: monospace; font-size: 12px;">${card.content}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          } else if (block.type === 'twocolumn') {
            const leftColor = block.leftColor === 'emerald' ? '#10b981' : '#14b8a6';
            const rightColor = block.rightColor === 'amber' ? '#f59e0b' : '#f97316';
            htmlContent += `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="background: #1e293b; border: 1px solid ${leftColor}44; border-left: 3px solid ${leftColor}; border-radius: 10px; padding: 20px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 8px; height: 8px; background: ${leftColor}; border-radius: 50%;"></div>
                    <span style="color: ${leftColor}; font-weight: 600; font-size: 15px;">${block.leftTitle || ''}</span>
                  </div>
                  <div style="color: #cbd5e1; font-size: 14px; line-height: 1.7;">${block.leftContent?.replace(/<[^>]*>/g, '').replace(/•/g, '<br>• ') || ''}</div>
                </div>
                <div style="background: #1e293b; border: 1px solid ${rightColor}44; border-left: 3px solid ${rightColor}; border-radius: 10px; padding: 20px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 8px; height: 8px; background: ${rightColor}; border-radius: 50%;"></div>
                    <span style="color: ${rightColor}; font-weight: 600; font-size: 15px;">${block.rightTitle || ''}</span>
                  </div>
                  <div style="color: #cbd5e1; font-size: 14px; line-height: 1.7;">${block.rightContent?.replace(/<[^>]*>/g, '').replace(/•/g, '<br>• ') || ''}</div>
                </div>
              </div>
            `;
          } else if (block.type === 'flowcards' && block.flows) {
            const flowColors: Record<string, string> = {
              teal: '#14b8a6', amber: '#f59e0b', violet: '#8b5cf6', green: '#22c55e', blue: '#3b82f6'
            };
            htmlContent += `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                ${block.flows.map(f => `
                  <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px;">
                    <span style="color: ${flowColors[f.color] || '#14b8a6'}; font-size: 13px; font-weight: 500;">${f.flow}</span>
                  </div>
                `).join('')}
              </div>
            `;
          }
        });
        
        htmlContent += '</div>';
      });

      // Add footer
      htmlContent += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; text-align: center;">
          <p style="color: #475569; font-size: 11px; margin: 0;">
            Generated by RunbookForge • runbookforge.com • ${new Date().toLocaleDateString()}
          </p>
        </div>
      `;
      
      tempContainer.innerHTML = htmlContent;
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      document.body.removeChild(tempContainer);
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${runbook.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Markdown
  const exportToMarkdown = () => {
    if (!runbook) return;
    
    let markdown = `# ${runbook.title}\n\n`;
    if (runbook.description) {
      markdown += `${runbook.description}\n\n`;
    }
    markdown += `---\n\n`;
    
    runbook.sections.forEach((section, sectionIndex) => {
      markdown += `## ${sectionIndex + 1}. ${section.title}\n\n`;
      
      let stepNumber = 0;
      section.blocks.forEach(block => {
        if (block.type === 'step') {
          stepNumber++;
          markdown += `### Step ${stepNumber}: ${block.title || 'Untitled'}\n\n`;
          if (block.content) {
            markdown += `${block.content.replace(/<[^>]*>/g, '')}\n\n`;
          }
        } else if (block.type === 'code') {
          markdown += `\`\`\`${block.language || ''}\n${block.content || ''}\n\`\`\`\n\n`;
        } else if (block.type === 'warning') {
          markdown += `> ⚠️ **Warning:** ${block.content?.replace(/<[^>]*>/g, '') || ''}\n\n`;
        } else if (block.type === 'info') {
          markdown += `> ℹ️ **Info:** ${block.content?.replace(/<[^>]*>/g, '') || ''}\n\n`;
        } else if (block.type === 'table' && block.tableData) {
          markdown += `| ${block.tableData.headers.join(' | ')} |\n`;
          markdown += `| ${block.tableData.headers.map(() => '---').join(' | ')} |\n`;
          block.tableData.rows.forEach(row => {
            markdown += `| ${row.join(' | ')} |\n`;
          });
          markdown += '\n';
        } else if (block.type === 'servertable' && block.servers) {
          markdown += `| Hostname | Role | IP | Region | Components |\n`;
          markdown += `| --- | --- | --- | --- | --- |\n`;
          block.servers.forEach(s => {
            markdown += `| ${s.hostname} | ${s.role} | ${s.ip} | ${s.region} | ${s.components} |\n`;
          });
          markdown += '\n';
        } else if (block.type === 'infocards' && block.infocards) {
          block.infocards.forEach(card => {
            markdown += `- **${card.title}**: \`${card.content}\`\n`;
          });
          markdown += '\n';
        } else if (block.type === 'portref' && block.ports) {
          markdown += `| Service | Port |\n| --- | --- |\n`;
          block.ports.forEach(p => {
            markdown += `| ${p.name} | ${p.port} |\n`;
          });
          markdown += '\n';
        } else if (block.type === 'twocolumn') {
          if (block.leftTitle) markdown += `**${block.leftTitle}**\n${block.leftContent?.replace(/<[^>]*>/g, '') || ''}\n\n`;
          if (block.rightTitle) markdown += `**${block.rightTitle}**\n${block.rightContent?.replace(/<[^>]*>/g, '') || ''}\n\n`;
        }
      });
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runbook.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!runbook) return;
    
    const exportData = {
      title: runbook.title,
      description: runbook.description,
      sections: runbook.sections,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runbook.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this runbook?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/runbooks/${params.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard/runbooks');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open share modal and fetch existing shares
  const openShareModal = async () => {
    if (!runbook) return;
    setShowShareModal(true);
    setShareEmail('');
    setSharePermission('view');
    setShareError('');
    
    try {
      const response = await fetch(`/api/shares?resource_type=runbook&resource_id=${runbook.id}`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  // Create a share
  const createShare = async () => {
    if (!runbook || !shareEmail.trim()) return;
    
    setSharingInProgress(true);
    setShareError('');
    
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail.trim().toLowerCase(),
          resource_type: 'runbook',
          resource_id: runbook.id,
          permission: sharePermission
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShares([data, ...shares]);
        setShareEmail('');
      } else {
        setShareError(data.error || 'Failed to share');
      }
    } catch (error) {
      setShareError('Failed to share. Please try again.');
    } finally {
      setSharingInProgress(false);
    }
  };

  // Remove a share
  const removeShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares?id=${shareId}`, { method: 'DELETE' });
      if (response.ok) {
        setShares(shares.filter(s => s.id !== shareId));
      }
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  // Copy share link
  const copyShareLink = () => {
    if (!runbook) return;
    const link = `${window.location.origin}/dashboard/runbooks/${runbook.id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // Extract all unique tags from blocks
  const getAllTags = () => {
    if (!runbook) return [];
    const tags = new Set<string>();
    runbook.sections.forEach(section => {
      section.blocks.forEach(block => {
        block.tags?.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags);
  };

  // Count steps in a section
  const countSteps = (section: Section) => {
    return section.blocks.filter(b => b.type === 'step').length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !runbook) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{error || 'Runbook not found'}</h2>
          <p className="text-slate-400 mb-6">The runbook you're looking for doesn't exist or has been deleted.</p>
          <Link href="/dashboard/runbooks" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors">
            <ArrowLeft size={18} />
            Back to Runbooks
          </Link>
        </div>
      </div>
    );
  }

  const allTags = getAllTags();
  const currentSection = runbook.sections[activeSection];

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <Link href="/dashboard/runbooks" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
        >
          <Menu size={16} />
          Sections
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 z-50 overflow-y-auto p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Sections</h2>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Runbook Info */}
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{runbook.title}</h3>
                    <p className="text-xs text-slate-500">Runbook</p>
                  </div>
                </div>
                
                {/* Tags */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Navigation */}
              <nav className="space-y-1 mb-4">
                {runbook.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => { setActiveSection(index); setShowMobileSidebar(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeSection === index
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {index + 1}. {section.title}
                  </button>
                ))}
              </nav>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Link
                  href={`/dashboard/runbooks/${runbook.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium"
                >
                  <Edit size={16} />
                  Edit Runbook
                </Link>
                <button
                  onClick={() => { setShowSellModal(true); setShowMobileSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium"
                >
                  <ShoppingBag size={16} />
                  Sell on Marketplace
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Desktop */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block w-64 flex-shrink-0"
      >
        <div className="sticky top-24 space-y-4">
          {/* Runbook Info */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm line-clamp-1">{runbook.title}</h2>
                <p className="text-xs text-slate-500">Runbook</p>
              </div>
            </div>
            
            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {allTags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded border border-teal-500/30">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Section Navigation */}
            <nav className="space-y-1">
              {runbook.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === index
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {index + 1}. {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300">
                <ExternalLink size={14} />
                Documentation
              </a>
            </div>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Runbook
                  <ChevronDown size={14} className={`ml-auto transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); exportToPDF(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors border-b border-slate-700"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <FileText size={16} className="text-red-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">PDF Document</div>
                    <div className="text-xs text-slate-400">Print-ready format</div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); exportToMarkdown(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors border-b border-slate-700"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileType size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Markdown</div>
                    <div className="text-xs text-slate-400">For documentation sites</div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); exportToJSON(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <FileJson size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">JSON Data</div>
                    <div className="text-xs text-slate-400">Import to other tools</div>
                  </div>
                </button>
              </motion.div>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={openShareModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700 transition-all"
          >
            <Share2 size={16} />
            Share Runbook
          </button>

          {/* Edit Mode Button */}
          <Link
            href={`/dashboard/runbooks/${runbook.id}/edit`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
          >
            <Edit size={16} />
            Enable Edit Mode
          </Link>

          {/* Sell on Marketplace Button */}
          <button
            onClick={() => setShowSellModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium hover:bg-violet-500/30 transition-all"
          >
            <ShoppingBag size={16} />
            Sell on Marketplace
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-500/30 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Runbook
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-w-0"
      >
        {/* Back Button - Desktop only */}
        <Link href="/dashboard/runbooks" className="hidden lg:inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Runbooks
        </Link>

        {/* Section Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-8">{currentSection?.title}</h1>

        {/* Content */}
        <div className="space-y-4 lg:space-y-6">
          {currentSection?.blocks.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-slate-400">This section is empty.</p>
            </div>
          ) : (
            (() => {
              let stepCounter = 0;
              return currentSection?.blocks.map((block) => {
                if (block.type === 'step') {
                  stepCounter++;
                  return (
                    <div key={block.id} className="space-y-4">
                      <BlockRenderer block={block} stepNumber={stepCounter} />
                    </div>
                  );
                }
                return (
                  <div key={block.id}>
                    <BlockRenderer block={block} />
                  </div>
                );
              });
            })()
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
            disabled={activeSection === 0}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous Section
          </button>
          <span className="text-sm text-slate-500">
            {activeSection + 1} of {runbook.sections.length}
          </span>
          <button
            onClick={() => setActiveSection(prev => Math.min(runbook.sections.length - 1, prev + 1))}
            disabled={activeSection === runbook.sections.length - 1}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Section →
          </button>
        </div>
      </motion.main>

      {/* Sell on Marketplace Modal */}
      <AnimatePresence>
        {showSellModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSellModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Sell on Marketplace</h2>
                      <p className="text-sm text-slate-400">List this runbook for sale</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-5">
                {/* Runbook Info */}
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h3 className="font-medium text-white mb-1">{runbook.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{runbook.description || 'No description'}</p>
                  <p className="text-xs text-slate-500 mt-2">{runbook.sections.length} sections</p>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Personal License Price (USD)
                  </label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="25.00"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Team license: ${(parseFloat(sellPrice || '0') * 3).toFixed(2)} • Enterprise: ${(parseFloat(sellPrice || '0') * 10).toFixed(2)}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={sellCategory}
                    onChange={(e) => setSellCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Security">Security</option>
                    <option value="Operations">Operations</option>
                    <option value="Networking">Networking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Revenue Split Info */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Revenue Split
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-emerald-300">You receive (70%)</span>
                      <span className="text-emerald-400 font-medium">
                        ${(parseFloat(sellPrice || '0') * 0.7).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Platform fee (30%)</span>
                      <span className="text-slate-400">
                        ${(parseFloat(sellPrice || '0') * 0.3).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <h4 className="font-medium text-white mb-2">Before you submit</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>✓ Runbook will be reviewed by our team</li>
                    <li>✓ Buyers get permanent access</li>
                    <li>✓ Payouts processed monthly via Stripe</li>
                    <li>✓ You can update pricing anytime</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-800/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitToMarketplace}
                    disabled={isSubmitting || !sellPrice}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && runbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">Share Runbook</h2>
                  <p className="text-sm text-slate-400 truncate">{runbook.title}</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Copy Link */}
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <ExternalLink size={16} />
                      <span className="text-sm">Anyone with the link can view</span>
                    </div>
                    <button
                      onClick={copyShareLink}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Copy size={14} />
                      Copy Link
                    </button>
                  </div>
                </div>
                
                {/* Share by Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <UserPlus size={16} />
                      Share with specific people
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="view">Can view</option>
                        <option value="download">Can download</option>
                        <option value="edit">Can edit</option>
                      </select>
                    </div>
                    <button
                      onClick={createShare}
                      disabled={!shareEmail.trim() || sharingInProgress}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sharingInProgress ? <Loader2 size={18} className="animate-spin" /> : 'Share'}
                    </button>
                  </div>
                  {shareError && (
                    <p className="mt-2 text-sm text-red-400">{shareError}</p>
                  )}
                </div>
                
                {/* Existing Shares */}
                {shares.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Shared with</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {shares.map((share) => (
                        <div key={share.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-slate-500" />
                            <span className="text-sm text-white">{share.shared_with_email}</span>
                            <span className="px-2 py-0.5 bg-slate-700 text-xs text-slate-400 rounded">
                              {share.permission}
                            </span>
                          </div>
                          <button
                            onClick={() => removeShare(share.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end p-4 border-t border-slate-800">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client'

import { motion } from "framer-motion";
import { BookOpen, Database, Cloud, Server, Container, Lock } from "lucide-react";

const templates = [
  {
    title: 'PostgreSQL HA Setup',
    description: 'High availability PostgreSQL with Patroni',
    icon: Database,
    category: 'Database',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    title: 'Kubernetes Deployment',
    description: 'Deploy applications to Kubernetes cluster',
    icon: Container,
    category: 'DevOps',
    color: 'from-sky-500 to-blue-500',
  },
  {
    title: 'AWS EC2 Setup',
    description: 'Launch and configure EC2 instances',
    icon: Cloud,
    category: 'Cloud',
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Nginx Configuration',
    description: 'Set up Nginx as reverse proxy',
    icon: Server,
    category: 'Web Server',
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'SSL Certificate Setup',
    description: 'Configure SSL/TLS certificates',
    icon: Lock,
    category: 'Security',
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Docker Compose Stack',
    description: 'Multi-container Docker applications',
    icon: Container,
    category: 'DevOps',
    color: 'from-blue-500 to-indigo-500',
  },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <BookOpen className="text-sky-400" />
          Templates
        </h1>
        <p className="text-slate-400">
          Start with a pre-built template and customize it to your needs.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {templates.map((template, i) => (
          <motion.button
            key={template.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="group p-6 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <template.icon size={24} className="text-white" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {template.category}
            </span>
            <h3 className="text-lg font-semibold text-white mt-1 mb-2">
              {template.title}
            </h3>
            <p className="text-sm text-slate-400">{template.description}</p>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center"
      >
        <p className="text-slate-400">
          More templates coming soon! Have a suggestion?{' '}
          <a href="mailto:hello@runbookforge.com" className="text-teal-400 hover:text-teal-300">
            Let us know
          </a>
        </p>
      </motion.div>
    </div>
  );
}

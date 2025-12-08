'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wrench, Play, GraduationCap, Shield, FileText, 
  Menu, X, Zap, Users, Clock, Check, ArrowRight, 
  Sparkles, Download, BookOpen, ShoppingBag, Code,
  Palette, Table, CheckSquare, Share2, Lock, Globe,
  Star, TrendingUp, DollarSign, Cpu, Bot, FileJson,
  Layers, Database, Cloud, AlertCircle, Terminal,
  Briefcase, Award, Target, Rocket, BarChart, Heart,
  ChevronRight, Monitor, Smartphone, Copy, Eye,
  PenTool, Settings, Boxes, FileCheck, Workflow,
  Search, Filter, Tags
} from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass border-b border-slate-800' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <motion.a 
            href="/" 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6"/>
                  <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad1)"/>
              <path d="M14 12h20c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V14c0-1.1.9-2 2-2z" fill="white" fillOpacity="0.2"/>
              <rect x="16" y="17" width="12" height="2" rx="1" fill="white"/>
              <rect x="16" y="22" width="16" height="2" rx="1" fill="white"/>
              <rect x="16" y="27" width="10" height="2" rx="1" fill="white"/>
              <circle cx="33" cy="33" r="7" fill="white"/>
              <path d="M30 33l2.5 2.5L36 31" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white leading-tight">RunbookForge</span>
              <span className="text-[10px] text-slate-500 tracking-wide">a SUTA company</span>
            </div>
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#ai" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">AI Builder</a>
            <a href="#marketplace" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Marketplace</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <Link href="/sign-in" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
              >
                Get Started Free
              </Link>
            </motion.div>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden glass border-t border-slate-800"
        >
          <div className="px-6 py-4 space-y-4">
            <a href="#features" className="block text-slate-400 hover:text-white">Features</a>
            <a href="#ai" className="block text-slate-400 hover:text-white">AI Builder</a>
            <a href="#marketplace" className="block text-slate-400 hover:text-white">Marketplace</a>
            <a href="#pricing" className="block text-slate-400 hover:text-white">Pricing</a>
            <Link href="/sign-in" className="block text-slate-400 hover:text-white">Sign In</Link>
            <Link 
              href="/sign-up"
              className="block w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold text-center"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-teal-500/20 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-sm mb-8"
          >
            <Sparkles size={16} />
            Now Live: Marketplace, Templates, AI Generation & More
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
          >
            Create. Document. Execute.
            <br />
            <span className="gradient-text">Professional Runbooks Made Simple.</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-slate-400 max-w-3xl mx-auto mb-10"
          >
            The complete platform for building beautiful technical documentation. 
            15+ block types, AI-powered generation, interactive run mode, and a 
            marketplace to buy or sell your expertise.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
              >
                Start Building Free
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard/templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold hover:bg-slate-700 transition-all"
              >
                <BookOpen size={18} />
                Explore Templates
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-teal-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-teal-500" />
              Free forever tier
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-teal-500" />
              Export to PDF, Markdown, HTML
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-teal-500" />
              Sell on Marketplace
            </span>
          </motion.div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: '15+', label: 'Block Types' },
            { value: '8', label: 'Ready Templates' },
            { value: '3', label: 'Export Formats' },
            { value: '70%', label: 'Creator Revenue' },
          ].map((stat, i) => (
            <div key={i} className="p-4 md:p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: PenTool,
      title: 'Visual Block Editor',
      description: '15+ specialized block types including code snippets, server tables, checklists, flow diagrams, and more. Rich text editing with syntax highlighting.',
      color: 'teal'
    },
    {
      icon: Bot,
      title: 'AI-Powered Generation',
      description: 'Paste any documentation or describe your topic. Our AI transforms it into structured, professional runbooks with proper formatting and sections.',
      color: 'violet'
    },
    {
      icon: Play,
      title: 'Interactive Run Mode',
      description: 'Execute procedures step-by-step with checklists, timers, and progress tracking. Copy code snippets with one click.',
      color: 'emerald'
    },
    {
      icon: Download,
      title: 'Export Anywhere',
      description: 'Beautiful PDF exports with full styling, Markdown for Git repos, JSON for backups, and shareable public links.',
      color: 'amber'
    },
    {
      icon: ShoppingBag,
      title: 'Sell Your Expertise',
      description: 'List runbooks on the marketplace and earn 70% of every sale. Build passive income from your technical knowledge.',
      color: 'pink'
    },
    {
      icon: BookOpen,
      title: 'Professional Templates',
      description: 'Start from expertly crafted templates for PostgreSQL, Kubernetes, AWS, incident response, and more.',
      color: 'blue'
    },
  ]

  return (
    <section id="features" className="py-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Everything You Need
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            The Complete Runbook Platform
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-3xl mx-auto">
            From creation to execution to monetization—everything in one place.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                feature.color === 'teal' ? 'bg-teal-500/10' :
                feature.color === 'violet' ? 'bg-violet-500/10' :
                feature.color === 'emerald' ? 'bg-emerald-500/10' :
                feature.color === 'amber' ? 'bg-amber-500/10' :
                feature.color === 'pink' ? 'bg-pink-500/10' :
                'bg-blue-500/10'
              }`}>
                <feature.icon size={24} className={
                  feature.color === 'teal' ? 'text-teal-400' :
                  feature.color === 'violet' ? 'text-violet-400' :
                  feature.color === 'emerald' ? 'text-emerald-400' :
                  feature.color === 'amber' ? 'text-amber-400' :
                  feature.color === 'pink' ? 'text-pink-400' :
                  'text-blue-400'
                } />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlockTypesSection() {
  const blocks = [
    { name: 'Step', icon: FileCheck, desc: 'Numbered procedure steps' },
    { name: 'Code', icon: Terminal, desc: 'Syntax-highlighted code' },
    { name: 'Table', icon: Table, desc: 'Data tables with headers' },
    { name: 'Server Table', icon: Database, desc: 'Infrastructure info' },
    { name: 'Checklist', icon: CheckSquare, desc: 'Interactive checklists' },
    { name: 'Warning', icon: AlertCircle, desc: 'Caution notices' },
    { name: 'Info', icon: FileText, desc: 'Information callouts' },
    { name: 'Two Column', icon: Layers, desc: 'Side-by-side content' },
    { name: 'Cards', icon: Boxes, desc: 'Grouped info cards' },
    { name: 'Flow Cards', icon: Workflow, desc: 'Process flows' },
    { name: 'Port Reference', icon: Settings, desc: 'Port/config maps' },
    { name: 'Info Cards', icon: Tags, desc: 'Metric displays' },
    { name: 'Text', icon: FileText, desc: 'Rich text content' },
    { name: 'Divider', icon: ChevronRight, desc: 'Section dividers' },
    { name: 'Quote', icon: Copy, desc: 'Block quotes' },
  ]

  return (
    <section className="py-24 border-t border-slate-800 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-4">
            15+ Block Types
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Build Any Type of Documentation
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-3xl mx-auto">
            From simple steps to complex server tables, we have a block for every need.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.05 }}
              className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl text-center hover:border-violet-500/50 transition-all cursor-default"
            >
              <block.icon size={24} className="text-violet-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">{block.name}</p>
              <p className="text-slate-500 text-xs hidden md:block">{block.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AISection() {
  return (
    <section id="ai" className="py-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-4">
              AI-Powered
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Import or Generate with AI
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Two powerful ways to create runbooks instantly:
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Copy size={24} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Import</h3>
                  <p className="text-slate-400">Paste any existing documentation—Confluence pages, Google Docs, plain text—and our AI transforms it into a structured, beautiful runbook with proper sections and formatting.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={24} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Generate</h3>
                  <p className="text-slate-400">Describe what you need—"PostgreSQL backup procedures" or "Kubernetes deployment checklist"—and get a complete, professional runbook in seconds.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
              >
                Try AI Builder
                <Zap size={18} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
                <Bot size={18} className="text-amber-400" />
                AI Generator
              </div>
              <div className="p-4 bg-slate-800 rounded-lg mb-4">
                <p className="text-slate-300 text-sm">
                  "Create a runbook for setting up PostgreSQL high availability with Patroni, including prerequisites, installation steps, and failover testing"
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-xs text-teal-400">1</div>
                  <span className="text-slate-300">Prerequisites & Requirements</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-xs text-teal-400">2</div>
                  <span className="text-slate-300">Server Preparation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-xs text-teal-400">3</div>
                  <span className="text-slate-300">PostgreSQL Installation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-xs text-teal-400">4</div>
                  <span className="text-slate-300">Patroni Configuration</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-xs text-teal-400">5</div>
                  <span className="text-slate-300">Failover Testing</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-24 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-violet-950/20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-pink-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Marketplace
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Buy or Sell Professional Runbooks
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-3xl mx-auto">
            Access expert-crafted procedures or monetize your technical expertise.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-slate-900 border border-slate-800 rounded-2xl"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <ShoppingBag size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Buy Runbooks</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-3">
                <Check size={18} className="text-emerald-500" />
                Expertly crafted by industry professionals
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-emerald-500" />
                Personal, Team, and Enterprise licenses
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-emerald-500" />
                Permanent access with 1 year of updates
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-emerald-500" />
                Export to PDF, HTML, Markdown
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-emerald-500" />
                7-day money-back guarantee
              </li>
            </ul>
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center gap-2 mt-6 text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
            >
              Browse Marketplace <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-slate-900 border border-violet-500/30 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-violet-500/20 text-violet-400 text-xs font-medium rounded-full">
              70% Revenue Share
            </div>
            <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
              <DollarSign size={28} className="text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Sell Your Runbooks</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-3">
                <Check size={18} className="text-violet-500" />
                Keep 70% of every sale you make
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-violet-500" />
                Set your own prices (Personal, Team, Enterprise)
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-violet-500" />
                Monthly payouts via Stripe
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-violet-500" />
                Creator dashboard with analytics
              </li>
              <li className="flex items-center gap-3">
                <Check size={18} className="text-violet-500" />
                Build passive income from your expertise
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 mt-6 text-violet-400 font-medium hover:text-violet-300 transition-colors"
            >
              Start Selling <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function TemplatesSection() {
  const templates = [
    { title: 'PostgreSQL High Availability', category: 'Database', icon: Database, color: 'teal' },
    { title: 'Kubernetes Production Setup', category: 'DevOps', icon: Cloud, color: 'blue' },
    { title: 'AWS Infrastructure Baseline', category: 'Cloud', icon: Cloud, color: 'amber' },
    { title: 'Incident Response Playbook', category: 'Operations', icon: AlertCircle, color: 'red' },
  ]

  return (
    <section className="py-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Templates
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Start from Expert Templates
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-3xl mx-auto">
            Production-ready runbooks you can customize for your needs.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
            >
              <template.icon size={24} className={
                template.color === 'teal' ? 'text-teal-400 mb-3' :
                template.color === 'blue' ? 'text-blue-400 mb-3' :
                template.color === 'amber' ? 'text-amber-400 mb-3' :
                'text-red-400 mb-3'
              } />
              <h3 className="font-semibold text-white mb-1">{template.title}</h3>
              <p className="text-sm text-slate-500">{template.category}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors"
          >
            View All Templates <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  const useCases = [
    {
      icon: Database,
      title: 'Database Operations',
      description: 'Backup procedures, failover playbooks, migration runbooks, maintenance windows.',
      users: 'DBAs, SREs'
    },
    {
      icon: Cloud,
      title: 'Cloud & Infrastructure',
      description: 'Deployment checklists, scaling procedures, disaster recovery, security hardening.',
      users: 'DevOps, Platform Engineers'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Incident response, audit procedures, access reviews, vulnerability remediation.',
      users: 'Security Teams'
    },
    {
      icon: GraduationCap,
      title: 'Training & Onboarding',
      description: 'Team onboarding guides, certification prep, hands-on labs, knowledge transfer.',
      users: 'Trainers, Team Leads'
    },
  ]

  return (
    <section className="py-24 border-t border-slate-800 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Use Cases
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Built for Technical Teams
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-5 p-6 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <useCase.icon size={24} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{useCase.description}</p>
                <p className="text-xs text-slate-500">For: {useCase.users}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      features: [
        '5 runbooks', 
        'All 15+ block types', 
        'AI Import & Generate (5/mo)', 
        'PDF & Markdown export',
        'Public sharing',
        'View templates'
      ],
      featured: false,
      cta: 'Get Started'
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      features: [
        'Unlimited runbooks', 
        'Unlimited AI generations', 
        'All export formats',
        'Private runbooks',
        'Run mode analytics',
        'Priority support',
        'Sell on Marketplace'
      ],
      featured: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Team',
      price: '$49',
      period: '/month',
      features: [
        'Everything in Pro', 
        'Up to 10 team members', 
        'Shared workspaces', 
        'Team templates',
        'Admin dashboard',
        'SSO integration'
      ],
      featured: false,
      cta: 'Contact Sales'
    },
  ]

  return (
    <section id="pricing" className="py-24 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Start free, scale as you grow
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400">
            No credit card required. Upgrade when you're ready.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative p-8 rounded-2xl transition-all ${
                plan.featured 
                  ? 'bg-slate-900 border-2 border-teal-500' 
                  : 'bg-slate-900 border border-slate-800'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-teal-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/sign-up"
                  className={`block w-full py-4 rounded-xl font-semibold transition-all text-center ${
                    plan.featured
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your documentation?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join engineers who are building better runbooks in minutes, not hours.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-lg"
            >
              Get Started Free
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          <p className="text-sm text-slate-500 mt-6">
            No credit card required • Free forever tier • Setup in 2 minutes
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad2)"/>
                <path d="M14 12h20c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V14c0-1.1.9-2 2-2z" fill="white" fillOpacity="0.2"/>
                <rect x="16" y="17" width="12" height="2" rx="1" fill="white"/>
                <rect x="16" y="22" width="16" height="2" rx="1" fill="white"/>
                <rect x="16" y="27" width="10" height="2" rx="1" fill="white"/>
                <circle cx="33" cy="33" r="7" fill="white"/>
                <path d="M30 33l2.5 2.5L36 31" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white leading-tight">RunbookForge</span>
                <span className="text-[10px] text-slate-500 tracking-wide">a SUTA company</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              The complete platform for creating, sharing, and selling professional technical runbooks.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><Link href="/dashboard/templates" className="text-slate-400 hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-slate-400 hover:text-white transition-colors">Marketplace</Link></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Get Started</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sign-up" className="text-slate-400 hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/sign-in" className="text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © 2025 RunbookForge. All rights reserved.
          </p>
          <p className="text-slate-600 text-sm">
            A <span className="text-teal-500 font-semibold">SUTA</span> Company
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <BlockTypesSection />
      <AISection />
      <MarketplaceSection />
      <TemplatesSection />
      <UseCasesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}

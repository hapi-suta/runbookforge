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
  Search, Filter, Tags, Library, Brain, MessageSquare,
  ClipboardCheck, FolderOpen, Video, Presentation
} from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
          <motion.a href="/" className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
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
            <a href="#training" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Training</a>
            <a href="#marketplace" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Marketplace</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <Link href="/sign-in" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/sign-up" className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow">
                Get Started Free
              </Link>
            </motion.div>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden glass border-t border-slate-800">
          <div className="px-6 py-4 space-y-4">
            <a href="#features" className="block text-slate-400 hover:text-white">Features</a>
            <a href="#training" className="block text-slate-400 hover:text-white">Training</a>
            <a href="#marketplace" className="block text-slate-400 hover:text-white">Marketplace</a>
            <a href="#pricing" className="block text-slate-400 hover:text-white">Pricing</a>
            <Link href="/sign-in" className="block text-slate-400 hover:text-white">Sign In</Link>
            <Link href="/sign-up" className="block w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold text-center">
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
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-purple-500/30 rounded-full text-sm mb-8">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-purple-400">New:</span>
            <span className="text-slate-300">Training Center + Knowledge Base + AI Generation</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Build. Train. Share.
            <br />
            <span className="gradient-text">Technical Excellence Made Simple.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            The all-in-one platform for runbooks, training, and knowledge sharing. 
            Create beautiful documentation, train your team with AI-generated content, 
            and build a community knowledge base.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all">
                Start Building Free
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold hover:bg-slate-700 transition-all">
                <Play size={18} />
                See How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3">
            {[
              { icon: FileText, label: 'Interactive Runbooks', color: 'teal' },
              { icon: GraduationCap, label: 'Training Center', color: 'purple' },
              { icon: Library, label: 'Knowledge Base', color: 'blue' },
              { icon: Brain, label: 'AI Generation', color: 'pink' },
              { icon: ShoppingBag, label: 'Marketplace', color: 'amber' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-full text-${item.color}-400 text-sm`}>
                <item.icon size={16} />
                {item.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: 'Interactive Runbooks',
      description: '15+ block types including code, checklists, diagrams, and more. Execute step-by-step with Run Mode.',
      color: 'teal'
    },
    {
      icon: GraduationCap,
      title: 'Training Center',
      description: 'Create courses with organized sections. Auto-generate quizzes, assignments, and labs with AI.',
      color: 'purple',
      badge: 'NEW'
    },
    {
      icon: Library,
      title: 'Knowledge Base',
      description: 'Community-contributed runbooks. Submit, review, and share expertise across your organization.',
      color: 'blue',
      badge: 'NEW'
    },
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Generate presentations, runbooks, quizzes, and interview questions instantly with Claude AI.',
      color: 'pink'
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Buy and sell professional runbooks. Monetize your expertise or learn from the community.',
      color: 'amber'
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share via link, embed anywhere, or collaborate with your team in real-time.',
      color: 'emerald'
    }
  ]

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">One platform for documentation, training, and knowledge management</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, borderColor: `var(--${feature.color}-500)` }}
              className="relative p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-600 transition-all"
            >
              {feature.badge && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-[10px] font-bold text-white">
                  {feature.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                <feature.icon className={`text-${feature.color}-400`} size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrainingSection() {
  const sections = [
    { key: 'learn', icon: BookOpen, title: 'Learn', desc: 'Presentations & tutorials', color: 'amber' },
    { key: 'practice', icon: Wrench, title: 'Practice', desc: 'Labs & hands-on exercises', color: 'teal' },
    { key: 'assess', icon: ClipboardCheck, title: 'Assess', desc: 'Quizzes & assignments', color: 'purple' },
    { key: 'resources', icon: FolderOpen, title: 'Resources', desc: 'Recordings & references', color: 'blue' },
    { key: 'career', icon: Briefcase, title: 'Career', desc: 'Interview prep', color: 'emerald' },
  ]

  const aiTypes = [
    { icon: Presentation, label: 'Presentations', desc: 'Up to 100 slides' },
    { icon: FileText, label: 'Runbooks', desc: 'Step-by-step guides' },
    { icon: CheckSquare, label: 'Quizzes', desc: 'MCQ, True/False, more' },
    { icon: Target, label: 'Assignments', desc: 'With rubrics' },
    { icon: Zap, label: 'Challenges', desc: 'No hints mode' },
    { icon: MessageSquare, label: 'Interview Prep', desc: 'AI evaluator' },
  ]

  return (
    <section id="training" className="py-24 bg-gradient-to-b from-slate-900/50 to-transparent relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
            <GraduationCap size={16} />
            Training Center
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Train Your Team Like Never Before</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Create structured courses with AI-generated content. Organized sections, automatic progress tracking, and powerful assessments.</p>
        </motion.div>

        {/* Sections Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <h3 className="text-center text-lg font-semibold text-slate-300 mb-6">Auto-Created Course Sections</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className={`flex items-center gap-3 px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl hover:border-${section.color}-500/50 transition-all cursor-default`}
              >
                <div className={`w-10 h-10 rounded-lg bg-${section.color}-500/20 flex items-center justify-center`}>
                  <section.icon className={`text-${section.color}-400`} size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">{section.title}</p>
                  <p className="text-xs text-slate-500">{section.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Generation */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 border border-purple-500/20 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">AI Content Generation</h3>
              <p className="text-slate-400">Click a button, get professional content</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {aiTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all"
              >
                <type.icon className="mx-auto text-purple-400 mb-2" size={28} />
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-slate-500">{type.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-slate-400">Just enter a topic and difficulty level →</p>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-slate-700">
              <Sparkles className="text-purple-400" size={16} />
              <span className="text-white font-medium">Generate with AI</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function KnowledgeBaseSection() {
  const categories = [
    { icon: Database, name: 'Databases', count: 'PostgreSQL, MySQL, MongoDB' },
    { icon: Cloud, name: 'Cloud', count: 'AWS, Azure, GCP' },
    { icon: Boxes, name: 'Containers', count: 'Docker, Kubernetes' },
    { icon: Shield, name: 'Security', count: 'Compliance, Hardening' },
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-6">
              <Library size={16} />
              Knowledge Base
            </div>
            <h2 className="text-4xl font-bold mb-4">Community-Powered Learning</h2>
            <p className="text-xl text-slate-400 mb-8">
              Share your expertise with the community. Submit runbooks for review, 
              browse curated content, and build a searchable library of best practices.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Share2, text: 'Submit your runbooks for community access' },
                { icon: CheckSquare, text: 'Admin review ensures quality content' },
                { icon: Search, text: 'Search by category, difficulty, and tags' },
                { icon: Star, text: 'Upvote helpful content' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <item.icon className="text-blue-400" size={16} />
                  </div>
                  <span className="text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>

            <Link href="/sign-up" className="inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Start Contributing <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                  <Search className="text-slate-500" size={18} />
                  <span className="text-slate-500">Search knowledge base...</span>
                </div>
                <button className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <Filter className="text-slate-400" size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {categories.map((cat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <cat.icon className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{cat.name}</p>
                        <p className="text-xs text-slate-500">{cat.count}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600" size={18} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-500">8 categories • Growing daily</span>
                <span className="text-sm text-blue-400 font-medium">Browse All →</span>
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
    <section id="marketplace" className="py-24 bg-gradient-to-b from-transparent via-amber-900/10 to-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm mb-6">
            <ShoppingBag size={16} />
            Marketplace
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Monetize Your Expertise</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Buy professional runbooks or sell your own. Join a community of experts sharing knowledge.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <DollarSign className="text-emerald-400" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">For Sellers</h3>
            <ul className="space-y-3 mb-6">
              {['Set your own prices', 'Personal & team licensing', 'Instant payouts', 'Analytics dashboard'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <Check className="text-emerald-400" size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="inline-flex items-center gap-2 text-emerald-400 font-medium">
              Start Selling <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6">
              <Download className="text-amber-400" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">For Buyers</h3>
            <ul className="space-y-3 mb-6">
              {['Curated quality content', 'Instant access', 'Use in your training', 'Support creators'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <Check className="text-amber-400" size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 text-amber-400 font-medium">
              Browse Marketplace <ArrowRight size={16} />
            </Link>
          </motion.div>
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
      features: ['10 runbooks', '5 documents', 'Basic templates', 'Community support', 'Knowledge Base access'],
      cta: 'Get Started'
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      features: ['Unlimited runbooks', 'Unlimited documents', 'AI generation', 'Training Center', 'Priority support', 'Custom branding'],
      cta: 'Start Pro Trial',
      featured: true
    },
    {
      name: 'Team',
      price: '$49',
      period: '/month',
      features: ['Everything in Pro', 'Up to 10 team members', 'Team collaboration', 'Admin controls', 'SSO integration', 'Dedicated support'],
      cta: 'Contact Sales'
    }
  ]

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-slate-400">Start free, upgrade when you need more</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative p-8 rounded-2xl transition-all ${
                plan.featured ? 'bg-slate-900 border-2 border-teal-500' : 'bg-slate-900 border border-slate-800'
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
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Level Up?</h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands of engineers building better documentation and training.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-lg">
              Get Started Free
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          <p className="text-sm text-slate-500 mt-6">No credit card required • Free forever tier</p>
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
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad1)"/>
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
              The complete platform for runbooks, training, and knowledge sharing.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#training" className="text-slate-400 hover:text-white transition-colors">Training Center</a></li>
              <li><Link href="/dashboard/knowledge" className="text-slate-400 hover:text-white transition-colors">Knowledge Base</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-slate-400 hover:text-white transition-colors">Marketplace</Link></li>
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
          <p className="text-sm text-slate-600">© 2025 RunbookForge. All rights reserved.</p>
          <p className="text-slate-600 text-sm">A <span className="text-teal-500 font-semibold">SUTA</span> Company</p>
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
      <TrainingSection />
      <KnowledgeBaseSection />
      <MarketplaceSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}

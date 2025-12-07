'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Wrench, Play, GraduationCap, Shield, FileText, Video, 
  MessageSquare, RefreshCw, ChevronRight, Menu, X,
  Zap, Users, Clock, AlertTriangle, Repeat, Skull,
  Check, ArrowRight, Sparkles
} from 'lucide-react'

// Animation variants
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
}

// Navigation Component
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
            href="#" 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-content-center text-xl">
              🔧
            </div>
            <span className="text-xl font-bold text-white">RunbookForge</span>
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#demo" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Demo</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
            >
              Join Waitlist
            </motion.button>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden glass border-t border-slate-800"
        >
          <div className="px-6 py-4 space-y-4">
            <a href="#features" className="block text-slate-400 hover:text-white">Features</a>
            <a href="#demo" className="block text-slate-400 hover:text-white">Demo</a>
            <a href="#pricing" className="block text-slate-400 hover:text-white">Pricing</a>
            <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold">
              Join Waitlist
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-teal-500/20 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-sm mb-8"
          >
            <Sparkles size={16} />
            Launching 2026
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
          >
            Transform Technical Procedures
            <br />
            <span className="gradient-text">into Beautiful Runbooks</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Create stunning, interactive runbooks in minutes. Paste your text or use our form builder—AI handles the rest. No coding required.
          </motion.p>

          <motion.form 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6"
            action="https://formspree.io/f/mpwvjqak"
            method="POST"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2"
            >
              Get Early Access
              <ArrowRight size={18} />
            </motion.button>
          </motion.form>

          <motion.p 
            variants={fadeInUp}
            className="text-sm text-slate-500"
          >
            Join 500+ engineers on the waitlist. No spam, ever.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-3 bg-teal-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Demo Preview Section
function DemoSection() {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ['Overview', 'Server Setup', 'Install PostgreSQL', 'Configure Patroni', 'Verification', 'Reference']

  return (
    <section id="demo" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
        >
          {/* Window Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-4 text-xs text-slate-500 font-mono">patroni-ha-setup.html</span>
          </div>

          <div className="flex min-h-[500px]">
            {/* Sidebar */}
            <div className="hidden md:block w-64 bg-slate-900/50 border-r border-slate-800 p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-sm">
                  🐘
                </div>
                <span className="font-semibold text-sm">Patroni HA Workshop</span>
              </div>
              
              <nav className="space-y-1">
                {tabs.map((tab, i) => (
                  <motion.button
                    key={tab}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeTab === i 
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {['📋', '🖥️', '⚙️', '🔧', '✅', '📚'][i]} {tab}
                  </motion.button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span>⚙️</span> Install PostgreSQL
              </h2>

              <div className="space-y-6">
                {/* Step */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Add PostgreSQL Repository</h4>
                    <p className="text-sm text-slate-400 mb-3">Configure the official PostgreSQL APT repository on all servers.</p>
                    
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono mb-3">
                      🖥️ Run on: All Servers
                    </span>

                    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                        <span className="text-xs text-slate-500 font-mono">bash</span>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 rounded"
                        >
                          Copy
                        </motion.button>
                      </div>
                      <pre className="p-4 text-sm text-emerald-400 font-mono overflow-x-auto">
{`sudo apt update
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Alert */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm"
                >
                  <span className="text-lg">⚠️</span>
                  <span>Make sure ports 5432 and 8008 are open in your firewall before proceeding.</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Problems Section
function ProblemsSection() {
  const problems = [
    { icon: <Zap size={24} />, title: 'Knowledge walks out the door', desc: 'Senior engineer leaves. Years of tribal knowledge disappear overnight.' },
    { icon: <Clock size={24} />, title: '3am incident panic', desc: 'Junior on-call scrambles through outdated wiki pages while production burns.' },
    { icon: <Users size={24} />, title: 'Onboarding takes forever', desc: 'New hires spend months figuring out where things are documented.' },
    { icon: <AlertTriangle size={24} />, title: 'Audit scramble', desc: '"Show us your procedures" triggers a company-wide panic to find docs.' },
    { icon: <Repeat size={24} />, title: 'Same mistakes repeated', desc: '"I thought we documented this last time" said after every incident.' },
    { icon: <Skull size={24} />, title: 'Wiki graveyards', desc: 'Confluence pages rot. READMEs go stale. Nobody trusts the docs.' },
  ]

  return (
    <section className="py-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeInUp} className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            The Problem
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Documentation is where<br />knowledge goes to die
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-2xl mb-16">
            Every company struggles with the same issues. Sound familiar?
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -8, borderColor: 'rgb(239 68 68 / 0.5)' }}
                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl transition-all cursor-default"
              >
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-4">
                  {problem.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-slate-400 text-sm">{problem.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Pillars Section
function PillarsSection() {
  const pillars = [
    {
      icon: '🛠️',
      title: 'Create',
      desc: 'Build beautiful runbooks with AI assistance',
      features: ['Form builder', 'AI text-to-runbook', 'Video-to-docs', 'Terminal capture', 'Import from anywhere'],
      color: 'teal'
    },
    {
      icon: '▶️',
      title: 'Execute',
      desc: 'Run procedures with tracking & metrics',
      features: ['Step-by-step run mode', 'Completion tracking', 'Time analytics', 'Failure detection', 'Incident integration'],
      color: 'sky'
    },
    {
      icon: '🎓',
      title: 'Learn',
      desc: 'Train your team with structured paths',
      features: ['Training paths', 'Certifications', 'Progress tracking', 'Competency matrix', 'Quizzes & labs'],
      color: 'violet'
    },
    {
      icon: '🔒',
      title: 'Comply',
      desc: 'Audit-ready documentation always',
      features: ['Full audit trail', 'SOC2 mapping', 'HIPAA compliance', 'One-click exports', 'Version history'],
      color: 'amber'
    },
  ]

  const colorClasses = {
    teal: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  }

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
            The Solution
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Four pillars of operational excellence
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-2xl mx-auto">
            RunbookForge isn't just documentation. It's a living system for technical knowledge.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12 }}
              className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center group hover:border-teal-500/50 transition-all"
            >
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl ${colorClasses[pillar.color as keyof typeof colorClasses]}`}
              >
                {pillar.icon}
              </motion.div>
              <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{pillar.desc}</p>
              <ul className="text-left space-y-2">
                {pillar.features.map((feature, j) => (
                  <li key={j} className="text-sm text-slate-400 flex items-center gap-2 border-t border-slate-800 pt-2">
                    <Check size={14} className="text-teal-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// AI Section
function AISection() {
  const features = [
    { icon: <FileText size={20} />, title: 'Text to Runbook', desc: 'Paste any text, notes, or docs. AI structures it instantly.' },
    { icon: <Video size={20} />, title: 'Video to Runbook', desc: 'Upload a screen recording. Get documented steps with screenshots.' },
    { icon: <MessageSquare size={20} />, title: 'Slack Import', desc: 'Turn troubleshooting threads into reusable procedures.' },
    { icon: <RefreshCw size={20} />, title: 'Auto-Update', desc: 'AI flags outdated commands and suggests updates.' },
  ]

  return (
    <section className="py-24 border-t border-slate-800 bg-gradient-to-b from-slate-900/0 to-teal-500/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-4">
              AI-Powered
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Paste text.<br />Get a runbook.
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Our AI understands technical procedures. It detects code blocks, warnings, server roles, and structures everything automatically.
            </p>

            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 8 }}
                  className="flex gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-all cursor-default"
                >
                  <div className="w-11 h-11 bg-violet-500/15 rounded-xl flex items-center justify-center text-violet-400 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 bg-violet-500/10 border-b border-slate-800 flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold text-sm">AI Import</span>
            </div>
            
            <div className="p-5 border-b border-slate-800">
              <p className="text-sm text-slate-400 font-mono whitespace-pre-wrap">
{`First install postgresql on all servers using apt.
Run sudo apt update then install postgresql-16.

Configure patroni at /etc/patroni/patroni.yml

Warning: ports 5432 and 8008 must be open`}
              </p>
            </div>

            <div className="p-5 bg-emerald-500/5">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4">
                <Sparkles size={16} />
                AI detected: 2 steps, 1 code block, 1 warning
              </div>
              
              <div className="bg-slate-950 rounded-xl p-4">
                <h5 className="text-teal-400 font-semibold mb-3">PostgreSQL Installation</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-3">
                    <span className="text-teal-400 font-semibold">Step 1:</span>
                    <span className="text-slate-300">Install PostgreSQL [code block detected]</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-teal-400 font-semibold">Step 2:</span>
                    <span className="text-slate-300">Configure Patroni [config file detected]</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-400 font-semibold">⚠️</span>
                    <span className="text-slate-300">Warning: Firewall ports [alert detected]</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'Forever free',
      features: ['5 runbooks', 'Basic form builder', '1 theme', 'HTML download', 'Public sharing'],
      featured: false
    },
    {
      name: 'Pro',
      price: '$15',
      period: '/month',
      features: ['Unlimited runbooks', 'AI text-to-runbook', 'All themes', 'PDF export', 'Version history', 'Custom branding'],
      featured: true
    },
    {
      name: 'Team',
      price: '$49',
      period: '/month',
      features: ['Everything in Pro', 'Up to 10 users', 'Run mode tracking', 'Analytics dashboard', 'Slack integration', 'Priority support'],
      featured: false
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
                  ? 'bg-slate-900 border-2 border-teal-500 glow-teal-strong' 
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
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300 border-t border-slate-800 pt-3">
                    <Check size={16} className="text-teal-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {plan.featured ? 'Join Waitlist' : 'Get Started'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
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
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Ready to get started?
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the waitlist today
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Be among the first to transform how your team documents procedures.
          </p>

          <form 
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            action="https://formspree.io/f/mpwvjqak"
            method="POST"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
            >
              Get Early Access
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-xl">
              🔧
            </div>
            <span className="font-semibold">RunbookForge</span>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="#features" className="text-slate-500 hover:text-white text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-slate-500 hover:text-white text-sm transition-colors">Pricing</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Contact</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Twitter</a>
          </div>
          
          <p className="text-sm text-slate-600">
            © 2025 RunbookForge by StepUpTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Page
export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DemoSection />
      <ProblemsSection />
      <PillarsSection />
      <AISection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}

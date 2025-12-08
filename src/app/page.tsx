'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { 
  Wrench, Play, GraduationCap, FileText, Menu, X, Zap, ArrowRight, 
  Sparkles, BookOpen, ShoppingBag, Share2, Layers, Briefcase, Rocket, Heart,
  ChevronDown, Library, Brain, MessageSquare, ClipboardCheck, FolderOpen, 
  Presentation, CheckSquare, Target, Star, Check, Twitter, Linkedin, Github, Mail
} from 'lucide-react'
import Link from 'next/link'

// Scroll-triggered animation wrapper
function ScrollReveal({ children, direction = 'up', delay = 0, className = '' }: {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate'
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const variants = {
    up: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
    rotate: { hidden: { opacity: 0, rotate: -10, scale: 0.9 }, visible: { opacity: 1, rotate: 0, scale: 1 } },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Floating animation for decorative elements
function FloatingElement({ children, duration = 3, delay = 0, className = '' }: {
  children?: React.ReactNode
  duration?: number
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Counter animation
function AnimatedCounter({ value, duration = 2, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const incrementTime = (duration * 1000) / end
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start >= end) clearInterval(timer)
      }, incrementTime)
      return () => clearInterval(timer)
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// Parallax wrapper
function ParallaxSection({ children, speed = 0.5, className = '' }: {
  children?: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 origin-left z-[60]" />
      
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className={`fixed top-1 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass border-b border-slate-800 backdrop-blur-xl' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <motion.a href="/" className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                  <defs><linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#10b981"/></linearGradient></defs>
                  <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad1)"/>
                  <rect x="16" y="17" width="12" height="2" rx="1" fill="white"/>
                  <rect x="16" y="22" width="16" height="2" rx="1" fill="white"/>
                  <rect x="16" y="27" width="10" height="2" rx="1" fill="white"/>
                  <circle cx="33" cy="33" r="7" fill="white"/>
                  <path d="M30 33l2.5 2.5L36 31" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-tight">RunbookForge</span>
                <span className="text-[10px] text-slate-500 tracking-wide">a SUTA company</span>
              </div>
            </motion.a>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Training', 'Marketplace', 'Pricing'].map((item) => (
                <motion.a key={item} href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-colors text-sm font-medium relative group" whileHover={{ y: -2 }}>
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
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
              <Link href="/sign-up" className="block w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold text-center">Get Started Free</Link>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.9])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <FloatingElement duration={4} className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
        <FloatingElement duration={5} delay={1} className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <FloatingElement duration={6} delay={2} className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl" />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingElement duration={3} className="absolute top-[20%] left-[10%]"><FileText className="text-teal-500/30" size={40} /></FloatingElement>
        <FloatingElement duration={4} delay={0.5} className="absolute top-[30%] right-[15%]"><GraduationCap className="text-purple-500/30" size={48} /></FloatingElement>
        <FloatingElement duration={3.5} delay={1} className="absolute bottom-[30%] left-[15%]"><Brain className="text-pink-500/30" size={36} /></FloatingElement>
        <FloatingElement duration={4.5} delay={1.5} className="absolute bottom-[25%] right-[10%]"><Rocket className="text-amber-500/30" size={44} /></FloatingElement>
      </div>
      
      <motion.div style={{ opacity, scale }} className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-purple-500/30 rounded-full text-sm mb-8">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}><Sparkles size={16} className="text-purple-400" /></motion.div>
          <span className="text-purple-400">New:</span>
          <span className="text-slate-300">Training Center + Knowledge Base + AI Generation</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Build. Train. Share.
          <br />
          <span className="gradient-text">Technical Excellence Made Simple.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
          The all-in-one platform for runbooks, training, and knowledge sharing. Create beautiful documentation, train your team with AI-generated content, and build a community knowledge base.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all">
              Start Building Free
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}><ArrowRight size={18} /></motion.span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold hover:bg-slate-700 transition-all">
              <Play size={18} />See How It Works
            </a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }} className="flex flex-wrap justify-center gap-3">
          {[
            { icon: FileText, label: 'Interactive Runbooks', color: 'teal' },
            { icon: GraduationCap, label: 'Training Center', color: 'purple' },
            { icon: Library, label: 'Knowledge Base', color: 'blue' },
            { icon: Brain, label: 'AI Generation', color: 'pink' },
            { icon: ShoppingBag, label: 'Marketplace', color: 'amber' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.1 }} whileHover={{ scale: 1.1, y: -3 }}
              className={`flex items-center gap-2 px-4 py-2 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-full text-${item.color}-400 text-sm cursor-default`}>
              <item.icon size={16} />{item.label}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: 15, suffix: '+', label: 'Block Types', icon: Layers },
    { value: 5, suffix: '', label: 'Training Sections', icon: GraduationCap },
    { value: 6, suffix: '+', label: 'AI Content Types', icon: Brain },
    { value: 100, suffix: '%', label: 'Free to Start', icon: Heart },
  ]

  return (
    <section className="py-16 border-y border-slate-800 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <motion.div whileHover={{ scale: 1.05, y: -5 }} className="text-center">
                <stat.icon className="mx-auto text-teal-400 mb-3" size={32} />
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-slate-400">{stat.label}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: FileText, title: 'Interactive Runbooks', description: '15+ block types including code, checklists, diagrams, and more.', color: 'teal' },
    { icon: GraduationCap, title: 'Training Center', description: 'Create courses with organized sections. Auto-generate with AI.', color: 'purple', badge: 'NEW' },
    { icon: Library, title: 'Knowledge Base', description: 'Community-contributed runbooks. Submit, review, and share.', color: 'blue', badge: 'NEW' },
    { icon: Brain, title: 'AI-Powered Generation', description: 'Generate presentations, runbooks, quizzes instantly.', color: 'pink' },
    { icon: ShoppingBag, title: 'Marketplace', description: 'Buy and sell professional runbooks. Monetize your expertise.', color: 'amber' },
    { icon: Share2, title: 'Easy Sharing', description: 'Share via link, embed anywhere, collaborate in real-time.', color: 'emerald' },
  ]

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <ParallaxSection speed={-0.2} className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <ParallaxSection speed={0.3} className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <ScrollReveal direction="up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">One platform for documentation, training, and knowledge management</p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.1}>
              <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}
                className="relative p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-600 transition-all group">
                {feature.badge && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-[10px] font-bold text-white">
                    {feature.badge}
                  </motion.span>
                )}
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                  <feature.icon className={`text-${feature.color}-400`} size={24} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-teal-400 transition-colors">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            </ScrollReveal>
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
      <ParallaxSection speed={0.4} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <ScrollReveal direction="up" className="text-center mb-16">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
            <GraduationCap size={16} />Training Center
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Train Your Team Like Never Before</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Create structured courses with AI-generated content.</p>
        </ScrollReveal>

        <ScrollReveal direction="up" className="mb-16">
          <h3 className="text-center text-lg font-semibold text-slate-300 mb-6">Auto-Created Course Sections</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {sections.map((section, i) => (
              <ScrollReveal key={section.key} direction="scale" delay={i * 0.1}>
                <motion.div whileHover={{ scale: 1.1, y: -5, rotate: 2 }} className={`flex items-center gap-3 px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl hover:border-${section.color}-500/50 transition-all cursor-default`}>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className={`w-10 h-10 rounded-lg bg-${section.color}-500/20 flex items-center justify-center`}>
                    <section.icon className={`text-${section.color}-400`} size={20} />
                  </motion.div>
                  <div><p className="font-semibold text-white">{section.title}</p><p className="text-xs text-slate-500">{section.desc}</p></div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 border border-purple-500/20 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="text-white" size={24} />
              </motion.div>
              <div><h3 className="text-2xl font-bold">AI Content Generation</h3><p className="text-slate-400">Click a button, get professional content</p></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {aiTypes.map((type, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.05}>
                  <motion.div whileHover={{ scale: 1.1, y: -5 }} className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all cursor-default">
                    <motion.div whileHover={{ rotate: 15 }}><type.icon className="mx-auto text-purple-400 mb-2" size={28} /></motion.div>
                    <p className="font-medium text-sm">{type.label}</p><p className="text-xs text-slate-500">{type.desc}</p>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <p className="text-slate-400">Just enter a topic and difficulty level →</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-slate-700 cursor-pointer">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Sparkles className="text-purple-400" size={16} /></motion.div>
                <span className="text-white font-medium">Generate with AI</span>
              </motion.div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'DevOps Lead',
      company: 'TechScale Inc',
      avatar: '👩‍💻',
      content: 'RunbookForge transformed how we onboard new engineers. Our documentation is now interactive and actually gets used.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Senior DBA',
      company: 'DataFlow Systems',
      avatar: '👨‍💼',
      content: 'The AI generation feature saves me hours every week. I can create comprehensive training materials in minutes.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Training Manager',
      company: 'CloudFirst Academy',
      avatar: '👩‍🏫',
      content: 'The Training Center is exactly what we needed. Our students love the organized sections and progress tracking.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Platform Engineer',
      company: 'Startup Labs',
      avatar: '🧑‍💻',
      content: 'Finally, runbooks that people actually follow. The step-by-step execution mode is a game changer for incident response.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'IT Director',
      company: 'Enterprise Co',
      avatar: '👩‍💼',
      content: 'We reduced our incident resolution time by 40% after standardizing on RunbookForge across all teams.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'Solutions Architect',
      company: 'Cloud Dynamics',
      avatar: '👨‍🔬',
      content: 'The marketplace is brilliant. I now earn passive income from runbooks I created for my own projects.',
      rating: 5
    }
  ]

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <ParallaxSection speed={0.2} className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <ScrollReveal direction="up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Teams Worldwide</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">See what engineers and trainers are saying about RunbookForge</p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-full"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
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
      period: 'forever',
      description: 'Perfect for individuals getting started',
      color: 'slate',
      features: [
        '5 Runbooks',
        '1 Training Batch',
        'Basic block types',
        'Public sharing',
        'Community support'
      ],
      cta: 'Get Started',
      href: '/sign-up'
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For professionals and small teams',
      color: 'teal',
      popular: true,
      features: [
        'Unlimited Runbooks',
        'Unlimited Training Batches',
        'All block types',
        'AI Content Generation',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ],
      cta: 'Start Free Trial',
      href: '/sign-up?plan=pro'
    },
    {
      name: 'Team',
      price: '$49',
      period: '/month',
      description: 'For growing organizations',
      color: 'purple',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        'Team collaboration',
        'Knowledge Base access',
        'Marketplace selling',
        'SSO & SAML',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      href: '/contact'
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-900/50 to-transparent relative overflow-hidden">
      <ParallaxSection speed={0.3} className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <ScrollReveal direction="up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Start free, upgrade when you need more</p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative bg-slate-800/50 border rounded-2xl p-8 ${
                  plan.popular ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-300">
                      <Check size={18} className="text-teal-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={plan.href}
                    className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-purple-500/5" />
      <ParallaxSection speed={0.3} className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      <ParallaxSection speed={-0.2} className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <ScrollReveal direction="scale">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-3xl p-12 backdrop-blur-sm">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}><Rocket className="mx-auto text-teal-400 mb-6" size={56} /></motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Documentation?</h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">Join thousands of teams using RunbookForge to create better documentation and train their teams.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all">
                  Start Building Free<ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold hover:bg-slate-700 transition-all">Learn More</a>
              </motion.div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-16 border-t border-slate-800 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal direction="up">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                  <defs><linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#10b981"/></linearGradient></defs>
                  <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad3)"/>
                  <rect x="16" y="17" width="12" height="2" rx="1" fill="white"/>
                  <rect x="16" y="22" width="16" height="2" rx="1" fill="white"/>
                  <rect x="16" y="27" width="10" height="2" rx="1" fill="white"/>
                  <circle cx="33" cy="33" r="7" fill="white"/>
                  <path d="M30 33l2.5 2.5L36 31" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <div>
                  <span className="text-xl font-bold text-white">RunbookForge</span>
                  <p className="text-xs text-slate-500">a SUTA company</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                The all-in-one platform for technical documentation, training, and knowledge sharing.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors">
                  <Github size={20} />
                </a>
                <a href="mailto:hello@runbookforge.com" className="text-slate-400 hover:text-teal-400 transition-colors">
                  <Mail size={20} />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#training" className="text-slate-400 hover:text-white transition-colors">Training Center</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/marketplace" className="text-slate-400 hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/knowledge" className="text-slate-400 hover:text-white transition-colors">Knowledge Base</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2025 RunbookForge. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass { background: rgba(10, 15, 26, 0.8); backdrop-filter: blur(12px); }
        .gradient-text {
          background: linear-gradient(135deg, #14b8a6, #10b981, #8b5cf6, #14b8a6);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 5s ease infinite;
        }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
      
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TrainingSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}

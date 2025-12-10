'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Sparkles, Check, Loader2 } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setStatus('loading')
    
    // Simulate API call - replace with actual newsletter API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For now, just show success
    setStatus('success')
    setEmail('')
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900/50 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="max-w-xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Mail size={28} className="text-purple-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Stay in the Loop</h3>
          <p className="text-slate-400 mb-8">
            Get tips on documentation, training best practices, and product updates. No spam, unsubscribe anytime.
          </p>
          
          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 text-emerald-400 py-4"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check size={20} />
              </div>
              <span className="font-medium">You're subscribed! Check your inbox.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {status === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Subscribe
                  </>
                )}
              </motion.button>
            </form>
          )}
          
          <p className="text-xs text-slate-500 mt-4">
            Join 2,000+ professionals getting weekly insights
          </p>
        </motion.div>
      </div>
    </section>
  )
}


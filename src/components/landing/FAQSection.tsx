'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: "Is there a free plan?",
    answer: "Yes! Our free plan includes 5 runbooks, 1 training batch, and access to basic block types. It's free forever with no credit card required."
  },
  {
    question: "Can I export my content?",
    answer: "Absolutely. You can export your runbooks and presentations to PDF, Markdown, or PowerPoint format. Your data is always yours."
  },
  {
    question: "How does the AI content generation work?",
    answer: "Simply enter a topic and difficulty level, and our AI will generate professional content including presentations (up to 100 slides), quizzes, tutorials, and more. It uses advanced language models to create accurate, well-structured educational content."
  },
  {
    question: "Do you offer team plans?",
    answer: "Yes! Our Team plan starts at $49/month and includes up to 10 team members, team collaboration features, and access to our Knowledge Base and Marketplace."
  },
  {
    question: "Can students access training without an account?",
    answer: "Yes! Students only need to enter their email to access training. They don't need to create an account or remember passwords. Instructors can also share direct access links."
  },
  {
    question: "Is my data secure?",
    answer: "We take security seriously. All data is encrypted at rest and in transit. We use industry-standard authentication and never share your data with third parties."
  },
  {
    question: "Can I sell my runbooks?",
    answer: "Yes! With our Team plan, you can list your runbooks on the Marketplace and earn revenue from each sale. We handle payments and distribution."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Yes, we offer custom enterprise plans with SSO/SAML, dedicated support, custom branding, and on-premise deployment options. Contact our sales team for details."
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-sm mb-6">
            <HelpCircle size={16} />
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-slate-400">Everything you need to know about RunbookForge</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 hover:border-slate-700 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-white pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={20} className="text-slate-400" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


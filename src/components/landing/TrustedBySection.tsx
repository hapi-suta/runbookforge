'use client'

import { motion } from 'framer-motion'

const companies = [
  { name: 'TechScale', logo: '🏢' },
  { name: 'DataFlow', logo: '📊' },
  { name: 'CloudFirst', logo: '☁️' },
  { name: 'DevOps Pro', logo: '⚙️' },
  { name: 'StartupLabs', logo: '🚀' },
  { name: 'Enterprise Co', logo: '🏛️' },
]

export default function TrustedBySection() {
  return (
    <section className="py-12 border-b border-slate-800 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-500 text-sm mb-8 uppercase tracking-wider"
        >
          Trusted by teams at innovative companies
        </motion.p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {companies.map((company, i) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <span className="text-2xl">{company.logo}</span>
              <span className="font-semibold">{company.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


'use client'

import { motion } from "framer-motion";
import { Share2, Users, Mail, Link2, Shield, Eye, Edit, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

const upcomingFeatures = [
  {
    icon: Mail,
    title: 'Email Invitations',
    description: 'Invite team members via email to collaborate on runbooks',
    color: 'text-sky-400 bg-sky-500/20'
  },
  {
    icon: Link2,
    title: 'Share Links',
    description: 'Generate secure links to share runbooks with anyone',
    color: 'text-violet-400 bg-violet-500/20'
  },
  {
    icon: Shield,
    title: 'Permission Levels',
    description: 'Control who can view, edit, or manage your runbooks',
    color: 'text-amber-400 bg-amber-500/20'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get notified when shared runbooks are updated',
    color: 'text-emerald-400 bg-emerald-500/20'
  }
];

const permissionLevels = [
  { icon: Eye, name: 'Viewer', description: 'Can view the runbook', color: 'text-slate-400' },
  { icon: Edit, name: 'Editor', description: 'Can edit the runbook content', color: 'text-blue-400' },
  { icon: Shield, name: 'Admin', description: 'Can manage sharing settings', color: 'text-amber-400' }
];

export default function SharedPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Share2 className="text-emerald-400" />
          Shared with Me
        </h1>
        <p className="text-slate-400">
          Runbooks that have been shared with you by team members and collaborators.
        </p>
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Users size={36} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No shared runbooks yet</h3>
        <p className="text-slate-400 max-w-lg mx-auto mb-6">
          When team members share runbooks with you, they'll appear here. 
          You can also share your own runbooks to collaborate with others.
        </p>
        <Link
          href="/dashboard/runbooks"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-medium hover:from-teal-600 hover:to-emerald-600 transition-all"
        >
          View My Runbooks
          <ArrowRight size={18} />
        </Link>
      </motion.div>

      {/* Coming Soon Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-xs font-medium rounded-full">
            Coming Soon
          </span>
          <h2 className="text-lg font-semibold text-white">Collaboration Features</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                <feature.icon size={20} />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Permission Levels Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-slate-900 border border-slate-800 rounded-xl"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Permission Levels</h2>
        <p className="text-slate-400 text-sm mb-6">
          When sharing is enabled, you'll be able to control access with these permission levels:
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {permissionLevels.map((level) => (
            <div key={level.name} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
              <level.icon size={20} className={level.color} />
              <div>
                <h4 className="font-medium text-white">{level.name}</h4>
                <p className="text-sm text-slate-500">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Request Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Want sharing sooner?</h3>
        <p className="text-slate-400 mb-4">
          We're actively developing collaboration features. Let us know if you need them!
        </p>
        <a 
          href="mailto:hello@runbookforge.com?subject=Request: Sharing Features"
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium"
        >
          <Mail size={18} />
          Request Early Access
        </a>
      </motion.div>
    </div>
  );
}

'use client'

import { useUser, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Settings, User, Bell, Palette, CreditCard, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Settings className="text-slate-400" />
          Settings
        </h1>
        <p className="text-slate-400">
          Manage your account and preferences.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
            <User size={18} className="text-slate-400" />
            <span className="font-medium text-white">Profile</span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl text-white font-bold">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-slate-400">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-all">
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Plan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
            <CreditCard size={18} className="text-slate-400" />
            <span className="font-medium text-white">Plan</span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Free Plan</h3>
                <p className="text-slate-400 text-sm">5 runbooks, basic features</p>
              </div>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">Current</span>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-sm text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all">
              Upgrade to Pro
            </button>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
            <Palette size={18} className="text-slate-400" />
            <span className="font-medium text-white">Preferences</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Default Theme</h4>
                <p className="text-xs text-slate-500">Theme for new runbooks</p>
              </div>
              <select className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
                <option>Midnight</option>
                <option>Light</option>
                <option>GitHub</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                <p className="text-xs text-slate-500">Receive updates via email</p>
              </div>
              <button className="w-12 h-6 bg-teal-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-red-400 hover:text-red-300 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}

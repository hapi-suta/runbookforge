'use client'

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Settings, 
  Sparkles,
  BookOpen,
  Share2,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Runbooks', href: '/dashboard/runbooks', icon: FileText },
  { name: 'Create New', href: '/dashboard/create', icon: Plus },
  { name: 'AI Import', href: '/dashboard/import', icon: Sparkles },
  { name: 'Templates', href: '/dashboard/templates', icon: BookOpen },
  { name: 'Shared with Me', href: '/dashboard/shared', icon: Share2 },
];

const bottomNav = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-lg">
                🔧
              </div>
              <span className="text-lg font-bold text-white">RunbookForge</span>
            </Link>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                  {isActive && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-3 py-4 border-t border-slate-800">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            
            {/* User */}
            <div className="flex items-center gap-3 px-3 py-3 mt-3 rounded-lg bg-slate-800/50">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-slate-800 lg:px-8">
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/create"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20"
            >
              <Plus size={18} />
              New Runbook
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

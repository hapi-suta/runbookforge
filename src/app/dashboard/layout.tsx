'use client'

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Sparkles,
  BookOpen,
  Share2,
  ShoppingBag,
  Package,
  ChevronRight,
  Menu,
  X,
  Shield,
  Presentation,
  GraduationCap,
  Library,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Runbooks', href: '/dashboard/runbooks', icon: FileText },
  { name: 'My Documents', href: '/dashboard/documents', icon: Presentation },
  { name: 'AI Builder', href: '/dashboard/import', icon: Sparkles },
  { name: 'Training Center', href: '/dashboard/training', icon: GraduationCap },
  { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: Library },
  { name: 'Templates', href: '/dashboard/templates', icon: BookOpen },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
  { name: 'Purchases', href: '/dashboard/purchases', icon: Package },
  { name: 'Shared with Me', href: '/dashboard/shared', icon: Share2 },
];

const adminNav = [
  { name: 'Admin', href: '/dashboard/admin', icon: Shield },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setSidebarCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    if (user) checkAdmin();
  }, [user]);

  const fullNavigation = isAdmin ? [...navigation, ...adminNav] : navigation;

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
        fixed top-0 left-0 z-50 h-full bg-slate-900 border-r border-slate-800 
        transform transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-3 border-b border-slate-800">
            <Link href="/dashboard" className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <defs>
                  <linearGradient id="dashLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#dashLogo)"/>
                <path d="M14 12h20c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V14c0-1.1.9-2 2-2z" fill="white" fillOpacity="0.2"/>
                <rect x="16" y="17" width="12" height="2" rx="1" fill="white"/>
                <rect x="16" y="22" width="16" height="2" rx="1" fill="white"/>
                <rect x="16" y="27" width="10" height="2" rx="1" fill="white"/>
                <circle cx="33" cy="33" r="7" fill="white"/>
                <path d="M30 33l2.5 2.5L36 31" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <div className={`flex flex-col ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <span className="text-lg font-bold text-white leading-tight">RunbookForge</span>
                <span className="text-[10px] text-slate-500 tracking-wide">a SUTA company</span>
              </div>
            </Link>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {fullNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}
                    ${isActive 
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                  {isActive && !sidebarCollapsed && <ChevronRight size={16} className="ml-auto hidden lg:block" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-2 py-4 border-t border-slate-800">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}
                    ${isActive 
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                </Link>
              );
            })}
            
            {/* User */}
            <div className={`flex items-center gap-3 px-3 py-3 mt-3 rounded-lg bg-slate-800/50 ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
              <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
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
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-slate-800 lg:px-6">
          {/* Hamburger Menu Button */}
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-800/50 transition-colors group"
            onClick={() => {
              // Mobile: toggle sidebar open/close, Desktop: toggle collapse/expand
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(true);
              } else {
                toggleCollapse();
              }
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={24} className="text-slate-400 group-hover:text-teal-400 transition-colors" />
          </button>
          
          <div className="flex-1" />
          
          <div className="lg:hidden">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
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

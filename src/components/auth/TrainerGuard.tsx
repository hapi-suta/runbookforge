'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ShieldAlert, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TrainerGuardProps {
  children: ReactNode;
}

export default function TrainerGuard({ children }: TrainerGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/user/role');
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
          // Allow trainers and admins
          setIsAuthorized(data.role === 'trainer' || data.role === 'admin');
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setIsAuthorized(false);
      }
    };

    checkAccess();
  }, []);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert size={40} className="text-amber-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Access Restricted</h1>
          
          <p className="text-slate-400 mb-6">
            The Training Center is only available to authorized trainers and administrators.
            {userRole === 'student' && (
              <span className="block mt-2 text-slate-500">
                As a student, you can access your enrolled courses through the invitation links provided by your instructor.
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700 transition-all"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
            >
              <GraduationCap size={18} />
              Request Trainer Access
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Need trainer access? Contact your administrator or request access through settings.
          </p>
        </motion.div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}


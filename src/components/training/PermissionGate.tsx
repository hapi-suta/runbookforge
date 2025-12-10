'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Sparkles, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export type UserRole = 'student' | 'trainer' | 'admin';

export interface TrainerPermissions {
  role: UserRole;
  aiApproved: boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<TrainerPermissions>({
  role: 'trainer',
  aiApproved: true,
  isLoading: false,
});

export function usePermissions() {
  return useContext(PermissionsContext);
}

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [permissions, setPermissions] = useState<TrainerPermissions>({
    role: 'trainer',
    aiApproved: true,
    isLoading: true,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await fetch('/api/training/permissions');
        if (res.ok) {
          const data = await res.json();
          setPermissions({
            role: data.role || 'trainer',
            aiApproved: data.ai_approved !== false,
            isLoading: false,
          });
        } else {
          // Default to trainer with AI access if endpoint doesn't exist
          setPermissions({
            role: 'trainer',
            aiApproved: true,
            isLoading: false,
          });
        }
      } catch {
        // Default to trainer with AI access on error
        setPermissions({
          role: 'trainer',
          aiApproved: true,
          isLoading: false,
        });
      }
    };

    fetchPermissions();
  }, []);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}

interface AIGenerateButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AIGenerateButton({ onClick, className = '', size = 'md' }: AIGenerateButtonProps) {
  const { role, aiApproved, isLoading } = usePermissions();

  // Students cannot see AI Generate button
  if (role === 'student') {
    return null;
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
  };

  const iconSizes = { sm: 14, md: 16, lg: 18 };

  // Trainer without AI approval
  if (!aiApproved) {
    return (
      <motion.button
        disabled
        className={`
          flex items-center ${sizeClasses[size]} rounded-xl font-medium
          bg-slate-700/30 text-slate-500 cursor-not-allowed
          border border-slate-700/50 ${className}
        `}
        title="Awaiting AI access approval from admin"
      >
        <Lock size={iconSizes[size]} />
        <span>AI Generate</span>
        <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-md">
          Pending
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center ${sizeClasses[size]} rounded-xl font-medium
        bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400
        hover:from-purple-500/30 hover:to-pink-500/30
        border border-purple-500/30 transition-all ${className}
      `}
    >
      <Sparkles size={iconSizes[size]} />
      <span>AI Generate</span>
    </motion.button>
  );
}

interface PermissionGateProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requireAI?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  children, 
  requiredRole = 'trainer', 
  requireAI = false,
  fallback = null 
}: PermissionGateProps) {
  const { role, aiApproved, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    trainer: 1,
    admin: 2,
  };

  const hasRoleAccess = roleHierarchy[role] >= roleHierarchy[requiredRole];
  const hasAIAccess = !requireAI || aiApproved;

  if (!hasRoleAccess || !hasAIAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Helper component to show AI pending status
export function AIPendingBanner() {
  const { aiApproved, role } = usePermissions();

  if (role === 'student' || aiApproved) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-amber-400" />
      </div>
      <div>
        <h4 className="text-amber-400 font-medium">AI Features Pending Approval</h4>
        <p className="text-sm text-amber-400/70">
          Your account is awaiting admin approval to use AI generation features.
        </p>
      </div>
    </motion.div>
  );
}

export default PermissionGate;


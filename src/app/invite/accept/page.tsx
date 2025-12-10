'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, GraduationCap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InviteInfo {
  email: string;
  role: string;
  status: string;
  aiApproved: boolean;
}

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const token = searchParams.get('token');

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      checkInvite();
    } else {
      setError('No invitation token provided');
      setIsLoading(false);
    }
  }, [token]);

  const checkInvite = async () => {
    try {
      const res = await fetch(`/api/invite/accept?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setInviteInfo(data);
      } else {
        setError(data.error || 'Invalid invitation');
      }
    } catch (e) {
      setError('Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!token) return;
    setIsAccepting(true);
    setError(null);

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/training');
        }, 2000);
      } else {
        setError(data.error || 'Failed to accept invitation');
      }
    } catch (e) {
      setError('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Loader2 size={48} className="text-teal-400 animate-spin" />
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"
          >
            <CheckCircle size={40} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Aboard! 🎉</h1>
          <p className="text-slate-400 mb-4">
            You now have <span className="text-teal-400 font-semibold">{inviteInfo?.role}</span> access.
          </p>
          <p className="text-sm text-slate-500">Redirecting to Training Center...</p>
        </motion.div>
      </div>
    );
  }

  if (inviteInfo?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <XCircle size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation {inviteInfo?.status}</h1>
          <p className="text-slate-400 mb-6">
            This invitation has already been {inviteInfo?.status}. 
            {inviteInfo?.status === 'expired' && ' Please request a new invitation from your administrator.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            {inviteInfo?.role === 'admin' ? (
              <Shield size={36} className="text-white" />
            ) : (
              <GraduationCap size={36} className="text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're Invited!</h1>
          <p className="text-slate-400">
            Join RunbookForge as a <span className="text-teal-400 font-semibold">{inviteInfo?.role}</span>
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">As a {inviteInfo?.role}, you can:</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              Access the Training Center
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              Create and manage courses
            </li>
            {inviteInfo?.aiApproved && (
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-400" />
                Use AI content generation
              </li>
            )}
            {inviteInfo?.role === 'admin' && (
              <li className="flex items-center gap-2">
                <Shield size={14} className="text-amber-400" />
                Manage users and admins
              </li>
            )}
          </ul>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {isSignedIn ? (
          <motion.button
            onClick={acceptInvite}
            disabled={isAccepting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
          >
            {isAccepting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                Accept Invitation
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-slate-400 text-sm">
              Sign in or create an account to accept this invitation
            </p>
            <SignInButton mode="modal">
              <button className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25">
                Sign In to Accept
                <ArrowRight size={18} />
              </button>
            </SignInButton>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-4">
          Invitation for: {inviteInfo?.email}
        </p>
      </motion.div>
    </div>
  );
}


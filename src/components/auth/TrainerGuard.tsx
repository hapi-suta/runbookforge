'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldAlert, GraduationCap, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface TrainerGuardProps {
  children: ReactNode;
}

export default function TrainerGuard({ children }: TrainerGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const res = await fetch('/api/user/role');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        setIsAuthorized(data.role === 'trainer' || data.role === 'admin');
      } else {
        setIsAuthorized(false);
      }

      // Check if user has a pending request
      const reqRes = await fetch('/api/access-request');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        if (reqData) {
          setRequestStatus(reqData.status);
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setIsAuthorized(false);
    }
  };

  const submitRequest = async () => {
    setIsRequesting(true);
    try {
      const res = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (res.ok) {
        setRequestStatus('pending');
        setShowReasonInput(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request');
    } finally {
      setIsRequesting(false);
    }
  };

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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
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

          {/* Request Status */}
          {requestStatus === 'pending' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Clock size={18} />
                <span className="font-medium">Request Pending</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Your trainer access request is being reviewed by an administrator.
              </p>
            </div>
          )}

          {requestStatus === 'approved' && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle size={18} />
                <span className="font-medium">Access Approved!</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Refresh the page to access the Training Center.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm"
              >
                Refresh Page
              </button>
            </div>
          )}

          {requestStatus === 'rejected' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">
                Your previous request was not approved. Please contact the administrator for more information.
              </p>
            </div>
          )}

          {/* Request Access Form */}
          {!requestStatus && showReasonInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-left"
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Why do you need trainer access? (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="I need to create training materials for..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none text-sm"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowReasonInput(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRequest}
                  disabled={isRequesting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRequesting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Submit Request
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700 transition-all"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            
            {!requestStatus && !showReasonInput && (
              <button
                onClick={() => setShowReasonInput(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
              >
                <GraduationCap size={18} />
                Request Trainer Access
              </button>
            )}
          </div>

          {!requestStatus && (
            <p className="mt-8 text-sm text-slate-500">
              Need trainer access? Submit a request and an administrator will review it.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}

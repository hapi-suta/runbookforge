'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Eye, 
  Loader2,
  AlertCircle,
  Package,
  DollarSign,
  RefreshCw,
  Library,
  Users,
  UserPlus,
  Trash2,
  Mail,
  X,
  GraduationCap,
  Sparkles,
  UserCheck
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  price_personal: number;
  category: string;
  status: string;
  featured: boolean;
  created_at: string;
}

interface KBEntry {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  submitted_at: string;
  kb_categories?: { name: string };
  runbooks?: { title: string };
  documents?: { title: string };
}

interface Admin {
  id: string;
  email: string;
  name?: string;
  user_id?: string;
  is_active: boolean;
  created_at: string;
}

interface Trainer {
  id: string;
  user_id: string;
  role: string;
  ai_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'knowledge' | 'admins' | 'trainers'>('trainers');
  const [listings, setListings] = useState<Listing[]>([]);
  const [kbEntries, setKbEntries] = useState<KBEntry[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newTrainerUserId, setNewTrainerUserId] = useState('');
  const [newTrainerRole, setNewTrainerRole] = useState<'trainer' | 'admin'>('trainer');
  const [newTrainerAI, setNewTrainerAI] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'marketplace') fetchListings();
      if (activeTab === 'knowledge') fetchKBEntries();
      if (activeTab === 'trainers') fetchTrainers();
    }
  }, [isAdmin, activeTab, statusFilter]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/check');
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        setIsPrimaryAdmin(data.isPrimaryAdmin);
        setAdmins(data.admins || []);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchListings = async () => {
    try {
      const res = await fetch(`/api/admin/listings?status=${statusFilter}`);
      if (res.ok) setListings(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchKBEntries = async () => {
    try {
      const res = await fetch(`/api/knowledge/review?status=${statusFilter}`);
      if (res.ok) setKbEntries(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTrainers = async () => {
    try {
      const res = await fetch('/api/admin/trainers');
      if (res.ok) setTrainers(await res.json());
    } catch (e) { console.error(e); }
  };

  const addTrainer = async () => {
    if (!newTrainerUserId) return;
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetUserId: newTrainerUserId, 
          role: newTrainerRole,
          aiApproved: newTrainerAI
        })
      });
      if (res.ok) {
        setShowAddTrainer(false);
        setNewTrainerUserId('');
        setNewTrainerRole('trainer');
        setNewTrainerAI(true);
        fetchTrainers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add trainer');
      }
    } catch (e) { console.error(e); }
  };

  const updateTrainerRole = async (userId: string, role: string, aiApproved: boolean) => {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, role, aiApproved })
      });
      if (res.ok) fetchTrainers();
    } catch (e) { console.error(e); }
    finally { setProcessingId(null); }
  };

  const removeTrainer = async (userId: string) => {
    if (!confirm('Remove this user\'s trainer access?')) return;
    await updateTrainerRole(userId, 'user', false);
  };

  const handleListingAction = async (listingId: string, action: string, reason?: string) => {
    setProcessingId(listingId);
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, action, rejection_reason: reason })
      });
      if (res.ok) {
        fetchListings();
        alert(action === 'approve' ? 'Listing approved!' : 'Listing rejected');
      }
    } catch (e) { console.error(e); }
    finally { setProcessingId(null); }
  };

  const handleKBAction = async (entryId: string, action: string, reason?: string) => {
    setProcessingId(entryId);
    try {
      const res = await fetch('/api/knowledge/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, action, rejectionReason: reason })
      });
      if (res.ok) {
        fetchKBEntries();
        alert(action === 'approve' ? 'Entry approved!' : 'Entry rejected');
      }
    } catch (e) { console.error(e); }
    finally { setProcessingId(null); }
  };

  const addAdmin = async () => {
    if (!newAdminEmail) return;
    try {
      const res = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, name: newAdminName })
      });
      if (res.ok) {
        setShowAddAdmin(false);
        setNewAdminEmail('');
        setNewAdminName('');
        checkAdminStatus();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add admin');
      }
    } catch (e) { console.error(e); }
  };

  const removeAdmin = async (adminId: string) => {
    if (!confirm('Remove this admin?')) return;
    try {
      const res = await fetch(`/api/admin/check?id=${adminId}`, { method: 'DELETE' });
      if (res.ok) checkAdminStatus();
    } catch (e) { console.error(e); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield size={64} className="text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="text-purple-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Manage marketplace listings, knowledge base, and admins</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 rounded-lg p-1 w-fit flex-wrap">
        {[
          { id: 'trainers', label: 'Trainer Access', icon: GraduationCap },
          { id: 'marketplace', label: 'Marketplace', icon: Package },
          { id: 'knowledge', label: 'Knowledge Base', icon: Library },
          { id: 'admins', label: 'Manage Admins', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      {(activeTab === 'marketplace' || activeTab === 'knowledge') && (
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
          <button onClick={() => activeTab === 'marketplace' ? fetchListings() : fetchKBEntries()} className="ml-auto p-2 text-slate-400 hover:text-white">
            <RefreshCw size={18} />
          </button>
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {statusFilter} listings</p>
            </div>
          ) : (
            listings.map(listing => (
              <div key={listing.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{listing.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{listing.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><DollarSign size={12} />${listing.price_personal}</span>
                      <span>{listing.category}</span>
                      <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {listing.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleListingAction(listing.id, 'approve')}
                        disabled={processingId === listing.id}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm"
                      >
                        {processingId === listing.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason?');
                          if (reason) handleListingAction(listing.id, 'reject', reason);
                        }}
                        disabled={processingId === listing.id}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          {kbEntries.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Library size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {statusFilter} submissions</p>
            </div>
          ) : (
            kbEntries.map(entry => (
              <div key={entry.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{entry.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{entry.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{entry.kb_categories?.name || 'Uncategorized'}</span>
                      <span>{entry.runbooks?.title || entry.documents?.title}</span>
                      <span>{new Date(entry.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {entry.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleKBAction(entry.id, 'approve')}
                        disabled={processingId === entry.id}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm"
                      >
                        {processingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason?');
                          if (reason) handleKBAction(entry.id, 'reject', reason);
                        }}
                        disabled={processingId === entry.id}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trainers Tab */}
      {activeTab === 'trainers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-slate-400">{trainers.length} user(s) with elevated access</p>
              <p className="text-xs text-slate-500 mt-1">
                Trainers can access Training Center. Admins have full access.
              </p>
            </div>
            <button
              onClick={() => setShowAddTrainer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg"
            >
              <UserPlus size={18} />
              Add Trainer
            </button>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700 bg-slate-800/50 text-sm text-slate-400 font-medium">
              <span>User ID</span>
              <span>Role</span>
              <span>AI Access</span>
              <span>Actions</span>
            </div>
            
            {trainers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-400 mb-2">No Trainers Yet</p>
                <p className="text-sm">Add trainers to give them access to the Training Center</p>
              </div>
            ) : (
              trainers.map(trainer => (
                <div key={trainer.id} className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50 last:border-0 items-center">
                  <div>
                    <p className="text-white font-mono text-sm truncate" title={trainer.user_id}>
                      {trainer.user_id.slice(0, 20)}...
                    </p>
                    <p className="text-xs text-slate-500">
                      Added {new Date(trainer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <select
                      value={trainer.role}
                      onChange={(e) => updateTrainerRole(trainer.user_id, e.target.value, trainer.ai_approved)}
                      disabled={processingId === trainer.user_id}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                    >
                      <option value="user">User (No Access)</option>
                      <option value="student">Student</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <button
                      onClick={() => updateTrainerRole(trainer.user_id, trainer.role, !trainer.ai_approved)}
                      disabled={processingId === trainer.user_id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                        trainer.ai_approved 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Sparkles size={14} />
                      {trainer.ai_approved ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeTrainer(trainer.user_id)}
                      disabled={processingId === trainer.user_id}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                      title="Remove access"
                    >
                      {processingId === trainer.user_id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Role Permissions
            </h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li><span className="text-white font-medium">User:</span> Basic access - Runbooks, Documents, AI Builder</li>
              <li><span className="text-white font-medium">Student:</span> Same as User (accesses courses via invitation links)</li>
              <li><span className="text-white font-medium">Trainer:</span> + Training Center access (create/manage courses)</li>
              <li><span className="text-white font-medium">Admin:</span> + Admin dashboard, user management</li>
              <li><span className="text-white font-medium">AI Access:</span> Allows using AI generation features in Training Center</li>
            </ul>
          </div>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400">{admins.length} admin(s)</p>
            {isPrimaryAdmin && (
              <button
                onClick={() => setShowAddAdmin(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg"
              >
                <UserPlus size={18} />
                Add Admin
              </button>
            )}
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <p className="text-sm text-slate-400">Primary Admin (from environment)</p>
              <p className="text-white font-medium">You</p>
            </div>
            {admins.map(admin => (
              <div key={admin.id} className="p-4 border-b border-slate-700/50 last:border-0 flex items-center justify-between">
                <div>
                  <p className="text-white">{admin.name || admin.email}</p>
                  <p className="text-sm text-slate-400">{admin.email}</p>
                </div>
                {isPrimaryAdmin && (
                  <button onClick={() => removeAdmin(admin.id)} className="p-2 text-slate-400 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {admins.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p>No additional admins added</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Trainer Modal */}
      <AnimatePresence>
        {showAddTrainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddTrainer(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap className="text-teal-400" />
                  Add Trainer Access
                </h2>
                <button onClick={() => setShowAddTrainer(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Clerk User ID *</label>
                  <input
                    type="text"
                    value={newTrainerUserId}
                    onChange={(e) => setNewTrainerUserId(e.target.value)}
                    placeholder="user_2abc123..."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Find this in Clerk Dashboard → Users → Click user → Copy User ID
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <select
                    value={newTrainerRole}
                    onChange={(e) => setNewTrainerRole(e.target.value as 'trainer' | 'admin')}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="trainer">Trainer (Training Center only)</option>
                    <option value="admin">Admin (Full access)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-400" />
                      Enable AI Generation
                    </p>
                    <p className="text-xs text-slate-500">Allow using AI to create content</p>
                  </div>
                  <button
                    onClick={() => setNewTrainerAI(!newTrainerAI)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      newTrainerAI ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      newTrainerAI ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowAddTrainer(false)} 
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={addTrainer} 
                  disabled={!newTrainerUserId} 
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg disabled:opacity-50"
                >
                  Add Trainer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddAdmin(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Admin</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Admin name"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddAdmin(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg">Cancel</button>
                <button onClick={addAdmin} disabled={!newAdminEmail} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg disabled:opacity-50">Add Admin</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

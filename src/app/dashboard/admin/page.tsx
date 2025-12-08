'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  RefreshCw
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
  runbooks?: {
    sections: any[];
  };
}

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/listings?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (listingId: string, action: string, rejectionReason?: string) => {
    setProcessingId(listingId);
    try {
      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          action,
          rejection_reason: rejectionReason
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchListings();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Shield className="text-amber-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400">
          Manage marketplace listings and approvals
        </p>
      </motion.div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === status
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {status === 'pending' && <Clock size={18} />}
            {status === 'approved' && <CheckCircle size={18} />}
            {status === 'rejected' && <XCircle size={18} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <button
          onClick={fetchListings}
          className="ml-auto flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-white"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-amber-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <Package size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No {statusFilter} listings</h3>
          <p className="text-slate-400">
            {statusFilter === 'pending' 
              ? 'No listings waiting for review.' 
              : `No ${statusFilter} listings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white truncate">{listing.title}</h3>
                    {listing.featured && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded flex items-center gap-1">
                        <Star size={12} /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{listing.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-500 bg-slate-800 px-2 py-1 rounded">{listing.category}</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatPrice(listing.price_personal)}
                    </span>
                    <span className="text-slate-500">
                      {listing.runbooks?.sections?.length || 0} sections
                    </span>
                    <span className="text-slate-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                  {statusFilter === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(listing.id, 'approve')}
                        disabled={processingId === listing.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        {processingId === listing.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) handleAction(listing.id, 'reject', reason);
                        }}
                        disabled={processingId === listing.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {statusFilter === 'approved' && (
                    <>
                      <button
                        onClick={() => handleAction(listing.id, listing.featured ? 'unfeature' : 'feature')}
                        disabled={processingId === listing.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                          listing.featured 
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        }`}
                      >
                        <Star size={16} />
                        {listing.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

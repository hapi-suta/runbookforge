'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Download, 
  Star, 
  ExternalLink,
  Loader2,
  Package,
  Calendar,
  CreditCard
} from "lucide-react";
import Link from "next/link";

interface Purchase {
  id: string;
  listing_id: string;
  runbook_id: string;
  license_type: string;
  amount_paid: number;
  created_at: string;
  marketplace_listings: {
    id: string;
    title: string;
    description: string;
    category: string;
    creator_id: string;
  };
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/marketplace/purchase');
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Package className="text-violet-400" />
          My Purchases
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Access runbooks you've purchased from the marketplace
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-violet-500 animate-spin" />
        </div>
      ) : purchases.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <ShoppingBag size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No purchases yet</h3>
          <p className="text-slate-400 mb-6">
            Browse the marketplace to find professional runbooks from experts.
          </p>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 rounded-lg text-white font-medium hover:bg-violet-600 transition-colors"
          >
            <ShoppingBag size={18} />
            Browse Marketplace
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {purchases.map((purchase, i) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {purchase.marketplace_listings?.title || 'Untitled Runbook'}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                      purchase.license_type === 'personal' ? 'bg-slate-700 text-slate-300' :
                      purchase.license_type === 'team' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-violet-500/20 text-violet-400'
                    }`}>
                      {purchase.license_type.charAt(0).toUpperCase() + purchase.license_type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1 mb-2">
                    {purchase.marketplace_listings?.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Purchased {formatDate(purchase.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={12} />
                      {formatPrice(purchase.amount_paid)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded">
                      {purchase.marketplace_listings?.category || 'Other'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-shrink-0">
                  <Link
                    href={`/dashboard/runbooks/${purchase.runbook_id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>View</span>
                  </Link>
                  <button
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-colors"
                  >
                    <Star size={16} />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

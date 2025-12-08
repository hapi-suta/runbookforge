'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search,
  Eye,
  ShoppingCart,
  Star,
  TrendingUp,
  DollarSign,
  Package,
  CreditCard,
  ExternalLink,
  BarChart3,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Loader2,
  Filter,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Listing {
  id: string;
  runbook_id: string;
  creator_id: string;
  title: string;
  description: string;
  price_personal: number;
  price_team: number;
  price_enterprise: number;
  category: string;
  tags: string[];
  status: string;
  sales_count: number;
  rating: string | null;
  rating_count: number;
  featured: boolean;
  created_at: string;
  runbooks?: {
    sections: any[];
  };
}

interface CreatorStats {
  totalEarnings: number;
  pendingBalance: number;
  totalSales: number;
  activeListings: number;
  avgRating: string | null;
  thisMonthEarnings: number;
  thisMonthSales: number;
}

interface CreatorData {
  account: any;
  stats: CreatorStats;
  listings: Listing[];
  recentSales: any[];
  payouts: any[];
}

const categories = ['All', 'Database', 'DevOps', 'Cloud', 'Security', 'Operations', 'Networking', 'Other'];

export default function MarketplacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'browse' | 'creator'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedLicense, setSelectedLicense] = useState('personal');
  
  // Data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [isLoadingCreator, setIsLoadingCreator] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSettingUpStripe, setIsSettingUpStripe] = useState(false);

  // Fetch marketplace listings
  useEffect(() => {
    fetchListings();
    fetchFeaturedListings();
  }, [selectedCategory, sortBy, searchQuery]);

  // Fetch creator data when switching to creator tab
  useEffect(() => {
    if (activeTab === 'creator') {
      fetchCreatorData();
    }
  }, [activeTab]);

  const fetchListings = async () => {
    setIsLoadingListings(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sort', sortBy);

      const response = await fetch(`/api/marketplace/listings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const fetchFeaturedListings = async () => {
    try {
      const response = await fetch('/api/marketplace/listings?featured=true');
      if (response.ok) {
        const data = await response.json();
        setFeaturedListings(data);
      }
    } catch (error) {
      console.error('Error fetching featured:', error);
    }
  };

  const fetchCreatorData = async () => {
    setIsLoadingCreator(true);
    try {
      const response = await fetch('/api/creator');
      if (response.ok) {
        const data = await response.json();
        setCreatorData(data);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setIsLoadingCreator(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedListing) return;
    
    setIsPurchasing(true);
    try {
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedListing.id,
          license_type: selectedLicense
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setSelectedListing(null);
        if (data.runbook_id) {
          router.push(`/dashboard/runbooks/${data.runbook_id}`);
        }
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSetupStripe = async () => {
    setIsSettingUpStripe(true);
    try {
      const response = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup_stripe' })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchCreatorData();
      } else {
        alert(data.error || 'Failed to setup Stripe');
      }
    } catch (error) {
      console.error('Stripe setup error:', error);
      alert('Failed to setup Stripe');
    } finally {
      setIsSettingUpStripe(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getSelectedPrice = () => {
    if (!selectedListing) return 0;
    switch (selectedLicense) {
      case 'team': return selectedListing.price_team;
      case 'enterprise': return selectedListing.price_enterprise;
      default: return selectedListing.price_personal;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <ShoppingBag className="text-violet-400" />
          Marketplace
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Buy professional runbooks or sell your own creations
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 mb-6 border-b border-slate-800 overflow-x-auto"
      >
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'browse'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart size={18} />
          Browse & Buy
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'creator'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp size={18} />
          Creator Hub
        </button>
      </motion.div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search marketplace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="hidden sm:block px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="sm:hidden overflow-hidden"
                >
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 mb-3"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoadingListings && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-violet-500 animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!isLoadingListings && listings.length === 0 && (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <ShoppingBag size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No listings yet</h3>
              <p className="text-slate-400 mb-6">Be the first to sell a runbook on the marketplace!</p>
              <Link
                href="/dashboard/runbooks"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 rounded-lg text-white font-medium hover:bg-violet-600 transition-colors"
              >
                <Plus size={18} />
                Create a Runbook to Sell
              </Link>
            </div>
          )}

          {/* Featured Section */}
          {!isLoadingListings && featuredListings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={18} className="text-amber-400" />
                Featured Runbooks
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {featuredListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group p-4 sm:p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl hover:border-violet-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                        ⭐ Featured
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-white">
                        {formatPrice(listing.price_personal)}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{listing.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{listing.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      {listing.rating && (
                        <span className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          {listing.rating} ({listing.rating_count})
                        </span>
                      )}
                      <span>{listing.sales_count} sales</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button 
                        onClick={() => { setSelectedListing(listing); setSelectedLicense('personal'); }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-sm text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
                      >
                        <ShoppingCart size={16} />
                        Buy
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Listings */}
          {!isLoadingListings && listings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                All Runbooks ({listings.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{listing.category}</span>
                      <span className="text-lg font-bold text-white">
                        {formatPrice(listing.price_personal)}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2 line-clamp-1">{listing.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{listing.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {listing.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      {listing.rating ? (
                        <span className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          {listing.rating}
                        </span>
                      ) : (
                        <span className="text-slate-600">No ratings</span>
                      )}
                      <span>{listing.sales_count} sales</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedListing(listing); setSelectedLicense('personal'); }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-sm text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
                      >
                        <ShoppingCart size={16} />
                        Buy
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Creator Hub Tab */}
      {activeTab === 'creator' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {isLoadingCreator ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-violet-500 animate-spin" />
            </div>
          ) : !creatorData?.account?.payouts_enabled ? (
            /* Creator Onboarding */
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                <DollarSign size={36} className="text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Start Selling Your Runbooks</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Turn your technical expertise into income. Create professional runbooks and sell them to engineers worldwide. You keep 70% of every sale.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <Package size={20} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Create</h3>
                  <p className="text-sm text-slate-400">Build runbooks using our editor or AI tools</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                    <ShoppingBag size={20} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">List</h3>
                  <p className="text-sm text-slate-400">Set your price and submit for review</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <Wallet size={20} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Earn</h3>
                  <p className="text-sm text-slate-400">Get paid monthly via Stripe</p>
                </div>
              </div>
              <button
                onClick={handleSetupStripe}
                disabled={isSettingUpStripe}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {isSettingUpStripe ? (
                  <>
                    <Loader2 size={18} className="inline mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Stripe & Start Selling'
                )}
              </button>
            </div>
          ) : (
            /* Creator Dashboard */
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <DollarSign size={16} />
                    <span className="text-xs sm:text-sm">Total Earnings</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {formatPrice(creatorData.stats.totalEarnings)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    +{formatPrice(creatorData.stats.thisMonthEarnings)} this month
                  </p>
                </div>
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Wallet size={16} />
                    <span className="text-xs sm:text-sm">Pending Payout</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {formatPrice(creatorData.stats.pendingBalance)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Next payout: Jan 15</p>
                </div>
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <BarChart3 size={16} />
                    <span className="text-xs sm:text-sm">Total Sales</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{creatorData.stats.totalSales}</p>
                  <p className="text-xs text-emerald-400 mt-1">
                    +{creatorData.stats.thisMonthSales} this month
                  </p>
                </div>
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Star size={16} />
                    <span className="text-xs sm:text-sm">Avg Rating</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {creatorData.stats.avgRating || 'N/A'}
                  </p>
                  {creatorData.stats.avgRating && (
                    <p className="text-xs text-amber-400 mt-1">⭐ Excellent</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/runbooks"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
                >
                  <Plus size={18} />
                  Create New Runbook to Sell
                </Link>
              </div>

              {/* My Listings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-800">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package size={20} />
                    My Listings ({creatorData.listings.length})
                  </h2>
                </div>
                {creatorData.listings.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-400 mb-4">You haven't listed any runbooks yet.</p>
                    <Link
                      href="/dashboard/runbooks"
                      className="text-violet-400 hover:text-violet-300"
                    >
                      Go to My Runbooks to list one →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {creatorData.listings.map((listing) => (
                      <div key={listing.id} className="p-4 sm:p-5 hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white truncate">{listing.title}</h3>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                                listing.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                listing.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {listing.status === 'approved' && <CheckCircle size={12} className="inline mr-1" />}
                                {listing.status === 'pending' && <Clock size={12} className="inline mr-1" />}
                                {listing.status === 'rejected' && <XCircle size={12} className="inline mr-1" />}
                                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                              <span>{formatPrice(listing.price_personal)}</span>
                              <span>{listing.sales_count} sales</span>
                              {listing.rating && (
                                <span className="flex items-center gap-1">
                                  <Star size={12} className="text-amber-400 fill-amber-400" />
                                  {listing.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Sales */}
              {creatorData.recentSales.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp size={20} />
                      Recent Sales
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                          <th className="px-4 sm:px-5 py-3 font-medium">Runbook</th>
                          <th className="px-4 sm:px-5 py-3 font-medium">License</th>
                          <th className="px-4 sm:px-5 py-3 font-medium text-right">Amount</th>
                          <th className="px-4 sm:px-5 py-3 font-medium text-right">Your Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {creatorData.recentSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 sm:px-5 py-4">
                              <p className="text-white text-sm truncate max-w-[200px]">
                                {sale.marketplace_listings?.title || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(sale.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-4 sm:px-5 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                sale.license_type === 'personal' ? 'bg-slate-700 text-slate-300' :
                                sale.license_type === 'team' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-violet-500/20 text-violet-400'
                              }`}>
                                {sale.license_type.charAt(0).toUpperCase() + sale.license_type.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 sm:px-5 py-4 text-right text-sm text-white">
                              {formatPrice(sale.amount_paid)}
                            </td>
                            <td className="px-4 sm:px-5 py-4 text-right text-sm text-emerald-400 font-medium">
                              +{formatPrice(sale.creator_payout)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Purchase Preview Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedListing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">{selectedListing.title}</h2>
                    <p className="text-sm text-slate-400">{selectedListing.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
                <p className="text-slate-300 mb-4">{selectedListing.description}</p>
                
                <div className="flex items-center gap-4 mb-6 text-sm">
                  {selectedListing.rating && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={16} className="fill-amber-400" />
                      {selectedListing.rating} ({selectedListing.rating_count} reviews)
                    </span>
                  )}
                  <span className="text-slate-400">{selectedListing.sales_count} sales</span>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Select License</h3>
                  <label className={`flex items-center justify-between p-4 bg-slate-800/50 border rounded-xl cursor-pointer transition-colors ${
                    selectedLicense === 'personal' ? 'border-violet-500' : 'border-slate-700 hover:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="license" 
                        checked={selectedLicense === 'personal'}
                        onChange={() => setSelectedLicense('personal')}
                        className="w-4 h-4 text-violet-500" 
                      />
                      <div>
                        <p className="font-medium text-white">Personal License</p>
                        <p className="text-sm text-slate-400">Single user, personal use</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{formatPrice(selectedListing.price_personal)}</span>
                  </label>
                  <label className={`flex items-center justify-between p-4 bg-slate-800/50 border rounded-xl cursor-pointer transition-colors ${
                    selectedLicense === 'team' ? 'border-violet-500' : 'border-slate-700 hover:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="license"
                        checked={selectedLicense === 'team'}
                        onChange={() => setSelectedLicense('team')}
                        className="w-4 h-4 text-violet-500" 
                      />
                      <div>
                        <p className="font-medium text-white">Team License</p>
                        <p className="text-sm text-slate-400">Up to 20 users, editing allowed</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{formatPrice(selectedListing.price_team)}</span>
                  </label>
                  <label className={`flex items-center justify-between p-4 bg-slate-800/50 border rounded-xl cursor-pointer transition-colors ${
                    selectedLicense === 'enterprise' ? 'border-violet-500' : 'border-slate-700 hover:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="license"
                        checked={selectedLicense === 'enterprise'}
                        onChange={() => setSelectedLicense('enterprise')}
                        className="w-4 h-4 text-violet-500" 
                      />
                      <div>
                        <p className="font-medium text-white">Enterprise License</p>
                        <p className="text-sm text-slate-400">Unlimited users, lifetime updates</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{formatPrice(selectedListing.price_enterprise)}</span>
                  </label>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <h4 className="font-medium text-emerald-400 mb-2">What's included:</h4>
                  <ul className="space-y-1 text-sm text-emerald-300">
                    <li>✓ Permanent access to runbook</li>
                    <li>✓ PDF & HTML export</li>
                    <li>✓ Run mode execution</li>
                    <li>✓ 1 year of updates</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-800/50">
                <button 
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Complete Purchase - {formatPrice(getSelectedPrice())}
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  🔒 Secured by Stripe • 7-day money-back guarantee
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Filter,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

// Sample marketplace listings
const sampleListings = [
  {
    id: '1',
    title: 'PostgreSQL HA with Patroni',
    description: 'Enterprise-grade high availability PostgreSQL cluster setup',
    creator: 'James Smith',
    creatorAvatar: 'JS',
    price: 2500,
    rating: 4.9,
    reviewCount: 47,
    salesCount: 152,
    category: 'Database',
    tags: ['PostgreSQL', 'Patroni', 'HA'],
    featured: true
  },
  {
    id: '2',
    title: 'Kubernetes Production Setup',
    description: 'Complete K8s cluster deployment with monitoring and logging',
    creator: 'DevOps Pro',
    creatorAvatar: 'DP',
    price: 3500,
    rating: 4.7,
    reviewCount: 23,
    salesCount: 89,
    category: 'DevOps',
    tags: ['Kubernetes', 'Docker', 'Helm'],
    featured: true
  },
  {
    id: '3',
    title: 'AWS Landing Zone',
    description: 'Multi-account AWS setup with security best practices',
    creator: 'Cloud Expert',
    creatorAvatar: 'CE',
    price: 4500,
    rating: 4.8,
    reviewCount: 89,
    salesCount: 234,
    category: 'Cloud',
    tags: ['AWS', 'Terraform', 'Security'],
    featured: false
  },
  {
    id: '4',
    title: 'CI/CD Pipeline with GitHub Actions',
    description: 'Production-ready CI/CD pipeline with testing and deployment',
    creator: 'Pipeline Master',
    creatorAvatar: 'PM',
    price: 1500,
    rating: 4.6,
    reviewCount: 56,
    salesCount: 178,
    category: 'DevOps',
    tags: ['GitHub Actions', 'CI/CD', 'Docker'],
    featured: false
  },
  {
    id: '5',
    title: 'Incident Response Playbook',
    description: 'Structured approach to handling production incidents',
    creator: 'SRE Team',
    creatorAvatar: 'ST',
    price: 2000,
    rating: 4.9,
    reviewCount: 34,
    salesCount: 112,
    category: 'Operations',
    tags: ['Incident', 'On-Call', 'SRE'],
    featured: false
  }
];

// Sample creator data
const creatorStats = {
  totalEarnings: 12450,
  pendingPayout: 2340,
  totalSales: 156,
  activeListings: 4,
  avgRating: 4.8
};

const creatorListings = [
  {
    id: '1',
    title: 'PostgreSQL HA with Patroni',
    status: 'approved',
    price: 2500,
    sales: 152,
    earnings: 10640,
    rating: 4.9,
    createdAt: '2024-10-15'
  },
  {
    id: '2',
    title: 'pgBackRest Backup Guide',
    status: 'pending',
    price: 1500,
    sales: 0,
    earnings: 0,
    rating: null,
    createdAt: '2024-12-01'
  },
  {
    id: '3',
    title: 'Database Migration Runbook',
    status: 'approved',
    price: 2000,
    sales: 4,
    earnings: 560,
    rating: 5.0,
    createdAt: '2024-11-20'
  }
];

const recentSales = [
  { id: '1', runbook: 'PostgreSQL HA with Patroni', buyer: 'john@company.com', amount: 2500, date: '2024-12-06', license: 'Personal' },
  { id: '2', runbook: 'PostgreSQL HA with Patroni', buyer: 'team@startup.io', amount: 7500, date: '2024-12-05', license: 'Team' },
  { id: '3', runbook: 'Database Migration Runbook', buyer: 'dev@corp.com', amount: 2000, date: '2024-12-04', license: 'Personal' },
];

const categories = ['All', 'Database', 'DevOps', 'Cloud', 'Security', 'Operations'];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'creator'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<typeof sampleListings[0] | null>(null);
  const [isCreatorSetup, setIsCreatorSetup] = useState(true); // Assume setup for demo

  const filteredListings = sampleListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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

          {/* Featured Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-400" />
              Featured Runbooks
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredListings.filter(l => l.featured).map((listing) => (
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
                      {formatPrice(listing.price)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{listing.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      {listing.rating} ({listing.reviewCount})
                    </span>
                    <span>{listing.salesCount} sales</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-sm text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all">
                      <ShoppingCart size={16} />
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* All Listings */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              All Runbooks ({filteredListings.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {listing.creatorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{listing.creator}</p>
                      <p className="text-xs text-slate-500">{listing.category}</p>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {formatPrice(listing.price)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {listing.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      {listing.rating}
                    </span>
                    <span>{listing.salesCount} sales</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-sm text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all">
                      <ShoppingCart size={16} />
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Creator Hub Tab */}
      {activeTab === 'creator' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {!isCreatorSetup ? (
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
                onClick={() => setIsCreatorSetup(true)}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                Connect Stripe & Start Selling
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
                  <p className="text-xl sm:text-2xl font-bold text-white">${(creatorStats.totalEarnings / 100).toFixed(2)}</p>
                  <p className="text-xs text-emerald-400 mt-1">+$234 this month</p>
                </div>
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Wallet size={16} />
                    <span className="text-xs sm:text-sm">Pending Payout</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">${(creatorStats.pendingPayout / 100).toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">Next payout: Jan 15</p>
                </div>
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <BarChart3 size={16} />
                    <span className="text-xs sm:text-sm">Total Sales</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{creatorStats.totalSales}</p>
                  <p className="text-xs text-emerald-400 mt-1">+12 this month</p>
                </div>
                <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Star size={16} />
                    <span className="text-xs sm:text-sm">Avg Rating</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{creatorStats.avgRating}</p>
                  <p className="text-xs text-amber-400 mt-1">⭐ Excellent</p>
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
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-700 transition-colors">
                  <CreditCard size={18} />
                  Manage Payouts
                </button>
              </div>

              {/* My Listings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-800">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package size={20} />
                    My Listings
                  </h2>
                </div>
                <div className="divide-y divide-slate-800">
                  {creatorListings.map((listing) => (
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
                            <span>{formatPrice(listing.price)}</span>
                            <span>{listing.sales} sales</span>
                            <span>${(listing.earnings / 100).toFixed(2)} earned</span>
                            {listing.rating && (
                              <span className="flex items-center gap-1">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                {listing.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sales */}
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
                        <th className="px-4 sm:px-5 py-3 font-medium">Buyer</th>
                        <th className="px-4 sm:px-5 py-3 font-medium">License</th>
                        <th className="px-4 sm:px-5 py-3 font-medium text-right">Amount</th>
                        <th className="px-4 sm:px-5 py-3 font-medium text-right">Your Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {recentSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 sm:px-5 py-4">
                            <p className="text-white text-sm truncate max-w-[200px]">{sale.runbook}</p>
                            <p className="text-xs text-slate-500">{sale.date}</p>
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-sm text-slate-400 truncate max-w-[150px]">
                            {sale.buyer}
                          </td>
                          <td className="px-4 sm:px-5 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              sale.license === 'Personal' ? 'bg-slate-700 text-slate-300' :
                              sale.license === 'Team' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-violet-500/20 text-violet-400'
                            }`}>
                              {sale.license}
                            </span>
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-right text-sm text-white">
                            {formatPrice(sale.amount)}
                          </td>
                          <td className="px-4 sm:px-5 py-4 text-right text-sm text-emerald-400 font-medium">
                            +{formatPrice(sale.amount * 0.7)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payout Info */}
              <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-1">Payout Settings</h3>
                    <p className="text-sm text-slate-400">Connected to Stripe • Bank account ending in 4242</p>
                  </div>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors">
                    <ExternalLink size={16} />
                    Stripe Dashboard
                  </button>
                </div>
              </div>
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
                    <p className="text-sm text-slate-400">by {selectedListing.creator}</p>
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
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    {selectedListing.rating} ({selectedListing.reviewCount} reviews)
                  </span>
                  <span className="text-slate-400">{selectedListing.salesCount} sales</span>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Select License</h3>
                  <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:border-violet-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="license" defaultChecked className="w-4 h-4 text-violet-500" />
                      <div>
                        <p className="font-medium text-white">Personal License</p>
                        <p className="text-sm text-slate-400">Single user, personal use</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{formatPrice(selectedListing.price)}</span>
                  </label>
                  <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:border-violet-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="license" className="w-4 h-4 text-violet-500" />
                      <div>
                        <p className="font-medium text-white">Team License</p>
                        <p className="text-sm text-slate-400">Up to 20 users, editing allowed</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{formatPrice(selectedListing.price * 3)}</span>
                  </label>
                  <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:border-violet-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="license" className="w-4 h-4 text-violet-500" />
                      <div>
                        <p className="font-medium text-white">Enterprise License</p>
                        <p className="text-sm text-slate-400">Unlimited users, lifetime updates</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{formatPrice(selectedListing.price * 10)}</span>
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
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all">
                  <ShoppingCart size={18} />
                  Complete Purchase - {formatPrice(selectedListing.price)}
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

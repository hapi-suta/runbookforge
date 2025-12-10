'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Circle, Lock, ChevronRight, Trophy, Clock, Target,
  Play, BookOpen, Star, Zap, Flag, ArrowRight
} from 'lucide-react';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  module_ids: string[];
  status: 'completed' | 'in_progress' | 'locked' | 'available';
  progress: number; // 0-100
  estimated_minutes: number;
  badge_icon?: string;
  order: number;
}

export interface LearningPathData {
  id: string;
  title: string;
  description?: string;
  milestones: Milestone[];
  overall_progress: number;
  total_modules: number;
  completed_modules: number;
  estimated_total_minutes: number;
  time_spent_minutes: number;
}

interface LearningPathProps {
  data: LearningPathData;
  onMilestoneClick?: (milestone: Milestone) => void;
  variant?: 'horizontal' | 'vertical';
}

export default function LearningPath({ 
  data, 
  onMilestoneClick,
  variant = 'horizontal' 
}: LearningPathProps) {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={24} className="text-emerald-400" />;
      case 'in_progress': return <Play size={24} className="text-purple-400" />;
      case 'locked': return <Lock size={20} className="text-slate-500" />;
      default: return <Circle size={24} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'from-emerald-500 to-teal-500';
      case 'in_progress': return 'from-purple-500 to-pink-500';
      case 'locked': return 'from-slate-600 to-slate-700';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getRingColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'ring-emerald-500/50';
      case 'in_progress': return 'ring-purple-500/50';
      case 'locked': return 'ring-slate-600/50';
      default: return 'ring-slate-500/50';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const currentMilestone = data.milestones.find(m => m.status === 'in_progress');
  const remainingTime = data.estimated_total_minutes - data.time_spent_minutes;

  if (variant === 'vertical') {
    return (
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="text-purple-400" size={24} />
              {data.title}
            </h3>
            <span className="text-2xl font-bold text-white">{Math.round(data.overall_progress)}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.overall_progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-800/50 rounded-xl">
              <div className="text-lg font-bold text-white">{data.completed_modules}/{data.total_modules}</div>
              <div className="text-xs text-slate-500">Modules</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl">
              <div className="text-lg font-bold text-white">{data.milestones.filter(m => m.status === 'completed').length}/{data.milestones.length}</div>
              <div className="text-xs text-slate-500">Milestones</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl">
              <div className="text-lg font-bold text-white">{formatTime(remainingTime)}</div>
              <div className="text-xs text-slate-500">Remaining</div>
            </div>
          </div>
        </div>

        {/* Vertical Path */}
        <div className="relative pl-8">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
          
          {data.milestones.map((milestone, idx) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative mb-6 last:mb-0"
            >
              {/* Node */}
              <div className={`absolute -left-4 w-8 h-8 rounded-full bg-gradient-to-br ${getStatusColor(milestone.status)} flex items-center justify-center ring-4 ${getRingColor(milestone.status)} ring-offset-2 ring-offset-slate-900`}>
                {milestone.status === 'completed' ? (
                  <CheckCircle size={16} className="text-white" />
                ) : milestone.status === 'in_progress' ? (
                  <Play size={14} className="text-white" />
                ) : milestone.status === 'locked' ? (
                  <Lock size={14} className="text-white" />
                ) : (
                  <Circle size={14} className="text-white" />
                )}
              </div>

              {/* Card */}
              <motion.div
                whileHover={{ scale: milestone.status !== 'locked' ? 1.02 : 1 }}
                onClick={() => milestone.status !== 'locked' && onMilestoneClick?.(milestone)}
                className={`ml-6 p-4 rounded-xl border transition-all ${
                  milestone.status === 'locked'
                    ? 'bg-slate-800/30 border-slate-700/30 opacity-60 cursor-not-allowed'
                    : milestone.status === 'in_progress'
                    ? 'bg-purple-500/10 border-purple-500/30 cursor-pointer'
                    : milestone.status === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500/30 cursor-pointer'
                    : 'bg-slate-800/50 border-slate-700/50 cursor-pointer hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{milestone.title}</h4>
                  {milestone.status === 'completed' && (
                    <Trophy size={16} className="text-amber-400" />
                  )}
                </div>
                {milestone.description && (
                  <p className="text-sm text-slate-400 mb-3">{milestone.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {formatTime(milestone.estimated_minutes)}
                  </span>
                  {milestone.status === 'in_progress' && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-purple-400">{milestone.progress}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        {currentMilestone && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMilestoneClick?.(currentMilestone)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <Play size={20} /> Continue: {currentMilestone.title}
          </motion.button>
        )}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Flag className="text-purple-400" size={24} />
              Your Learning Journey
            </h3>
            <p className="text-slate-400 text-sm mt-1">{data.title}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{Math.round(data.overall_progress)}%</div>
            <div className="text-xs text-slate-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.overall_progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            <Trophy size={14} className="inline mr-1 text-amber-400" />
            {data.milestones.filter(m => m.status === 'completed').length}/{data.milestones.length} milestones
          </span>
          <span className="text-slate-400">
            <Clock size={14} className="inline mr-1" />
            {formatTime(remainingTime)} remaining
          </span>
        </div>
      </div>

      {/* Horizontal Path */}
      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-center gap-2 min-w-max px-4">
          {data.milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex items-center">
              {/* Milestone Node */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
                onClick={() => milestone.status !== 'locked' && onMilestoneClick?.(milestone)}
                className={`relative flex flex-col items-center ${
                  milestone.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Badge */}
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br ${getStatusColor(milestone.status)}
                  ring-4 ${getRingColor(milestone.status)} ring-offset-4 ring-offset-slate-900
                  transition-transform ${milestone.status !== 'locked' ? 'hover:scale-110' : ''}
                  ${milestone.status === 'in_progress' ? 'animate-pulse' : ''}
                `}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle size={28} className="text-white" />
                  ) : milestone.status === 'in_progress' ? (
                    <Play size={24} className="text-white" />
                  ) : milestone.status === 'locked' ? (
                    <Lock size={22} className="text-white/50" />
                  ) : (
                    <Star size={24} className="text-white" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center max-w-[100px]">
                  <p className={`text-sm font-medium truncate ${
                    milestone.status === 'locked' ? 'text-slate-500' : 'text-white'
                  }`}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-slate-500">{formatTime(milestone.estimated_minutes)}</p>
                </div>

                {/* Progress ring for in_progress */}
                {milestone.status === 'in_progress' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-purple-400">{milestone.progress}%</span>
                  </div>
                )}

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredMilestone === milestone.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 z-10 w-48 p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-xl"
                    >
                      <h5 className="font-semibold text-white text-sm mb-1">{milestone.title}</h5>
                      {milestone.description && (
                        <p className="text-xs text-slate-400 mb-2">{milestone.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{milestone.module_ids.length} modules</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          milestone.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          milestone.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                          milestone.status === 'locked' ? 'bg-slate-600/20 text-slate-400' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {milestone.status.replace('_', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Connector Line */}
              {idx < data.milestones.length - 1 && (
                <div className="flex items-center mx-2">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className={`w-12 h-1 rounded-full origin-left ${
                      milestone.status === 'completed'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : 'bg-slate-700'
                    }`}
                  />
                  <ArrowRight size={16} className={
                    milestone.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'
                  } />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Progress Card */}
      {currentMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Currently Working On</p>
              <h4 className="text-lg font-bold text-white">{currentMilestone.title}</h4>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMilestoneClick?.(currentMilestone)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <Zap size={18} /> Continue
            </motion.button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentMilestone.progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
            <span className="text-sm font-medium text-purple-400">{currentMilestone.progress}%</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}


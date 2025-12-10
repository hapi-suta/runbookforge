'use client'

import Link from 'next/link';
import { ChevronRight, Home, GraduationCap } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-6 flex-wrap">
      <Link
        href="/dashboard/training"
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/50"
      >
        <GraduationCap size={16} />
        <span>Training Center</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        
        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-slate-600" />
            
            {isLast || !item.href ? (
              <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${isLast ? 'text-white bg-slate-800/50' : 'text-slate-400'}`}>
                {Icon && <Icon size={14} />}
                <span className="truncate max-w-[200px]">{item.label}</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/50"
              >
                {Icon && <Icon size={14} />}
                <span className="truncate max-w-[200px]">{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;


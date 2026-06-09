'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BarChart2, Layers, BookOpen, User, Settings, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Playground', path: '/visualize', icon: Compass },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Problems', path: '/problems', icon: BookOpen },
    { name: 'Roadmaps', path: '/roadmaps', icon: Layers },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-card-border bg-background/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
          V
        </div>
        <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AlgoVerse
        </span>
      </Link>

      {/* Center navigation links */}
      <div className="hidden md:flex items-center gap-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-secondary border border-indigo-500/20 text-white'
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User profile section */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-1.5 rounded-lg border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <User className="w-4 h-4" />
        </Link>
        <Link
          href="/settings"
          className="p-1.5 rounded-lg border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Trash2, Search, Compass, ChevronRight, CheckSquare } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notes/demo-user-id');
      if (res.ok) {
        const list = await res.json();
        setNotes(list);
      } else {
        // Fallback mockup notes
        setNotes([
          { id: '1', problemId: 'two-sum', content: 'Use the hash map technique to search complements in O(1) time. Pay attention to array boundaries.', updatedAt: new Date().toISOString(), problem: { title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY', category: 'Arrays' } },
          { id: '2', problemId: 'binary-search', content: 'Midpoint division: left + (right-left)/2 is safe from integer overflows.', updatedAt: new Date().toISOString(), problem: { title: 'Binary Search', slug: 'binary-search', difficulty: 'EASY', category: 'Binary Search' } }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await fetch(`http://localhost:4000/api/notes/demo-user-id/${problemId}`, {
        method: 'DELETE',
      });
      fetchNotes();
    } catch (e) {
      alert('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="w-5.5 h-5.5 text-primary" /> Notes & Annotations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your personal code annotations and bookmarks.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes content..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-card-border rounded-xl text-xs text-slate-250 outline-none focus:border-primary placeholder:text-slate-650"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <p className="text-muted-foreground text-xs animate-pulse">Loading notes...</p>
      ) : filteredNotes.length === 0 ? (
        <div className="h-40 flex items-center justify-center border border-dashed border-card-border rounded-2xl bg-card">
          <p className="text-muted-foreground text-xs">No personal workspace notes stored yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => {
            let diffColor = 'border-slate-800 text-slate-400';
            if (note.problem.difficulty === 'EASY') diffColor = 'border-emerald-950 bg-emerald-950/10 text-accent-emerald';
            else if (note.problem.difficulty === 'MEDIUM') diffColor = 'border-amber-950 bg-amber-950/10 text-accent-amber';

            return (
              <div
                key={note.id}
                className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-4 border border-card-border hover:border-primary/25 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-250">{note.problem.title}</h4>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{note.problem.category}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${diffColor}`}>
                      {note.problem.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/20 p-3.5 rounded-xl border border-card-border/40 font-mono">
                    {note.content}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-card-border pt-3 mt-1 text-[10px]">
                  <span className="text-slate-500">Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(note.problemId)}
                      className="p-1.5 rounded-lg border border-red-950/45 hover:bg-red-950/10 text-accent-rose transition-all"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href="/visualize"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover border border-indigo-500/20 text-white font-semibold transition-all"
                    >
                      Visualize <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

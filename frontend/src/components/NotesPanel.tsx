'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bookmark, BookmarkCheck, FileText, CheckCircle2 } from 'lucide-react';

interface NotesPanelProps {
  problemId: string;
  userId: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ problemId, userId }) => {
  const [content, setContent] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load existing notes & bookmark state
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/notes/${userId}`);
        const notes = await res.json();
        const activeNote = notes.find((n: any) => n.problemId === problemId);
        if (activeNote) {
          setContent(activeNote.content);
        } else {
          setContent('');
        }
      } catch (e) {
        console.error('Failed to load notes', e);
      }
    };

    fetchNotes();
  }, [problemId, userId]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await fetch(`http://localhost:4000/api/notes/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, content }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('idle');
      alert('Failed to save notes.');
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/notes/${userId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });
      const data = await res.json();
      setIsBookmarked(!isBookmarked);
    } catch (e) {
      console.error('Bookmark toggle failed');
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 shadow-xl flex flex-col h-full justify-between gap-4">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center border-b border-card-border pb-3 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-primary font-bold">
            <FileText className="w-4 h-4" /> Personal Workspace Notes
          </span>

          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg border border-card-border hover:bg-slate-800 transition-all ${
              isBookmarked ? 'text-accent-amber' : 'text-slate-400'
            }`}
            title="Toggle Bookmark"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jot down notes, trace loops, or write interview summaries here..."
          className="w-full h-[180px] bg-slate-950/20 border border-card-border rounded-xl p-4 text-xs text-slate-300 outline-none focus:border-primary resize-none placeholder:text-slate-650"
        />
      </div>

      {/* Action triggers */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">Auto-saved to cloud database</span>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
        >
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> Saved
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> {saveStatus === 'saving' ? 'Saving...' : 'Save Notes'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

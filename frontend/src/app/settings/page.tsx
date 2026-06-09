'use client';

import React, { useState } from 'react';
import { Settings, Save, Shield, Terminal, User } from 'lucide-react';

export default function SettingsPage() {
  const [username, setUsername] = useState('Candidate Demo User');
  const [email, setEmail] = useState('demo@algoverse.com');
  const [theme, setTheme] = useState('dark');
  const [sandboxTimeout, setSandboxTimeout] = useState(2); // seconds
  const [saveStatus, setSaveStatus] = useState('idle');

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-3xl mx-auto w-full gap-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-primary" /> Settings Workspace
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure your account details, default visualizer options, and compiler constraints.</p>
      </div>

      {/* Panels */}
      <div className="space-y-6">
        
        {/* Profile Details Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-350 flex items-center gap-2 border-b border-card-border pb-2">
            <User className="w-4 h-4 text-primary" /> Account Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase font-bold">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-card-border rounded-xl text-xs text-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-card-border rounded-xl text-xs text-slate-200 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Sandbox config */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-350 flex items-center gap-2 border-b border-card-border pb-2">
            <Terminal className="w-4 h-4 text-primary" /> Sandbox execution settings
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <h5 className="font-semibold text-slate-200">Execution Timeout Cap</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5">Maximum seconds allowed for running compiled test case streams before throwing TLE.</p>
              </div>
              <input
                type="number"
                value={sandboxTimeout}
                onChange={(e) => setSandboxTimeout(Number(e.target.value))}
                className="w-16 text-center px-2 py-1 bg-slate-950/40 border border-card-border rounded-xl text-xs text-slate-200 outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Themes config */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-350 flex items-center gap-2 border-b border-card-border pb-2">
            <Shield className="w-4 h-4 text-primary" /> Visualizer Preferences
          </h3>

          <div className="flex justify-between items-center text-xs">
            <div>
              <h5 className="font-semibold text-slate-200">Platform theme</h5>
              <p className="text-[10px] text-muted-foreground mt-0.5">Switch between Dark Mode vs Light Mode (Dark mode recommended for visual contrast).</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3.5 py-2 bg-slate-950/40 border border-card-border rounded-xl text-xs text-slate-350 outline-none focus:border-primary font-bold"
            >
              <option value="dark">Dark Slate</option>
              <option value="light">Light Slate</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/10"
          >
            <Save className="w-4 h-4" /> {saveStatus === 'saved' ? 'Settings Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>

    </div>
  );
}

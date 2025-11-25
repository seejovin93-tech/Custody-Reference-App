import React from 'react';
import { LayoutDashboard, ShieldCheck, Settings, LogOut, Hexagon } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isDuress?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isDuress = false }) => {
  // In Duress mode, hide Security and Settings to simulate a restricted user account
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} /> },
    ...(!isDuress ? [
      { id: 'security', label: 'Security', icon: <ShieldCheck className="w-5 h-5" strokeWidth={2} /> },
      { id: 'settings', label: 'Config', icon: <Settings className="w-5 h-5" strokeWidth={2} /> },
    ] : []),
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-white border-r-2 border-pastel-border h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b-2 border-pastel-border bg-pastel-bg flex items-center justify-center">
        <h1 className="text-xl font-bold text-pastel-text tracking-tight flex items-center font-pixel">
          <Hexagon className="w-8 h-8 text-pastel-purple fill-pastel-purple mr-2 stroke-2 stroke-black" />
          Mimi Vault
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all border-2 ${
              activeTab === item.id
                ? 'bg-pastel-purple border-pastel-border text-pastel-text shadow-pixel-sm translate-x-[-2px] translate-y-[-2px]'
                : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50 hover:border-pastel-border hover:text-pastel-text'
            }`}
          >
            {item.icon}
            <span className="font-bold tracking-wide text-sm font-pixel">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t-2 border-pastel-border bg-pastel-bg/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl border-2 border-transparent text-gray-400 hover:bg-red-100 hover:text-red-500 hover:border-pastel-border transition-all font-bold text-sm font-pixel"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Bell, User, LogOut, Settings, ShieldCheck, Check, Wallet, Copy, Sparkles } from 'lucide-react';
import { Transaction, Notification } from '../types';

interface HeaderProps {
  transactions: Transaction[];
  notifications: Notification[];
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onTransactionClick: (tx: Transaction) => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  isDuress?: boolean;
  userId: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  transactions, 
  notifications,
  onLogout, 
  onNavigate, 
  onTransactionClick,
  onMarkAllRead,
  onNotificationClick,
  isDuress = false,
  userId
}) => {
  const [activeMenu, setActiveMenu] = useState<'notifications' | 'profile' | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);
  
  const WALLET_ADDRESS = "0x71C...976F";
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleMenu = (menu: 'notifications' | 'profile') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAllRead();
  };

  const handleNavigation = (view: string) => {
    setActiveMenu(null);
    onNavigate(view);
  };

  const handleNotificationClickInternal = (notification: Notification) => {
    onNotificationClick(notification);
    setActiveMenu(null);
  };

  return (
    <>
      {activeMenu && (
        <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setActiveMenu(null)}></div>
      )}

      <header className="h-20 bg-white border-b-2 border-pastel-border sticky top-0 z-40 flex items-center justify-between px-6 md:ml-64">
        
        {/* Left: Wallet Widget */}
        <div className="hidden sm:flex items-center">
           <button 
             onClick={handleCopyAddress}
             className="group flex items-center bg-pastel-bg border-2 border-pastel-border rounded-xl shadow-pixel-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all overflow-hidden"
           >
              <div className={`px-3 py-2 border-r-2 border-pastel-border transition-colors ${addressCopied ? 'bg-green-200' : 'bg-pastel-yellow'}`}>
                 {addressCopied ? <Check className="w-5 h-5 text-pastel-text" strokeWidth={3} /> : <Wallet className="w-5 h-5 text-pastel-text" strokeWidth={2.5} />}
              </div>
              <div className="px-3 py-1.5 flex flex-col items-start">
                 <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider leading-none mb-0.5 font-pixel">Address</span>
                 <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-sm text-pastel-text">{WALLET_ADDRESS}</span>
                    <Copy className="w-3 h-3 text-gray-400 group-hover:text-pastel-text" strokeWidth={2.5} />
                 </div>
              </div>
           </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('notifications')}
              className={`p-3 rounded-xl border-2 border-pastel-border transition-all relative ${
                activeMenu === 'notifications' 
                  ? 'bg-pastel-yellow translate-x-[2px] translate-y-[2px]' 
                  : 'bg-white shadow-pixel-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              }`}
            >
              <Bell className="w-5 h-5 text-pastel-text" strokeWidth={2.5} />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-red-400 border-2 border-pastel-border flex items-center justify-center z-10 shadow-sm">
                   <span className="text-[10px] font-bold text-white font-pixel leading-none mt-[1px]">{unreadCount}</span>
                </div>
              )}
            </button>

            {activeMenu === 'notifications' && (
              <div className="absolute top-14 right-0 w-80 bg-white border-2 border-pastel-border rounded-xl shadow-pixel z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b-2 border-pastel-border flex justify-between items-center bg-pastel-bg">
                  <h3 className="font-pixel text-pastel-text text-xs uppercase">Alerts</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] text-pastel-text font-bold underline decoration-2 hover:text-pastel-purple">
                      CLEAR ALL
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm font-bold flex flex-col items-center">
                        <Sparkles className="w-6 h-6 mb-2 opacity-50" />
                        No new alerts!
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => handleNotificationClickInternal(item)}
                        className={`w-full text-left px-4 py-3 border-b-2 border-gray-100 last:border-0 hover:bg-pastel-bg transition-colors group focus:outline-none flex items-start space-x-3 ${!item.read ? 'bg-pastel-yellow/20' : ''}`}
                      >
                         <div className={`mt-1 w-2 h-2 border-2 border-pastel-border flex-shrink-0 
                            ${item.type === 'success' ? 'bg-green-200' : 
                              item.type === 'warning' ? 'bg-red-200' : 'bg-blue-200'}`
                          }></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-pastel-text leading-tight font-mono">{item.title}</p>
                            <p className="text-xs text-gray-600 mt-1 font-mono leading-tight">{item.desc}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase">{item.time}</p>
                          </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('profile')}
              className={`flex items-center space-x-3 pl-2 py-1 rounded-xl border-2 border-transparent hover:border-pastel-border hover:bg-white hover:shadow-pixel-sm transition-all ${
                 activeMenu === 'profile' ? 'bg-white border-pastel-border shadow-pixel-sm' : ''
              }`}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-pastel-text font-pixel">
                    VAULT
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 border-pastel-border transition-colors ${
                activeMenu === 'profile' ? 'bg-pastel-purple' : 'bg-pastel-pink'
              }`}>
                <User className="w-6 h-6 text-pastel-text" strokeWidth={2.5} />
              </div>
            </button>

            {activeMenu === 'profile' && (
              <div className="absolute top-14 right-0 w-64 bg-white border-2 border-pastel-border rounded-xl shadow-pixel z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                 <div className="p-4 bg-pastel-pink border-b-2 border-pastel-border">
                    <p className="font-pixel text-pastel-text text-sm mb-1">VAULT ID</p>
                    <p className="text-sm font-mono text-gray-800 font-bold tracking-wider">{userId}</p>
                 </div>
                 <div className="p-2 space-y-1">
                   {!isDuress && (
                     <>
                        <button onClick={() => handleNavigation('settings')} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-pastel-text hover:border-2 hover:border-gray-100 border-2 border-transparent transition-all">
                            <Settings className="w-4 h-4" /> <span>Settings</span>
                        </button>
                        <button onClick={() => handleNavigation('security')} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-pastel-text hover:border-2 hover:border-gray-100 border-2 border-transparent transition-all">
                            <ShieldCheck className="w-4 h-4" /> <span>Security</span>
                        </button>
                     </>
                   )}
                 </div>
                 <div className="p-2 border-t-2 border-pastel-border">
                   <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                     <LogOut className="w-4 h-4" /> <span>Sign Out</span>
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, History, RefreshCw, Wallet, Sparkles } from 'lucide-react';
import { Transaction } from '../types';

interface DashboardProps {
  balance: number;
  transactions: Transaction[];
  onNavigate: (view: string) => void;
  onViewHistory: () => void;
  onTransactionClick: (tx: Transaction) => void;
}

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const ActionBtn: React.FC<ActionBtnProps> = ({ icon, label, onClick, variant = 'primary' }) => (
  <button 
    onClick={onClick}
    className={`group w-full py-5 flex flex-col items-center justify-center border-2 border-pastel-border rounded-xl shadow-pixel transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-sm hover:brightness-95 ${variant === 'primary' ? 'bg-pastel-purple' : 'bg-pastel-pink'}`}
  >
    <div className={`mb-2 p-2.5 rounded-lg border-2 border-pastel-border bg-white text-pastel-text group-hover:rotate-3 transition-transform`}>
       {icon}
    </div>
    <span className="font-pixel text-pastel-text text-xs tracking-wide">{label}</span>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ balance, transactions, onNavigate, onViewHistory, onTransactionClick }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full gap-6 overflow-hidden">
      
      {/* Top Section: Balance & Actions */}
      <div className="flex-none flex flex-col md:flex-row gap-6">
          
          {/* Balance Card */}
          <div className="flex-1 bg-white border-2 border-pastel-border rounded-2xl shadow-pixel p-6 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
             {/* Background Decoration */}
             <div className="absolute -right-8 -top-8 text-pastel-yellow opacity-50">
                <Sparkles className="w-40 h-40" strokeWidth={1} />
             </div>
             <div className="absolute bottom-4 right-4 opacity-20">
                <Wallet className="w-24 h-24 text-pastel-purple" />
             </div>

             <div className="relative z-10">
                <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <span className="text-xs font-bold font-pixel tracking-wider text-pastel-text bg-pastel-green px-2 py-1 rounded-md border-2 border-pastel-border">TOTAL BALANCE</span>
                    <button onClick={handleRefresh} className={`p-1 hover:text-pastel-text transition-colors ${isRefreshing ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-pastel-text tracking-tight font-mono mb-4">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border-2 border-pastel-border text-pastel-text text-xs font-bold">
                    <div className="w-2 h-2 bg-green-300 rounded-full mr-2 border-2 border-pastel-border"></div>
                    USDT (ERC20)
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="flex-none w-full md:w-48 grid grid-cols-2 md:grid-cols-1 gap-4">
             <ActionBtn 
               icon={<ArrowUpRight strokeWidth={3} />} 
               label="Send" 
               onClick={() => onNavigate('send')}
               variant="primary"
             />
             <ActionBtn 
               icon={<ArrowDownLeft strokeWidth={3} />} 
               label="Receive" 
               onClick={() => onNavigate('receive')} 
               variant="secondary"
             />
          </div>
      </div>

      {/* Bottom Section: Activity (Fills remaining height) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border-2 border-pastel-border rounded-2xl shadow-pixel overflow-hidden">
         <div className="flex-none px-6 py-4 border-b-2 border-pastel-border flex justify-between items-center bg-pastel-bg/50">
            <h2 className="text-lg font-pixel text-pastel-text flex items-center">
                <History className="w-5 h-5 mr-2" />
                Recent Stuff
            </h2>
            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border-2 border-pastel-border">{transactions.length} ITEMS</span>
         </div>
         
         <div className="flex-1 overflow-y-auto p-0">
            {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 border-2 border-pastel-border rounded-full flex items-center justify-center">
                        <History className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-bold font-pixel">It's quiet here...</p>
                </div>
            ) : (
                <div className="divide-y-2 divide-gray-100">
                    {transactions.map((tx) => (
                        <button 
                        key={tx.id}
                        onClick={() => onTransactionClick(tx)}
                        className="w-full p-5 flex items-center justify-between hover:bg-pastel-bg transition-colors text-left group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 border-pastel-border shadow-[2px_2px_0px_0px_#1C1917] transition-transform group-hover:-rotate-6 bg-white`}>
                                    {tx.type === 'receive' ? 
                                        <ArrowDownLeft className="w-5 h-5 text-pastel-text" strokeWidth={3} /> : 
                                        <ArrowUpRight className="w-5 h-5 text-pastel-text" strokeWidth={3} />
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-pastel-text font-pixel group-hover:underline decoration-2 underline-offset-2">{tx.type === 'receive' ? 'Received' : 'Sent'}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5 font-bold">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold font-mono ${tx.type === 'receive' ? 'text-green-600' : 'text-pastel-text'}`}>
                                    {tx.type === 'receive' ? '+' : '-'}{tx.amount.toFixed(2)}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tx.asset}</p>
                            </div>
                        </button>
                    ))}
                    <div className="p-4">
                        <button 
                            onClick={onViewHistory}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold text-xs uppercase hover:border-pastel-border hover:text-pastel-text hover:bg-white transition-all font-pixel"
                        >
                            View All History
                        </button>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
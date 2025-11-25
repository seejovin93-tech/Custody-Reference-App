import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Transfer } from './components/Transfer';
import { Receive } from './components/Receive';
import { Security } from './components/Security';
import { Login } from './components/Login';
import { Card } from './components/Card';
import { ChevronLeft, ArrowDown, Copy, Check } from 'lucide-react';
import { Transaction, Notification } from './types';

// --- TRACK A: REAL DATA ---
// Target Balance: 12,500.50
// Math: 20000 (Rx) - 5000 (Sx) - 2499.50 (Sx) = 12500.50
const realTransactions: Transaction[] = [
  { id: 'tx-1', type: 'send', asset: 'USDT', amount: 2499.50, toFrom: '0x8a...9c2', date: 'Today, 10:24 AM', status: 'completed', hash: '0x7f39...3a91' },
  { id: 'tx-2', type: 'send', asset: 'USDT', amount: 5000.00, toFrom: '0x4b...7d1', date: 'Oct 24, 2023', status: 'completed', hash: '0x456...882' },
  { id: 'tx-3', type: 'send', asset: 'USDT', amount: 1000.00, toFrom: '0x9f...3e4', date: 'Oct 22, 2023', status: 'failed', hash: '0x789...112' }, // Failed tx doesn't affect balance
  { id: 'tx-4', type: 'receive', asset: 'USDT', amount: 20000.00, toFrom: '0x1a...8b9', date: 'Oct 20, 2023', status: 'completed', hash: '0x123...456' }, // Initial Seed
];

const realNotifications: Notification[] = [
  { id: 1, title: 'Transfer Sent', desc: '2,499.50 USDT out', time: '2m ago', type: 'info', read: false, transactionId: 'tx-1' },
  { id: 2, title: 'Security Alert', desc: 'New login detected', time: '1h ago', type: 'warning', read: false },
  { id: 3, title: 'System Update', desc: 'Mimi Vault v2.4 live', time: '5h ago', type: 'info', read: true }
];

// --- TRACK B: DURESS DATA (FAKE UI) ---
// Target Balance: 999.00
// Math: 1200 (Rx) - 150 (Sx) - 51 (Sx) = 999.00
const duressTransactions: Transaction[] = [
  { id: 'dtx-1', type: 'send', asset: 'USDT', amount: 51.00, toFrom: '0x11...222', date: 'Yesterday, 09:00 AM', status: 'completed', hash: '0xabc...def' },
  { id: 'dtx-2', type: 'send', asset: 'USDT', amount: 150.00, toFrom: '0x33...444', date: 'Oct 22, 2023', status: 'completed', hash: '0x123...abc' },
  { id: 'dtx-3', type: 'receive', asset: 'USDT', amount: 1200.00, toFrom: 'Exchange', date: 'Oct 15, 2023', status: 'completed', hash: '0x999...111' },
];

const duressNotifications: Notification[] = [
  { id: 101, title: 'Funds Sent', desc: '51.00 USDT sent', time: '1d ago', type: 'info', read: true, transactionId: 'dtx-1' },
  { id: 102, title: 'Welcome', desc: 'Account verified', time: '2w ago', type: 'info', read: true }
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDuress, setIsDuress] = useState(false); // Dual Login State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [userId, setUserId] = useState('');
  
  // Application State - Real
  const [realBalance, setRealBalance] = useState(12500.50);
  const [rTransactions, setRTransactions] = useState<Transaction[]>(realTransactions);
  const [rNotifications, setRNotifications] = useState<Notification[]>(realNotifications);

  // Application State - Duress (Fake)
  const [fakeBalance, setFakeBalance] = useState(999.00);
  const [fTransactions, setFTransactions] = useState<Transaction[]>(duressTransactions);
  const [fNotifications, setFNotifications] = useState<Notification[]>(duressNotifications);

  // Derived State based on Mode
  const balance = isDuress ? fakeBalance : realBalance;
  const transactions = isDuress ? fTransactions : rTransactions;
  const notifications = isDuress ? fNotifications : rNotifications;

  const handleLogin = (duressMode: boolean) => {
    setIsDuress(duressMode);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    // Retrieve ID from storage or fallback to a demo ID if not present
    const storedId = localStorage.getItem('mimi_vault_id') || '8829 1029 3847';
    setUserId(storedId);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setCurrentView('transaction-details');
  };

  const handleSend = (amount: number, recipient: string) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'send',
      asset: 'USDT',
      amount: amount,
      toFrom: recipient,
      date: 'Just now',
      status: 'completed',
      hash: '0x' + Math.random().toString(16).slice(2, 10)
    };
    
    const newNotification: Notification = {
      id: Date.now(),
      title: 'Funds Sent',
      desc: `Sent ${amount.toFixed(2)} USDT`,
      time: 'Just now',
      type: 'info',
      read: false,
      transactionId: newTx.id
    };

    if (isDuress) {
      setFakeBalance(prev => prev - amount);
      setFTransactions(prev => [newTx, ...prev]);
      setFNotifications(prev => [newNotification, ...prev]);
    } else {
      setRealBalance(prev => prev - amount);
      setRTransactions(prev => [newTx, ...prev]);
      setRNotifications(prev => [newNotification, ...prev]);
    }
  };

  const handleMarkAllRead = () => {
    if (isDuress) {
        setFNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } else {
        setRNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const updateRead = (list: Notification[]) => list.map(n => n.id === notification.id ? { ...n, read: true } : n);
    
    if (isDuress) setFNotifications(prev => updateRead(prev));
    else setRNotifications(prev => updateRead(prev));

    if (notification.transactionId) {
      const tx = transactions.find(t => t.id === notification.transactionId);
      if (tx) handleTransactionClick(tx);
    } else if (notification.type === 'warning' && !isDuress) {
      setCurrentView('security');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            balance={balance}
            transactions={transactions}
            onNavigate={setCurrentView} 
            onViewHistory={() => setCurrentView('history')}
            onTransactionClick={handleTransactionClick}
          />
        );
      case 'send':
        return (
          <Transfer 
            onBack={() => setCurrentView('dashboard')} 
            onSend={handleSend}
            balance={balance}
          />
        );
      case 'receive':
        return <Receive onBack={() => setCurrentView('dashboard')} />;
      case 'security':
        // Security View is restricted in Duress Mode
        return isDuress ? <Dashboard 
            balance={balance}
            transactions={transactions}
            onNavigate={setCurrentView} 
            onViewHistory={() => setCurrentView('history')}
            onTransactionClick={handleTransactionClick}
          /> : <Security onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        // Settings restricted in Duress Mode
        return isDuress ? <Dashboard 
        balance={balance}
        transactions={transactions}
        onNavigate={setCurrentView} 
        onViewHistory={() => setCurrentView('history')}
        onTransactionClick={handleTransactionClick}
      /> : <SettingsView onBack={() => setCurrentView('dashboard')} userId={userId} />;
      case 'history':
        return (
          <HistoryView 
            transactions={transactions}
            onBack={() => setCurrentView('dashboard')} 
            onTransactionClick={handleTransactionClick}
          />
        );
      case 'transaction-details':
        return (
          <TransactionDetails 
            transaction={selectedTransaction} 
            onBack={() => setCurrentView('dashboard')} 
          />
        );
      default:
        return (
          <Dashboard 
            balance={balance}
            transactions={transactions}
            onNavigate={setCurrentView}
            onViewHistory={() => setCurrentView('history')}
            onTransactionClick={handleTransactionClick}
          />
        );
    }
  };

  // Dashboard and Receive views should be non-scrollable/contained
  const isLockedView = currentView === 'dashboard' || currentView === 'receive';

  return (
    <div className="h-screen bg-pastel-bg text-pastel-text font-mono overflow-hidden flex flex-col md:flex-row">
      <Sidebar 
        activeTab={currentView} 
        setActiveTab={setCurrentView} 
        onLogout={() => setIsLoggedIn(false)}
        isDuress={isDuress}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-64">
        <Header 
          transactions={transactions}
          notifications={notifications}
          onLogout={() => setIsLoggedIn(false)}
          onNavigate={setCurrentView}
          onTransactionClick={handleTransactionClick}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          isDuress={isDuress}
          userId={userId}
        />
        <main className={`flex-1 transition-all overflow-y-auto ${isLockedView ? 'overflow-hidden' : ''}`}>
          <div className={`mx-auto h-full ${isLockedView ? 'p-4 md:p-6 flex flex-col' : 'max-w-4xl p-4 md:p-8'}`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const SettingsView = ({ onBack, userId }: { onBack: () => void, userId: string }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
       <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-pastel-bg transition-all">
            <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
          <h2 className="text-2xl font-bold text-pastel-text ml-2 font-pixel">Settings</h2>
       </div>

       <Card title="Account Identity" variant="blue">
         <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 font-pixel">Vault ID</p>
               <div 
                onClick={copyId}
                className="group relative cursor-pointer px-6 py-3 bg-white border-2 border-pastel-border rounded-xl shadow-pixel-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
               >
                 <p className="text-3xl font-bold text-pastel-text font-mono tracking-widest">{userId}</p>
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                 </div>
               </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold max-w-xs leading-relaxed">
                This is your unique vault identifier. You need this to recover your account on other devices.
            </p>
         </div>
       </Card>
       
       <Card title="Preferences" className="mt-6 bg-white">
         <div className="space-y-4 divide-y-2 divide-gray-100">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-pastel-text text-sm font-pixel">2FA Security</p>
                <p className="text-xs text-gray-500 font-bold">Transactions > $1k</p>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={`w-12 h-7 rounded-full border-2 border-pastel-border relative transition-colors ${is2FAEnabled ? 'bg-green-400' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white border-2 border-pastel-border rounded-full absolute top-0.5 transition-all ${is2FAEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-bold text-pastel-text text-sm font-pixel">Auto Logout</p>
                <p className="text-xs text-gray-500 font-bold">Safety timer</p>
              </div>
              <div className="relative w-32">
                  <select 
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="appearance-none bg-white border-2 border-pastel-border text-pastel-text text-sm font-bold rounded-xl block w-full px-3 py-2 outline-none font-mono shadow-pixel-sm"
                  >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="60">1 hour</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pastel-text">
                      <ArrowDown className="w-4 h-4" strokeWidth={3} />
                  </div>
              </div>
            </div>
         </div>
       </Card>
    </div>
  );
};

const HistoryView = ({ transactions, onBack, onTransactionClick }: { transactions: Transaction[], onBack: () => void, onTransactionClick: (tx: Transaction) => void }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const filteredData = transactions.filter(tx => filter === 'all' || tx.status === filter);

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-pastel-bg transition-all">
             <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
          <h2 className="text-2xl font-bold text-pastel-text ml-2 font-pixel">Full History</h2>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'completed', 'pending', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase border-2 transition-all font-pixel ${
              filter === f 
                ? 'bg-pastel-purple border-pastel-border text-pastel-text shadow-pixel-sm' 
                : 'bg-white border-transparent text-gray-400 hover:border-pastel-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-pastel-border rounded-2xl shadow-pixel overflow-hidden">
        {filteredData.map((tx) => (
           <div 
             key={tx.id}
             onClick={() => onTransactionClick(tx)}
             className="p-4 border-b-2 border-gray-100 last:border-0 hover:bg-pastel-bg cursor-pointer transition-colors flex justify-between items-center"
           >
              <div>
                 <p className="font-bold text-sm text-pastel-text font-pixel uppercase">{tx.type}</p>
                 <p className="text-xs text-gray-500 font-mono">{tx.date}</p>
              </div>
              <div className="text-right">
                 <p className={`font-bold font-mono ${tx.type === 'receive' ? 'text-green-600' : 'text-pastel-text'}`}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount.toFixed(2)} USDT
                 </p>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded border-2 border-pastel-border uppercase ${
                    tx.status === 'completed' ? 'bg-green-200' :
                    tx.status === 'pending' ? 'bg-yellow-200' : 'bg-red-200'
                 }`}>
                    {tx.status}
                 </span>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

const TransactionDetails = ({ transaction, onBack }: { transaction: Transaction | null, onBack: () => void }) => {
  if (!transaction) return null;
  
  return (
    <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
       <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-pastel-bg transition-all">
            <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
          <h2 className="text-xl font-bold text-pastel-text ml-2 font-pixel">Transaction Details</h2>
       </div>

       <Card className="text-center py-8">
          <div className="w-20 h-20 mx-auto bg-pastel-yellow border-2 border-pastel-border rounded-full flex items-center justify-center mb-4 shadow-pixel">
             <span className="text-2xl font-bold font-pixel">{transaction.type === 'send' ? 'OUT' : 'IN'}</span>
          </div>
          <h1 className="text-4xl font-bold text-pastel-text mb-2 font-mono">{transaction.amount.toFixed(2)} {transaction.asset}</h1>
          <div className={`inline-block px-3 py-1 rounded-lg border-2 border-pastel-border font-bold text-xs uppercase font-pixel ${
             transaction.status === 'completed' ? 'bg-green-200' : 'bg-yellow-200'
          }`}>
             {transaction.status}
          </div>

          <div className="mt-8 text-left space-y-4">
             <div className="p-4 bg-gray-50 border-2 border-pastel-border rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase font-pixel">Transaction Hash</p>
                <p className="font-mono text-sm font-bold break-all text-pastel-text">{transaction.hash}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border-2 border-pastel-border rounded-xl">
                   <p className="text-xs font-bold text-gray-500 uppercase font-pixel">From/To</p>
                   <p className="font-mono text-sm font-bold truncate text-pastel-text">{transaction.toFrom}</p>
                </div>
                <div className="p-4 bg-gray-50 border-2 border-pastel-border rounded-xl">
                   <p className="text-xs font-bold text-gray-500 uppercase font-pixel">Date</p>
                   <p className="font-mono text-sm font-bold text-pastel-text">{transaction.date}</p>
                </div>
             </div>
          </div>
       </Card>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Send, CheckCircle2, AlertCircle, X, ChevronLeft, Lock } from 'lucide-react';
// CORRECT IMPORT: Looks in ../core (Root/core)
import { EnclaveClient } from '../core/EnclaveClient';

interface TransferProps {
  onBack: () => void;
  onSend: (amount: number, recipient: string) => void;
  balance: number;
}

export const Transfer: React.FC<TransferProps> = ({ onBack, onSend, balance }) => {
  const [step, setStep] = useState<'input' | 'confirm' | 'auth' | 'success'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const assetBalance = balance;
  const amountNum = parseFloat(amount);
  const isOverBalance = !isNaN(amountNum) && amountNum > assetBalance;
  const usdValue = amount ? (parseFloat(amount)).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '-bash.00';

  const handleTransfer = async () => {
    if (!password) { setError('Password required'); return; }
    setIsLoading(true);
    setError('');

    try {
        // --- LIVE FIRE CONNECTION ---
        const enclave = new EnclaveClient();
        await enclave.register("TX_INIT"); 
        // ----------------------------

        onSend(parseFloat(amount), recipient);
        setIsLoading(false);
        setStep('success');
    } catch (e) {
        setIsLoading(false);
        setError('Enclave Connection Failed');
    }
  };

  const handleMax = () => setAmount(assetBalance.toString());

  return (
    <div className="max-w-xl mx-auto pt-2 h-full flex flex-col">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-pastel-bg transition-all">
          <ChevronLeft className="w-6 h-6 text-pastel-text" strokeWidth={3} />
        </button>
        <h2 className="text-xl font-bold text-pastel-text ml-2 font-pixel">Send USDT</h2>
      </div>

      {step === 'input' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="relative py-10 text-center bg-white border-2 border-pastel-border rounded-2xl shadow-pixel">
              <div className="flex items-baseline justify-center space-x-2">
                <span className={`text-3xl font-bold transition-colors ${isOverBalance ? 'text-red-400' : 'text-gray-300'}`}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full max-w-[300px] bg-transparent text-center text-5xl font-bold focus:outline-none placeholder-gray-200 font-mono transition-colors ${isOverBalance ? 'text-red-400' : 'text-pastel-text'}`}
                  autoFocus
                />
              </div>
              <p className="text-gray-400 mt-3 font-mono text-sm font-bold">Available: {assetBalance.toLocaleString()} USDT</p>
              {isOverBalance && (
                  <div className="mt-4 inline-flex items-center justify-center px-3 py-1 bg-red-50 border-2 border-red-200 rounded-lg text-red-500">
                     <AlertCircle className="w-4 h-4 mr-1.5" strokeWidth={2} />
                     <span className="font-bold text-xs font-pixel">Not enough funds!</span>
                  </div>
              )}
              <div className="mt-4">
                <button onClick={handleMax} className="px-3 py-1 text-xs font-bold rounded-lg border-2 border-pastel-border bg-pastel-yellow hover:bg-yellow-100 text-pastel-text font-pixel transition-colors">MAX</button>
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-xs text-pastel-text font-bold uppercase font-pixel ml-1">To Address</label>
              <div className="bg-white rounded-xl border-2 border-pastel-border p-4 flex items-center focus-within:shadow-pixel-sm transition-all">
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className="w-full bg-transparent text-pastel-text placeholder-gray-300 focus:outline-none font-mono text-sm font-bold" />
                {recipient && <button onClick={() => setRecipient('')}><X className="w-4 h-4 text-gray-400 hover:text-pastel-text" /></button>}
              </div>
           </div>
           <div className="pt-4">
             <Button className="w-full h-14 text-sm" onClick={() => setStep('confirm')} disabled={!amount || !recipient || isOverBalance} icon={<ArrowRight className="w-5 h-5" strokeWidth={3} />}>NEXT STEP</Button>
           </div>
        </div>
      )}

      {step === 'confirm' && (
        <Card title="Double Check" className="bg-white">
          <div className="space-y-6">
            <div className="text-center py-6 bg-pastel-bg border-2 border-pastel-border rounded-xl mb-4">
               <div className="text-3xl font-bold text-pastel-text mb-1 font-mono">{amount} USDT</div>
            </div>
            <div className="bg-white rounded-xl border-2 border-pastel-border overflow-hidden">
               <div className="p-4 border-b-2 border-pastel-border flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-bold font-pixel">Recipient</span>
                  <span className="text-pastel-text text-sm font-mono font-bold truncate max-w-[150px] text-right">{recipient}</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button variant="secondary" onClick={() => setStep('input')} className="h-12">Back</Button>
              <Button onClick={() => setStep('auth')} icon={<ArrowRight className="w-4 h-4" strokeWidth={3}/>} className="h-12">Confirm</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'auth' && (
        <Card title="Security Check" variant="purple">
          <div className="space-y-6">
             <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-pastel-border shadow-pixel-sm"><Lock className="w-6 h-6 text-pastel-text" strokeWidth={2.5} /></div>
                <div><h3 className="text-lg font-bold text-pastel-text font-pixel">Password Please</h3><p className="text-gray-600 text-xs font-bold">Sign this transaction</p></div>
             </div>
             <div className="space-y-2">
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full bg-white border-2 border-pastel-border rounded-xl p-3 text-pastel-text focus:shadow-pixel-sm outline-none transition-all placeholder-gray-300 font-mono font-bold text-center text-lg" placeholder="••••••••" autoFocus />
                {error && <p className="text-red-500 text-xs font-bold text-center font-pixel">{error}</p>}
             </div>
             <div className="grid grid-cols-2 gap-4 pt-2">
               <Button variant="secondary" onClick={() => setStep('confirm')} className="h-12" disabled={isLoading}>Cancel</Button>
               <Button onClick={handleTransfer} isLoading={isLoading} icon={<Send className="w-4 h-4" strokeWidth={2.5}/>} className="h-12 !bg-pastel-text !text-white" disabled={!password}>SEND IT</Button>
             </div>
          </div>
        </Card>
      )}

      {step === 'success' && (
        <div className="text-center space-y-8 py-12 animate-in zoom-in-95 duration-300 flex flex-col items-center">
          <div className="relative"><div className="relative w-24 h-24 bg-green-200 border-2 border-pastel-border rounded-full flex items-center justify-center mx-auto shadow-pixel"><CheckCircle2 className="w-12 h-12 text-pastel-text" strokeWidth={2.5} /></div></div>
          <div><h2 className="text-2xl font-bold text-pastel-text mb-2 font-pixel">Sent!</h2><p className="text-gray-500 font-bold text-sm font-mono">Transaction Broadcasted</p></div>
          <Button onClick={() => { setStep('input'); setAmount(''); setRecipient(''); setPassword(''); onBack(); }} className="w-full max-w-xs h-12">Done</Button>
        </div>
      )}
    </div>
  );
};

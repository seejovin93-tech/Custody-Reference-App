import React, { useState } from 'react';
import { ChevronLeft, Copy, Check, Share2 } from 'lucide-react';
import { Card } from './Card';

interface ReceiveProps {
  onBack: () => void;
}

export const Receive: React.FC<ReceiveProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto overflow-hidden">
      <div className="w-full flex items-center mb-4">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-lg hover:bg-pastel-bg transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-pastel-text" strokeWidth={3} />
        </button>
        <h2 className="text-xl font-bold text-pastel-text ml-2 font-pixel">Receive</h2>
      </div>

      <Card variant="pink" className="w-full" noPadding>
        <div className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="space-y-1">
                <h3 className="text-pastel-text font-bold text-lg font-pixel">USDT (ERC20)</h3>
                <p className="text-gray-600 text-xs font-bold">Scan to Pay</p>
            </div>

            {/* QR Code Placeholder - Smaller Size */}
            <div className="p-3 bg-white border-2 border-pastel-border rounded-xl shadow-pixel mx-auto transform rotate-2 hover:rotate-0 transition-transform">
                <div className="w-40 h-40 bg-pastel-text grid grid-cols-12 grid-rows-12 gap-0.5 p-2 rounded-sm">
                    <div className="col-span-4 row-span-4 bg-white border-4 border-pastel-text"></div>
                    <div className="col-span-4 row-span-4 col-start-9 bg-white border-4 border-pastel-text"></div>
                    <div className="col-span-4 row-span-4 row-start-9 bg-white border-4 border-pastel-text"></div>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="bg-white col-span-1 row-span-1" style={{
                            gridColumnStart: Math.floor(Math.random() * 10) + 2,
                            gridRowStart: Math.floor(Math.random() * 10) + 2
                        }}></div>
                    ))}
                </div>
            </div>

            <div className="w-full space-y-2 text-left">
                <label className="text-[10px] text-pastel-text font-bold uppercase font-pixel ml-1">Your Address</label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="flex-1 min-w-0 bg-white border-2 border-pastel-border rounded-xl p-3 flex items-center overflow-hidden shadow-sm">
                        <span className="font-mono text-xs font-bold text-gray-700 truncate select-all w-full">{address}</span>
                    </div>
                </div>
                <button 
                    onClick={handleCopy}
                    className={`w-full mt-2 py-3 rounded-xl border-2 border-pastel-border font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-pixel ${
                        copied 
                        ? 'bg-green-200 text-pastel-text' 
                        : 'bg-pastel-yellow text-pastel-text hover:bg-yellow-100'
                    }`}
                >
                    {copied ? <Check className="w-4 h-4" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={3} />}
                    <span>{copied ? "COPIED!" : "Copy Address"}</span>
                </button>
            </div>

            <div className="bg-white/50 border-2 border-pastel-border rounded-xl p-2 w-full text-center">
                <p className="text-[10px] text-gray-600 font-bold leading-tight">
                    ⚠️ Send only USDT (ERC20).
                </p>
            </div>
        </div>
      </Card>
    </div>
  );
};
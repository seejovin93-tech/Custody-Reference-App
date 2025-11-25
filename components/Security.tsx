import React from 'react';
import { Shield, CheckCircle, FileCode, AlertTriangle, Terminal, ChevronLeft, Eye } from 'lucide-react';
import { Card } from './Card';
import { SecurityMetric } from '../types';

interface SecurityProps {
  onBack: () => void;
}

const metrics: SecurityMetric[] = [
  { id: '1', name: 'SLSA L3 Provenance', status: 'secure', description: 'Build pipeline verified via Sigstore', lastChecked: '1 min ago' },
  { id: '2', name: 'Kyverno Policies', status: 'secure', description: 'ClusterPolicy enforcing signatures', lastChecked: 'Active' },
  { id: '3', name: 'Secret Injection', status: 'secure', description: 'AWS Secrets Store CSI Driver', lastChecked: 'Active' },
  { id: '4', name: 'IRSA Identity', status: 'secure', description: 'Role-EKS-S7-Backend assumed', lastChecked: 'Verified' },
  { id: '5', name: 'Container Digest', status: 'secure', description: 'Immutable digest verified', lastChecked: 'Latest' },
];

export const Security: React.FC<SecurityProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div className="flex items-start">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 mr-2 rounded-lg hover:bg-pastel-bg transition-all mt-[-4px]"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-pastel-text flex items-center font-pixel">
              <Shield className="w-6 h-6 mr-2" strokeWidth={2.5} />
              Security Logs
            </h2>
            <p className="text-gray-500 mt-1 text-xs font-bold uppercase tracking-wide font-mono">System Health: 100%</p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-green-200 border-2 border-pastel-border text-pastel-text text-xs font-bold rounded-lg flex items-center self-start shadow-pixel-sm uppercase font-pixel">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 border border-black"></div>
          Optimal
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden bg-white" noPadding>
             <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-pastel-text text-sm uppercase tracking-wide font-pixel">{metric.name}</h3>
                    <div className={`p-1 rounded-lg border-2 border-pastel-border ${metric.status === 'secure' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                        {metric.status === 'secure' ? (
                            <CheckCircle className="w-4 h-4 text-pastel-text" strokeWidth={2.5} />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-pastel-text" strokeWidth={2.5} />
                        )}
                    </div>
                </div>
                <p className="text-xs font-medium text-gray-500 mb-4 h-8 leading-tight font-mono">{metric.description}</p>
                <div className="text-[10px] font-bold font-mono text-gray-400 pt-3 border-t-2 border-gray-100 flex justify-between uppercase">
                    <span className={metric.status === 'secure' ? 'text-green-600' : 'text-amber-600'}>{metric.status}</span>
                    <span>{metric.lastChecked}</span>
                </div>
            </div>
          </Card>
        ))}
        
        <Card className="bg-pastel-bg border-dashed border-gray-300">
          <div className="flex flex-col items-center justify-center h-full py-4 text-center cursor-pointer hover:opacity-70 transition-opacity">
            <Eye className="w-8 h-8 text-gray-400 mb-2" strokeWidth={2} />
            <h3 className="text-pastel-text font-bold text-sm font-pixel">Audit Logs</h3>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">View CloudTrail</p>
          </div>
        </Card>
      </div>

      {/* Terminal Visual */}
      <Card title="System Terminal" className="!bg-gray-900 !border-pastel-border text-white" noPadding>
        <div className="p-4 h-48 overflow-y-auto text-xs font-mono space-y-1.5 text-gray-300">
          <div className="text-gray-500">[INFO] Initializing Backend...</div>
          <div className="text-blue-300">[INFO] Sepolia Testnet Connected</div>
          <div className="text-green-300">[SEC] Secrets Manager: CSI Loaded</div>
          <div className="text-gray-400">[DB] IAM Auth Token Generated</div>
          <div className="text-green-300">[SEC] Kyverno: Signatures Valid</div>
          <div className="text-purple-300">[AUTH] User session PKCE Valid</div>
          <div className="text-yellow-300 flex items-center animate-pulse">
            <Terminal className="w-3 h-3 mr-2" />
            Listening on :3000
          </div>
        </div>
      </Card>
    </div>
  );
};
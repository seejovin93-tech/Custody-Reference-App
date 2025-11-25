export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  asset: string;
  amount: number;
  toFrom: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
}

export interface SecurityMetric {
  id: string;
  name: string;
  status: 'secure' | 'warning' | 'critical';
  description: string;
  lastChecked: string;
}

export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
  transactionId?: string;
}
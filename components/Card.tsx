import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  variant?: 'default' | 'purple' | 'pink' | 'blue';
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className = '', action, noPadding = false, variant = 'default' }) => {
  
  const bgColors = {
    default: 'bg-white',
    purple: 'bg-pastel-purple',
    pink: 'bg-pastel-pink',
    blue: 'bg-pastel-blue'
  };

  return (
    <div className={`${bgColors[variant]} border-2 border-pastel-border rounded-xl shadow-pixel ${className}`}>
      {(title || subtitle || action) && (
        <div className={`px-6 py-4 border-b-2 border-pastel-border flex justify-between items-center ${noPadding ? '' : ''} rounded-t-lg`}>
          <div>
            {title && <h3 className="text-lg text-pastel-text font-pixel">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5 font-mono font-bold">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};
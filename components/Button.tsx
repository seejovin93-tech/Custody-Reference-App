import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  // Cutesy Pixel Styles
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-pixel text-xs tracking-wide transition-all focus:outline-none border-2 border-pastel-border shadow-pixel active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-[2px] disabled:translate-y-[2px] disabled:shadow-none";
  
  const variants = {
    primary: "bg-pastel-purple hover:bg-purple-100 text-pastel-text",
    secondary: "bg-pastel-card hover:bg-gray-50 text-pastel-text",
    danger: "bg-red-200 hover:bg-red-100 text-pastel-text",
    outline: "bg-transparent hover:bg-white text-pastel-text"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
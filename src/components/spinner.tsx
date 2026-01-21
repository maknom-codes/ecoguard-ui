import React from 'react';
import { TreePine } from 'lucide-react';

interface SpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ 
  fullScreen = false, 
  size = 'md', 
  message = "Loading data..." 
}) => {
  
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center" 
    : "flex flex-col items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div className={`
          ${sizeClasses[size]} 
          border-emerald-100 
          border-t-emerald-600 
          rounded-full 
          animate-spin
        `}></div>
        
        {/* L'icône fixe au centre (uniquement pour les grandes tailles) */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center text-emerald-600/30">
            <TreePine size={size === 'lg' ? 24 : 16} />
          </div>
        )}
      </div>

      {/* Message optionnel */}
      {message && (
        <p className={`mt-4 font-medium text-emerald-800 ${size === 'sm' ? 'text-xs' : 'text-sm'} animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface TopBarProps {
  title: string;
  showDropdown?: boolean;
  sortBy?: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'create' | 'action' | 'danger';
  };
  className?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  showDropdown = false,
  sortBy,
  primaryAction,
  className = ""
}) => {
  const getActionButtonStyle = (variant: string = 'create') => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2";
    
    switch (variant) {
      case 'create':
        return `${baseStyle} bg-purple-500 text-white hover:bg-purple-600`;
      case 'action':
        return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      case 'danger':
        return `${baseStyle} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${baseStyle} bg-purple-500 text-white hover:bg-purple-600`;
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
     
        </div>

        <div className="flex items-center gap-4">
          {sortBy && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort By:</span>
              <select
                value={sortBy.value}
                onChange={(e) => sortBy.onChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortBy.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className={getActionButtonStyle(primaryAction.variant)}
            >
              {primaryAction.variant === 'create' && <Plus className="w-4 h-4" />}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
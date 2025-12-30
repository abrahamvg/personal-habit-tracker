'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';

interface UserProfileDropdownProps {
  userEmail: string;
  onSignOut: () => void;
}

export default function UserProfileDropdown({ userEmail, onSignOut }: UserProfileDropdownProps) {
  const [isHovered, setIsHovered] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get initials from email
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Profile Circle Button */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center cursor-pointer hover:shadow-lg transition-all"
        aria-label="User profile"
      >
        <span className="text-white font-semibold text-sm">{getInitials(userEmail)}</span>
      </div>

      {/* Dropdown Menu - Shows on Hover */}
      {isHovered && (
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-ocean-200 dark:border-dark-border overflow-hidden z-50"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-ocean-200 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">{getInitials(userEmail)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ocean-800 dark:text-dark-text-primary">
                  Account
                </p>
                <p className="text-xs text-ocean-600 dark:text-dark-text-secondary truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-ocean-50 dark:hover:bg-dark-hover transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-ocean-600 dark:text-dark-text-secondary" />
            <span className="text-sm font-medium text-ocean-800 dark:text-dark-text-primary">
              Sign out
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { Flag } from 'lucide-react';
import { PriorityType } from '@/lib/types';
import { getPriorityBadgeClasses, getPriorityShortLabel } from '@/lib/priorityUtils';

interface PriorityBadgeProps {
  priority: PriorityType;
  showIcon?: boolean;
}

/**
 * Reusable priority badge component with consistent styling
 */
export default function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
  return (
    <span className={getPriorityBadgeClasses(priority)}>
      {showIcon && <Flag className="w-3 h-3" />}
      {getPriorityShortLabel(priority)}
    </span>
  );
}

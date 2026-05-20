import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      {icon && <div className="mb-4 text-secondary-400">{icon}</div>}
      <p className="text-base font-medium text-secondary-900">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-secondary-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;

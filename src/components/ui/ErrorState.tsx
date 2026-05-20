import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, className }) => {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
      <p className="text-base font-medium text-secondary-900">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;

import React, { useId } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface QuantityInputProps {
  value: number | '';
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  min?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  inputId?: string;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  label,
  error,
  min = 0,
  step = 1,
  disabled = false,
  className,
  inputId,
}) => {
  const generatedId = useId();
  const id = inputId ?? generatedId;
  const errorId = `${id}-error`;

  const numeric = typeof value === 'number' ? value : 0;

  const handleStep = (delta: number) => {
    const next = Math.max(min, numeric + delta);
    onChange(next);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseInt(raw, 10);
    onChange(Number.isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-stretch">
        <button
          type="button"
          aria-label="decrease"
          onClick={() => handleStep(-step)}
          disabled={disabled || numeric <= min}
          className="min-h-[44px] w-11 flex items-center justify-center rounded-l-lg border border-secondary-300 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={value === 0 ? '' : value}
          onChange={handleInput}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'min-h-[44px] w-full text-center border-y border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            error && 'border-red-500'
          )}
        />
        <button
          type="button"
          aria-label="increase"
          onClick={() => handleStep(step)}
          disabled={disabled}
          className="min-h-[44px] w-11 flex items-center justify-center rounded-r-lg border border-secondary-300 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default QuantityInput;

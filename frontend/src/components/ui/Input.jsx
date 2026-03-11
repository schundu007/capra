import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Input Component - Enterprise-grade input with variants
 *
 * @example
 * <Input placeholder="Enter text..." />
 * <Input variant="filled" size="lg" leftIcon={<SearchIcon />} />
 * <Input error="This field is required" />
 */

const inputVariants = cva(
  // Base styles
  [
    'flex w-full',
    'text-sm',
    'transition-all duration-200',
    'placeholder:text-neutral-500',
    'focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-neutral-700 border border-neutral-600/50 text-neutral-100',
          'hover:border-neutral-500',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
        ],
        filled: [
          'bg-neutral-800 border-2 border-transparent text-neutral-100',
          'hover:bg-neutral-700',
          'focus:bg-neutral-750 focus:border-brand-400',
        ],
        ghost: [
          'bg-transparent border-0 text-neutral-100',
          'hover:bg-neutral-800',
          'focus:bg-neutral-800',
        ],
        underline: [
          'bg-transparent border-0 border-b-2 border-neutral-600 rounded-none text-neutral-100',
          'hover:border-neutral-500',
          'focus:border-brand-400',
          'px-0',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-3 text-sm rounded-lg',
        lg: 'h-10 px-4 text-sm rounded-lg',
        xl: 'h-12 px-4 text-base rounded-xl',
      },
      hasError: {
        true: [
          'border-error-500 focus:border-error-500 focus:ring-error-500/20',
          'dark:border-error-500 dark:focus:border-error-500',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Input = forwardRef(({
  className,
  variant,
  size,
  type = 'text',
  leftIcon,
  rightIcon,
  error,
  hint,
  label,
  required,
  ...props
}, ref) => {
  const hasError = !!error;
  const id = props.id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium mb-1.5',
            'text-neutral-300',
            hasError && 'text-error-400'
          )}
        >
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            inputVariants({ variant, size, hasError }),
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || hint) && (
        <p
          className={cn(
            'mt-1.5 text-xs',
            hasError ? 'text-error-400' : 'text-neutral-400'
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
const Textarea = forwardRef(({
  className,
  variant = 'default',
  error,
  hint,
  label,
  required,
  rows = 4,
  resize = 'vertical',
  ...props
}, ref) => {
  const hasError = !!error;
  const id = props.id || props.name;

  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium mb-1.5',
            'text-neutral-300',
            hasError && 'text-error-400'
          )}
        >
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={cn(
          inputVariants({ variant, hasError }),
          'min-h-[80px] py-2',
          resizeClass[resize],
          className
        )}
        {...props}
      />

      {(error || hint) && (
        <p
          className={cn(
            'mt-1.5 text-xs',
            hasError ? 'text-error-400' : 'text-neutral-400'
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Search Input with built-in search icon
const SearchInput = forwardRef(({
  className,
  onClear,
  value,
  ...props
}, ref) => (
  <Input
    ref={ref}
    type="search"
    value={value}
    leftIcon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    rightIcon={
      value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="hover:text-neutral-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null
    }
    className={className}
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

export {
  Input,
  Textarea,
  SearchInput,
  inputVariants,
};

export default Input;

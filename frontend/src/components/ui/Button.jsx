import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Button Component - Enterprise-grade button with variants
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" size="sm" loading>Loading...</Button>
 * <Button variant="ghost" leftIcon={<Icon />}>With Icon</Button>
 */

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium text-sm',
    'rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-brand-400 to-brand-500 text-neutral-900',
          'hover:from-brand-500 hover:to-brand-600',
          'active:from-brand-600 active:to-brand-700',
          'shadow-glow-brand hover:shadow-glow',
        ],
        secondary: [
          'bg-neutral-700 text-neutral-100',
          'hover:bg-neutral-600',
          'active:bg-neutral-500',
        ],
        outline: [
          'border border-neutral-600 bg-transparent text-neutral-300',
          'hover:bg-neutral-800 hover:border-neutral-500 hover:text-neutral-100',
          'active:bg-neutral-700',
        ],
        ghost: [
          'bg-transparent text-neutral-400',
          'hover:bg-neutral-800 hover:text-neutral-100',
          'active:bg-neutral-700',
        ],
        danger: [
          'bg-error-500 text-white',
          'hover:bg-error-600',
          'active:bg-error-700',
        ],
        success: [
          'bg-success-500 text-white',
          'hover:bg-success-600',
          'active:bg-success-700',
        ],
        link: [
          'bg-transparent text-brand-400 underline-offset-4',
          'hover:underline hover:text-brand-300',
          'p-0 h-auto',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-9 px-4 text-sm gap-2',
        lg: 'h-10 px-5 text-base gap-2',
        xl: 'h-12 px-6 text-base gap-2.5',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = forwardRef(({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  asChild = false,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="w-4 h-4" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Spinner component for loading state
const Spinner = ({ className }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Button Group component
const ButtonGroup = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex rounded-lg',
      '[&>button]:rounded-none',
      '[&>button:first-child]:rounded-l-lg',
      '[&>button:last-child]:rounded-r-lg',
      '[&>button:not(:first-child)]:-ml-px',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

ButtonGroup.displayName = 'ButtonGroup';

// Icon Button component
const IconButton = forwardRef(({
  className,
  variant = 'ghost',
  size = 'icon',
  'aria-label': ariaLabel,
  children,
  ...props
}, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    className={className}
    aria-label={ariaLabel}
    {...props}
  >
    {children}
  </Button>
));

IconButton.displayName = 'IconButton';

export { Button, ButtonGroup, IconButton, buttonVariants };
export default Button;

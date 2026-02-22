export default function CapraLogo({ size = 'md', className = '', variant = 'full' }) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  };

  const height = sizes[size] || sizes.md;

  // Use different logo variants
  const logoPath = variant === 'icon'
    ? import.meta.env.BASE_URL + 'ascend-icon.png'
    : variant === 'text'
    ? import.meta.env.BASE_URL + 'ascend-text.png'
    : import.meta.env.BASE_URL + 'ascend-logo.png';

  return (
    <img
      src={logoPath}
      alt="Ascend"
      className={`${height} w-auto object-contain ${className}`}
    />
  );
}

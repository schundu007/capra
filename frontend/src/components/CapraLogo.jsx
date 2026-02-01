export default function CapraLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  };

  const height = sizes[size] || sizes.md;

  // Use relative path for Electron compatibility
  const logoPath = import.meta.env.BASE_URL + 'capra.png';

  return (
    <img
      src={logoPath}
      alt="Capra"
      className={`${height} w-auto object-contain ${className}`}
    />
  );
}

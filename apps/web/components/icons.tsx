type IconProps = { size?: number; className?: string };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconBack({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconForward({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function IconHome({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}

export function IconSearch({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...stroke} cx="11" cy="11" r="6.5" />
      <path {...stroke} d="M16.5 16.5L21 21" />
    </svg>
  );
}

export function IconHistory({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...stroke} cx="12" cy="12" r="8" />
      <path {...stroke} d="M12 8v4.5l3 1.5" />
    </svg>
  );
}

export function IconPublish({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 16V5" />
      <path {...stroke} d="M8 8.5L12 4.5l4 4" />
      <path {...stroke} d="M5 19h14" />
    </svg>
  );
}

export function IconClose({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconGo({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M5 12h12" />
      <path {...stroke} d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconSort({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M8 9l4-4 4 4" />
      <path {...stroke} d="M8 15l4 4 4-4" />
    </svg>
  );
}

export function IconSortAsc({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 19V6" />
      <path {...stroke} d="M7 10l5-5 5 5" />
    </svg>
  );
}

export function IconSortDesc({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 5v13" />
      <path {...stroke} d="M7 14l5 5 5-5" />
    </svg>
  );
}

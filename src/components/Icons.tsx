export function Coin({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="cg" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff2a8" />
          <stop offset="45%" stopColor="#ffc531" />
          <stop offset="100%" stopColor="#c97a00" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#cg)" stroke="#a45f00" strokeWidth="1" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#b56d00" strokeWidth="1.4" opacity="0.8" />
      <path d="M12 7.5v9M9.8 9.6c0-1 1-1.6 2.2-1.6s2.2.6 2.2 1.6c0 2.2-4.4 1.2-4.4 3.6 0 1 1 1.6 2.2 1.6s2.2-.6 2.2-1.6" stroke="#9b5800" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Diamond({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M6 3h12l4 6-10 12L2 9z" fill="#37a8ff" />
      <path d="M2 9h20L12 21z" fill="#1b7fe0" />
      <path d="M6 3l2 6h8l2-6z" fill="#8fd6ff" />
      <path d="M8 9l4 12 4-12z" fill="#55bbff" />
      <path d="M6 3L2 9h6zM18 3l4 6h-6z" fill="#6cc8ff" />
      <path d="M7 4.5l1 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z" />
    </svg>
  );
}

export function RetryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 3.5v5h-5" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M6 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 6 3.5z" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#8fd3ff">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4" stroke="#8fd3ff" strokeWidth="2.2" />
    </svg>
  );
}

export function TrophyIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#8fd3ff">
      <path d="M7 3h10v2h4v3a4 4 0 0 1-4.3 4A5 5 0 0 1 13 15v3h3v3H8v-3h3v-3a5 5 0 0 1-3.7-3A4 4 0 0 1 3 8V5h4zm-2 4v1a2 2 0 0 0 2 2V7zm14 0h-2v3a2 2 0 0 0 2-2z" />
      <path d="M12 5.5l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 7.6l2-.3z" fill="#1d3a40" />
    </svg>
  );
}

export function GunIcon() {
  return (
    <svg width="32" height="30" viewBox="0 0 26 24" fill="#8fd3ff">
      <path d="M2 5h20v2h2v4h-2v1H11l-1 3H8l-1 6H2.5L4 12H2z" />
      <rect x="18" y="7.5" width="3" height="2" fill="#1d3a40" />
      <path d="M10 12h3v2a1 1 0 0 1-1 1h-2z" fill="#8fd3ff" />
    </svg>
  );
}

export function AdIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#8fd3ff">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M10 9v6l5-3z" fill="#1d3a40" />
    </svg>
  );
}

export function TvIcon({ size = 20, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3.5" fill={color} />
      <path d="M8 2.5 12 5l4-2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 9.2v5.6c0 .4.4.6.7.4l4.4-2.8a.5.5 0 0 0 0-.8l-4.4-2.8c-.3-.2-.7 0-.7.4z" fill="rgba(0,0,0,0.45)" />
    </svg>
  );
}

export function AdBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md bg-[#ffd23a] px-1.5 py-[1px] font-lilita text-[12px] leading-tight text-[#5a3200] shadow-[0_2px_0_#9a5a00] ${className}`}
    >
      <TvIcon size={12} color="#5a3200" /> AD
    </span>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Star({ size = 14, fill = "#ffd23a" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

export function Heart({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="#ff4d3a" />
      <path d="M7.5 8.5a2.5 2.5 0 0 1 2.5-1" stroke="#ffc2b8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

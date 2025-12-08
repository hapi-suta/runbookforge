export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6"/>
          <stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
      </defs>
      {/* Background rounded square */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad)"/>
      {/* Book/document shape */}
      <path d="M14 12h20c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V14c0-1.1.9-2 2-2z" fill="white" fillOpacity="0.2"/>
      {/* Page lines */}
      <rect x="16" y="17" width="12" height="2" rx="1" fill="white"/>
      <rect x="16" y="22" width="16" height="2" rx="1" fill="white"/>
      <rect x="16" y="27" width="10" height="2" rx="1" fill="white"/>
      {/* Checkmark indicator */}
      <circle cx="33" cy="33" r="7" fill="white"/>
      <path d="M30 33l2.5 2.5L36 31" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function LogoWithText({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <span className="text-xl font-bold text-white">RunbookForge</span>
    </div>
  );
}

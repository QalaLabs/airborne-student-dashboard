import React from 'react';

export interface AeroBotIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  active?: boolean;
  theme?: 'dark' | 'light' | 'gold';
}

/**
 * AeroBot AI Copilot Official Icon
 * Aviation-grade cockpit assistant motif:
 * - Commercial Aviator Headset (Dual ear cups, steel band, flexible boom microphone)
 * - Flight Deck HUD Visor (Artificial horizon reticle, telemetry pitch ladder)
 * - Pilot Gold Wings Emblem (#D8A027)
 * - Live Transponder / Radar Beacon indicator
 * Strictly adheres to Airborne Brand Book 2026.
 */
export const AeroBotIcon: React.FC<AeroBotIconProps> = ({
  size = 'md',
  className = '',
  active = true,
  theme = 'gold',
}) => {
  const pixelSizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const themeGradients = {
    gold: {
      primary: '#D8A027',
      secondary: '#F5D061',
      accent: '#DB241E',
      visor: '#00274C',
      visorGlow: '#38BDF8',
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#E2E8F0',
      accent: '#DB241E',
      visor: '#00274C',
      visorGlow: '#60A5FA',
    },
    dark: {
      primary: '#00274C',
      secondary: '#00172E',
      accent: '#DB241E',
      visor: '#00274C',
      visorGlow: '#D8A027',
    },
  };

  const colors = themeGradients[theme] || themeGradients.gold;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${pixelSizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="aeroBotWings" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="100%" stopColor="#D8A027" />
          </linearGradient>
          <linearGradient id="aeroBotVisor" x1="14" y1="16" x2="34" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00172E" />
            <stop offset="100%" stopColor="#00274C" />
          </linearGradient>
          <linearGradient id="aeroBotHeadset" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00274C" />
            <stop offset="50%" stopColor="#DB241E" />
            <stop offset="100%" stopColor="#00274C" />
          </linearGradient>
        </defs>

        {/* Aviator Headset Overhead Arch */}
        <path
          d="M 12 22 C 12 11, 36 11, 36 22"
          stroke="url(#aeroBotHeadset)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Headband Padding Cushions */}
        <rect x="20" y="8" width="8" height="2.5" rx="1.2" fill={colors.primary} />

        {/* Left Ear Cup */}
        <rect x="8" y="19" width="5.5" height="11" rx="2.5" fill="#00274C" stroke={colors.primary} strokeWidth="1.2" />
        <line x1="11" y1="21" x2="11" y2="28" stroke="#DB241E" strokeWidth="1.2" strokeLinecap="round" />

        {/* Right Ear Cup */}
        <rect x="34.5" y="19" width="5.5" height="11" rx="2.5" fill="#00274C" stroke={colors.primary} strokeWidth="1.2" />
        <line x1="37" y1="21" x2="37" y2="28" stroke="#DB241E" strokeWidth="1.2" strokeLinecap="round" />

        {/* Robot Aviator Helmet / Head Shell */}
        <rect
          x="14"
          y="15"
          width="20"
          height="19"
          rx="5"
          fill="#FFFFFF"
          stroke="#00274C"
          strokeWidth="1.8"
        />

        {/* Cockpit HUD Aviator Visor */}
        <rect
          x="16.5"
          y="19"
          width="15"
          height="9"
          rx="2.5"
          fill="url(#aeroBotVisor)"
          stroke="#00172E"
          strokeWidth="1"
        />

        {/* HUD Pitch Horizon / Telemetry Bar inside Visor */}
        <line x1="19" y1="23.5" x2="29" y2="23.5" stroke={colors.visorGlow} strokeWidth="1.2" strokeLinecap="round" />
        {/* HUD Targeting Reticle Crosshair */}
        <circle cx="24" cy="23.5" r="1.5" stroke="#DB241E" strokeWidth="1" fill="none" />
        <line x1="24" y1="20.5" x2="24" y2="22" stroke={colors.visorGlow} strokeWidth="0.8" />
        <line x1="24" y1="25" x2="24" y2="26.5" stroke={colors.visorGlow} strokeWidth="0.8" />

        {/* Aviator Boom Microphone curving towards mouth */}
        <path
          d="M 11 27 C 11 34, 18 36, 22 36"
          stroke="#00274C"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Microphone Pop Filter with Ascend Red Ring */}
        <circle cx="23" cy="36" r="2" fill="#DB241E" />
        <circle cx="23" cy="36" r="0.8" fill="#FFFFFF" />

        {/* Pilot Aviator Wings Emblem Beneath Helmet */}
        <path
          d="M 10 39 L 16 36 L 24 38 L 32 36 L 38 39 L 31 41 L 24 43 L 17 41 Z"
          fill="url(#aeroBotWings)"
          stroke="#00274C"
          strokeWidth="0.8"
        />

        {/* Central Wing Star / Red Diamond Rank */}
        <polygon points="24,36.5 25.5,39 24,41.5 22.5,39" fill="#DB241E" />

        {/* Top Antenna Transponder with Live Blinking Pulse */}
        <line x1="24" y1="14" x2="24" y2="9" stroke="#00274C" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="8" r="2" fill={active ? '#10B981' : '#DB241E'} />
      </svg>

      {/* Subtle Ambient Pulse Ring if active */}
      {active && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AeroBotIcon;

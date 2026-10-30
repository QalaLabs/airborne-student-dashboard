import React from 'react';

export interface AirborneLogoProps {
  variant?: 'full' | 'compact' | 'mark-only';
  theme?: 'light' | 'dark'; // 'light' is for dark backgrounds (white logo); 'dark' is for light backgrounds (primary logo)
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Airborne Aviation Academy Official Logo Component
 * Directly loaded from airborneaviation.in & official brand book assets:
 * - logo-white.png: Crisp transparent emblem + wordmark for dark/navy backgrounds (#00274C)
 * - logo-primary.png: Full color emblem + wordmark for light backgrounds
 */
export const AirborneLogo: React.FC<AirborneLogoProps> = ({
  theme = 'light',
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const isLight = theme === 'light'; // Light logo for dark backgrounds (header, footer, login hero)
  const logoSrc = isLight ? '/logo-white.png' : '/logo-primary.png';

  // Height sizing tokens tailored to the 298x144 natural aspect ratio (~2.07:1)
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-13 sm:h-16',
    xl: 'h-18 sm:h-22',
  };

  return (
    <div className={`inline-flex flex-col items-start select-none group ${className}`}>
      <div className="flex items-center gap-2">
        <picture>
          <source srcSet={isLight ? '/logo-white.webp' : '/logo-primary.webp'} type="image/webp" />
          <img
            src={logoSrc}
            alt="Airborne Aviation Academy"
            className={`${heightClasses[size]} w-auto object-contain transition-transform duration-200 group-hover:scale-102`}
            loading="eager"
            onError={(e) => {
              // Fallback to airborne-logo.png if needed
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('airborne-logo.png')) {
                target.src = '/airborne-logo.png';
              }
            }}
          />
        </picture>
      </div>

      {showSubtitle && (
        <span className={`text-[10px] tracking-wider italic font-brand-body mt-0.5 ${isLight ? 'text-slate-300' : 'text-[#8A9BB0]'}`}>
          "From Dream to Cockpit"
        </span>
      )}
    </div>
  );
};

export default AirborneLogo;

import React from 'react';
import aeroLogoImg from '../assets/aero-logo.jpg';

interface AeroLogoProps {
  customLogoUrl?: string;
  className?: string;
  licenseNo?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AeroLogo: React.FC<AeroLogoProps> = ({
  customLogoUrl,
  className = '',
  licenseNo = 'GL : 5905',
  showText = true,
  size = 'md',
}) => {
  const logoSource = customLogoUrl || aeroLogoImg;

  const imgHeightClass =
    size === 'sm'
      ? 'h-9'
      : size === 'lg'
      ? 'h-18'
      : 'h-13';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Direct image element using the exact logo image */}
      <img
        src={logoSource}
        alt="Aero Adventure Logo"
        className={`${imgHeightClass} w-auto object-contain shrink-0 mix-blend-multiply`}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline">
            <span
              className="font-extrabold text-[1.45rem] tracking-tight text-[#1E2E26] leading-none"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              AERO ADVENTURE
            </span>
          </div>
          <div className="flex items-center justify-between text-[0.68rem] tracking-[0.22em] font-extrabold text-[#2E4438] mt-1 uppercase leading-none">
            <span>TRAVEL AND TOURS</span>
            {licenseNo && (
              <span className="font-extrabold tracking-normal text-[#1E2E26] ml-2 px-1.5 py-0.5 bg-[#EAEFEA] rounded border border-[#C5D5C8] text-[0.64rem]">
                {licenseNo}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

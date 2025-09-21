import React from "react";
interface LogoIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}
export function LogoIcon({ className = "", size = 40, animate = false }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`earthGradient-${size}`} cx="0.3" cy="0.3">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="70%" stopColor="#29B6F6" />
          <stop offset="100%" stopColor="#0277BD" />
        </radialGradient>
        <linearGradient id={`orbitGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4CAF50" />
          <stop offset="50%" stopColor="#8BC34A" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="30"
        fill={`url(#earthGradient-${size})`}
        stroke="#0277BD"
        strokeWidth="1"
      />
      <path
        d="M35 40 Q45 35 55 40 Q60 45 55 50 Q45 55 35 50 Z"
        fill="#2E7D32"
        opacity="0.8"
      />
      <path
        d="M45 60 Q50 55 58 60 Q60 65 55 70 Q50 72 45 70 Z"
        fill="#388E3C"
        opacity="0.8"
      />
      <ellipse
        cx="40"
        cy="45"
        rx="4"
        ry="2"
        fill="#4CAF50"
        opacity="0.7"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="10"
        fill="none"
        stroke={`url(#orbitGradient-${size})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
        transform="rotate(-20 50 50)"
        style={animate ? {
          animation: 'spin 20s linear infinite',
          transformOrigin: '50px 50px'
        } : {}}
      />
      <ellipse
        cx="50"
        cy="50"
        rx="45"
        ry="15"
        fill="none"
        stroke="#00BCD4"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
        transform="rotate(30 50 50)"
        style={animate ? {
          animation: 'spin 30s linear infinite reverse',
          transformOrigin: '50px 50px'
        } : {}}
      />
      <g transform="translate(65, 30)">
        <path
          d="M0 15 L5 10 L10 12 L15 5 L20 7 L25 0"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 0 L25 0 L23 3"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="15" r="1" fill="#4CAF50" />
        <circle cx="5" cy="10" r="1" fill="#8BC34A" />
        <circle cx="10" cy="12" r="1" fill="#4CAF50" />
        <circle cx="15" cy="5" r="1" fill="#8BC34A" />
        <circle cx="20" cy="7" r="1" fill="#4CAF50" />
        <circle cx="25" cy="0" r="1" fill="#66BB6A" />
      </g>
      <circle cx="80" cy="45" r="1.5" fill="#4CAF50" opacity="0.8">
        {animate && (
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="20" cy="30" r="1" fill="#00BCD4" opacity="0.6">
        {animate && (
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
        )}
      </circle>
      {animate && (
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      )}
    </svg>
  );
}

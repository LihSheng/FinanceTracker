interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className = '' }: LogoProps) {
  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="45" r="28" stroke="#10B981" strokeWidth="4" />
          <text
            x="50"
            y="60"
            fontFamily="Arial, sans-serif"
            fontSize="40"
            fontWeight="bold"
            fill="#10B981"
            textAnchor="middle"
          >
            $
          </text>
          <path
            d="M 65 25 L 80 25 L 80 40"
            stroke="#10B981"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 80 25 L 70 30 L 75 35 Z" fill="#10B981" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <circle cx="50" cy="45" r="28" stroke="#10B981" strokeWidth="4" />
        <text
          x="50"
          y="60"
          fontFamily="Arial, sans-serif"
          fontSize="40"
          fontWeight="bold"
          fill="#10B981"
          textAnchor="middle"
        >
          $
        </text>
        <path
          d="M 65 25 L 80 25 L 80 40"
          stroke="#10B981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 80 25 L 70 30 L 75 35 Z" fill="#10B981" />
        <path
          d="M 15 75 L 30 70 L 45 78 L 60 65 L 75 68 L 85 60"
          stroke="#10B981"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
      <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
        <span className="text-base font-bold text-white">Finance Tracker</span>
      </div>
    </div>
  );
}

import React from 'react';

const GradientText = ({ 
  children, 
  className = '', 
  animationDuration = 2,
  gradientColors = [
    '#22c55e', // green-500
    '#16a34a', // green-600 (primary)
    '#10b981', // emerald-500
    '#34d399', // emerald-400
  ]
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .gradient-text-animated {
          background: linear-gradient(
            90deg,
            ${gradientColors[0]},
            ${gradientColors[1]},
            ${gradientColors[2]},
            ${gradientColors[3]},
            ${gradientColors[1]},
            ${gradientColors[0]}
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift ${animationDuration}s ease infinite;
        }
      `}</style>
      <span className={`gradient-text-animated ${className}`}>
        {children}
      </span>
    </>
  );
};

export default GradientText;


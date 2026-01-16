import React, { useState } from 'react';

const FloatingSupportButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    // You can customize this action - open a chat widget, navigate to contact page, etc.
    // For now, we'll just show an alert or you can integrate with a chat service
    window.open('mailto:support@reptilezsports.com', '_blank');
    // Or you could open a modal, navigate to contact page, etc.
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center size-14 sm:size-16 rounded-full bg-gradient-to-br from-primary via-green-500 to-primary text-white shadow-[0_4px_20px_rgba(0,255,0,0.3),0_0_40px_rgba(0,255,0,0.2)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_30px_rgba(0,255,0,0.4),0_0_60px_rgba(0,255,0,0.3)] group overflow-hidden"
      aria-label="Contact Support"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-green-500/80 to-primary/80 group-hover:from-primary group-hover:via-green-500 group-hover:to-primary transition-all duration-300"></div>
      
      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75"></div>
      
      {/* Icon */}
      <span className="material-symbols-outlined text-2xl sm:text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110">
        message
      </span>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap shadow-lg border border-primary/30 animate-[slideDown_0.2s_ease-out]">
          Need Help?
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-black/90"></div>
        </div>
      )}
    </button>
  );
};

export default FloatingSupportButton;


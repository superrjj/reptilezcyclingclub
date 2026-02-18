import React, { useState, useEffect } from 'react';

const MaintenanceScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Calculate progress based on date range
    const calculateProgress = () => {
      const startDate = new Date('2026-02-15T00:00:00');
      const endDate = new Date('2026-02-22T23:59:59');
      const now = new Date();
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      
      let progressPercent = (elapsed / totalDuration) * 100;
      
      // Clamp between 0 and 100
      progressPercent = Math.max(0, Math.min(100, progressPercent));
      
      setProgress(progressPercent);
    };
    
    // Calculate immediately
    calculateProgress();
    
    // Update every minute
    const interval = setInterval(calculateProgress, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className={`relative text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Logo Container with subtle animation */}
        <div className="mb-6 sm:mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative transform transition-transform duration-300 hover:scale-105">
              <img 
                src="/rcc1.png" 
                alt="RCC Logo" 
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-gray-900 text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-4">
          Under Maintenance
        </h1>

        {/* Subheading */}
        <p className="text-gray-600 text-lg sm:text-xl md:text-2xl font-semibold mb-3 max-w-2xl mx-auto leading-relaxed">
          We're currently working on improving the site
        </p>

        {/* Description */}
        <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-6 max-w-xl mx-auto leading-relaxed">
          Our team is implementing exciting updates to enhance your experience. 
          We'll be back online shortly with a better, faster, and more intuitive platform.
        </p>

        {/* Date Range Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-200 shadow-sm mb-6 hover:shadow-md transition-shadow duration-300">
          <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
          <span className="text-gray-700 text-xs sm:text-sm font-semibold">
            February 15 - February 22, 2026
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-green-500 to-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-3 font-medium tracking-wide uppercase">
            Work in progress... {progress.toFixed(1)}%
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200/80">
          <p className="text-gray-500 text-xs sm:text-sm mb-1">
            Developed by{' '}
            <span className="font-bold text-gray-800 bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              John Harvee Quirido
            </span>
          </p>
          <p className="text-gray-400 text-xs font-medium">
            IT Student
          </p>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
    </div>
  );
};

export default MaintenanceScreen;


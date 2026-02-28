import React, { useState, useEffect } from 'react';

const MaintenanceScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const endDate = new Date('2026-03-02T10:00:00');
    
    // Calculate progress based on date range
    const calculateProgress = () => {
      const startDate = new Date('2026-02-27T21:20:00');
      const now = new Date();
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      
      let progressPercent = (elapsed / totalDuration) * 100;
      
      // Clamp between 0 and 100
      progressPercent = Math.max(0, Math.min(100, progressPercent));
      
      setProgress(progressPercent);
    };
    
    // Calculate time remaining
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeRemaining({ hours, minutes, seconds });
      } else {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    // Calculate immediately
    calculateProgress();
    calculateTimeRemaining();
    
    // Update progress every minute
    const progressInterval = setInterval(calculateProgress, 60000);
    
    // Update timer every second
    const timerInterval = setInterval(calculateTimeRemaining, 1000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className={`relative text-center px-4 sm:px-6 max-w-3xl mx-auto py-4 sm:py-6 transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Logo Container with subtle animation */}
        <div className="mb-4 sm:mb-5">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative transform transition-transform duration-300 hover:scale-105">
              <img 
                src="/rcc1.png" 
                alt="RCC Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-gray-900 text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3 sm:mb-4">
          Under Maintenance
        </h1>

        {/* Subheading */}
        <p className="text-gray-600 text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 max-w-2xl mx-auto leading-relaxed">
          We're currently working on improving the site
        </p>

        {/* Description */}
        <p className="text-gray-500 text-xs sm:text-sm md:text-base mb-4 sm:mb-5 max-w-xl mx-auto leading-relaxed px-2">
          Our team is implementing exciting updates to enhance your experience. 
          We'll be back online shortly with a better, faster, and more intuitive platform.
        </p>

        {/* Date Range Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-4 sm:mb-5 hover:shadow-md transition-shadow duration-300">
          <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
          <span className="text-gray-700 text-xs sm:text-sm font-semibold">
            February 27 - March 2, 2026
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="mb-4 sm:mb-5 max-w-md mx-auto px-4">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-green-500 to-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-2 font-medium tracking-wide uppercase">
            Work in progress... {progress.toFixed(1)}%
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-5 sm:mb-6 max-w-xl mx-auto px-4">
          <div className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-none mb-1">
                {String(timeRemaining.hours).padStart(2, '0')}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Hours
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-400">:</div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-none mb-1">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Minutes
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-400">:</div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-none mb-1">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Seconds
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2 font-medium tracking-wide">
            Time remaining until maintenance ends
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200/80 mt-4 sm:mt-5">
          <p className="text-gray-500 text-xs mb-1">
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

import React from 'react';

const MaintenanceScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="text-center px-4 sm:px-6 md:px-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-5xl sm:text-6xl md:text-7xl">
              construction
            </span>
          </div>
          <h1 className="text-gray-900 text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-4">
            Under Maintenance
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl md:text-2xl font-medium">
            We're currently working on improving the site.
          </p>
          <p className="text-gray-500 text-base sm:text-lg mt-4">
            Please check back soon!
          </p>
          <p className="text-gray-400 text-sm sm:text-base mt-6 font-medium">
            From February 15 to February 28, 2026
          </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm sm:text-base">
            Developer: <span className="font-semibold text-gray-700">John Harvee Quirido</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen;


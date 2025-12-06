import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle tab visibility changes, route changes, and scroll position restoration
 * @param {Function} refreshCallback - Function to call when tab becomes visible or route changes (should fetch fresh data)
 * @param {boolean} enabled - Whether to enable this feature (default: true)
 */
export const useTabVisibility = (refreshCallback, enabled = true) => {
  const location = useLocation();
  const scrollPositionsRef = useRef({}); // Store scroll positions per route
  const isInitialMountRef = useRef(true);
  const scrollContainerRef = useRef(null);
  const refreshCallbackRef = useRef(refreshCallback);
  const previousPathRef = useRef(location.pathname);

  // Keep callback ref updated
  useEffect(() => {
    refreshCallbackRef.current = refreshCallback;
  }, [refreshCallback]);

  useEffect(() => {
    if (!enabled) return;

    // Find the scrollable container (could be window or a specific element)
    const findScrollContainer = () => {
      // Check if there's a main scrollable container
      const mainContent = document.querySelector('main[class*="overflow"]') || 
                         document.querySelector('[class*="overflow-y-auto"]') ||
                         document.querySelector('[class*="overflow-y-scroll"]');
      return mainContent || window;
    };

    const getScrollPosition = () => {
      if (scrollContainerRef.current === window || !scrollContainerRef.current) {
        return window.scrollY || document.documentElement.scrollTop;
      }
      return scrollContainerRef.current.scrollTop;
    };

    const setScrollPosition = (position) => {
      if (scrollContainerRef.current === window || !scrollContainerRef.current) {
        window.scrollTo({
          top: position,
          behavior: 'instant'
        });
      } else {
        scrollContainerRef.current.scrollTop = position;
      }
    };

    // Initialize scroll container
    scrollContainerRef.current = findScrollContainer();

    // Handle route changes
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;
    
    // If route changed (not initial mount)
    if (!isInitialMountRef.current && currentPath !== previousPath) {
      // Save scroll position of previous route
      const scrollPos = getScrollPosition();
      if (scrollPos > 0) {
        scrollPositionsRef.current[previousPath] = scrollPos;
      }
      
      // Restore scroll position for current route and refresh
      const savedPosition = scrollPositionsRef.current[currentPath] || 0;
      
      // Restore scroll position immediately
      if (savedPosition > 0) {
        setScrollPosition(savedPosition);
        requestAnimationFrame(() => {
          setScrollPosition(savedPosition);
        });
      }
      
      // Refresh data
      const callback = refreshCallbackRef.current;
      if (callback && typeof callback === 'function') {
        const restoreAfterRefresh = () => {
          requestAnimationFrame(() => {
            const pos = scrollPositionsRef.current[currentPath] || 0;
            if (pos > 0) {
              setScrollPosition(pos);
            }
          });
        };

        try {
          const result = callback();
          if (result && typeof result.then === 'function') {
            result.then(restoreAfterRefresh).catch(restoreAfterRefresh);
          } else {
            restoreAfterRefresh();
          }
        } catch (error) {
          console.error('Error in refresh callback:', error);
          restoreAfterRefresh();
        }
      }
    }
    
    previousPathRef.current = currentPath;

    // Save scroll position when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - save current scroll position for current route
        const currentPath = location.pathname;
        const scrollPos = getScrollPosition();
        if (scrollPos > 0) {
          scrollPositionsRef.current[currentPath] = scrollPos;
        }
      } else {
        // Tab is visible - restore scroll position for current route
        scrollContainerRef.current = findScrollContainer();
        const currentPath = location.pathname;
        const savedPosition = scrollPositionsRef.current[currentPath] || 0;
        
        if (savedPosition > 0) {
          setScrollPosition(savedPosition);
          requestAnimationFrame(() => {
            setScrollPosition(savedPosition);
          });
        }
        
        // Refresh data if not initial mount
        if (!isInitialMountRef.current) {
          const callback = refreshCallbackRef.current;
          if (callback && typeof callback === 'function') {
            const restoreAfterRefresh = () => {
              requestAnimationFrame(() => {
                const pos = scrollPositionsRef.current[currentPath] || 0;
                if (pos > 0) {
                  setScrollPosition(pos);
                }
              });
            };

            try {
              const result = callback();
              if (result && typeof result.then === 'function') {
                result.then(restoreAfterRefresh).catch((err) => {
                  console.error('Error refreshing:', err);
                  restoreAfterRefresh();
                });
              } else {
                restoreAfterRefresh();
              }
            } catch (error) {
              console.error('Error in refresh callback:', error);
              restoreAfterRefresh();
            }
          }
        }
      }
    };

    // Also save scroll position on scroll (for better accuracy)
    const handleScroll = () => {
      if (!document.hidden) {
        const currentPath = location.pathname;
        const scrollPos = getScrollPosition();
        if (scrollPos > 0) {
          scrollPositionsRef.current[currentPath] = scrollPos;
        }
      }
    };

    // Mark initial mount as complete immediately (no delay needed)
    // Use requestAnimationFrame to ensure it happens after first render
    requestAnimationFrame(() => {
      isInitialMountRef.current = false;
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add scroll listener to the appropriate container
    if (scrollContainerRef.current === window) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (scrollContainerRef.current === window) {
        window.removeEventListener('scroll', handleScroll);
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [location.pathname, enabled]); // Include location.pathname to detect route changes
};


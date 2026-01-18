import React, { useEffect, useState, useRef } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';
import GradientText from '../../components/ui/gradient-text';

const Gallery = ({ refreshFunctionsRef }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const maintenanceData = await getMaintenanceByType('Gallery');
      if (maintenanceData && maintenanceData.length > 0) {
        const galleryImages = maintenanceData.map(item => ({
          src: item.image_url,
          alt: 'Gallery image'
        }));
        setImages(galleryImages);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  useEffect(() => {
    if (refreshFunctionsRef?.current) {
      const index = refreshFunctionsRef.current.length;
      refreshFunctionsRef.current.push(fetchGalleryImages);
      return () => {
        refreshFunctionsRef.current = refreshFunctionsRef.current.filter((_, i) => i !== index);
      };
    }
  }, [refreshFunctionsRef]);

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      const cardElement = carouselRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(-1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex < images.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      setSelectedImageIndex(nextIndex);
      setSelectedImage(images[nextIndex]);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex > 0) {
      const prevIndex = selectedImageIndex - 1;
      setSelectedImageIndex(prevIndex);
      setSelectedImage(images[prevIndex]);
    }
  };

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setSelectedImageIndex(-1);
      } else if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        e.preventDefault();
        const nextIndex = selectedImageIndex + 1;
        setSelectedImageIndex(nextIndex);
        setSelectedImage(images[nextIndex]);
      } else if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        e.preventDefault();
        const prevIndex = selectedImageIndex - 1;
        setSelectedImageIndex(prevIndex);
        setSelectedImage(images[prevIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, selectedImageIndex, images]);

  useEffect(() => {
    if (!showGalleryDialog) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowGalleryDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showGalleryDialog]);

  return (
    <section className="flex flex-col items-center gap-8 py-12 px-4">
      {/* Animated Title with Gradient */}
      <div className={`text-center space-y-2 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}>
        <GradientText
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          animationDuration={2}
        >
          Photos of D&R Reptilez Sports
        </GradientText>
        <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
      </div>

      {loading ? (
        <div className="w-full max-w-7xl mx-auto">
          <div className="relative">
            <div className="flex gap-3 md:gap-5 overflow-x-hidden px-4 py-2">
              <div className="flex items-center gap-3 md:gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className={`relative rounded-xl overflow-hidden h-[350px] md:h-[450px] bg-black/20 ${
                      i === 1 ? 'w-[320px] md:w-[450px]' : 'w-[100px] md:w-[160px]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-zinc-900 shimmer-bg rounded-lg" style={{
                      top: i === 1 ? '12px' : '8px',
                      left: i === 1 ? '12px' : '8px',
                      right: i === 1 ? '12px' : '8px',
                      bottom: i === 1 ? '12px' : '8px',
                    }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="w-full py-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/40 border border-primary/20 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-primary text-4xl">photo_library</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-white/80">No gallery images uploaded yet</p>
              <p className="text-sm mt-2 text-white/50">Please upload images in the admin panel</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={`w-full max-w-7xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
            <div className="relative">
              {/* Previous Arrow */}
              {activeIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
                  aria-label="Previous"
                >
                  <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                </button>
              )}

              {/* Carousel Container */}
              <div 
                ref={carouselRef}
                className="gallery-carousel flex gap-3 md:gap-5 overflow-x-auto scroll-smooth py-2"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  paddingLeft: windowWidth < 768 ? '1rem' : '1rem',
                  paddingRight: windowWidth < 768 ? '1rem' : '1rem',
                }}
              >
                <style>{`
                  .gallery-carousel::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="flex items-center justify-center gap-2 md:gap-5">
                  {images.map((image, index) => {
                    const isActive = activeIndex === index;
                    const isMobile = windowWidth < 768;
                    const isPrev = isMobile && index === activeIndex - 1;
                    const isNext = isMobile && index === activeIndex + 1;
                    
                    // On mobile: show active, prev, and next only
                    if (isMobile && !isActive && !isPrev && !isNext) {
                      return null;
                    }
                    
                    // Responsive widths: mobile shows 3 cards (prev peek, active expanded, next peek)
                    let cardWidth;
                    if (isMobile) {
                      if (isActive) {
                        cardWidth = windowWidth <= 375 ? 280 : windowWidth <= 640 ? 300 : 320;
                      } else {
                        // Prev or Next: show peek (50px for both)
                        cardWidth = 50;
                      }
                    } else {
                      // Desktop: same as before
                      cardWidth = isActive 
                        ? (windowWidth <= 768 ? 400 : 450)
                        : (windowWidth <= 768 ? 140 : 160);
                    }
                    
                    const cardHeight = 'h-[350px] md:h-[450px]';
                    const padding = isActive ? 12 : 8;

                    return (
                      <div
                        key={`${image.src}-${index}`}
                        data-index={index}
                        onClick={() => setActiveIndex(index)}
                        className={`relative cursor-pointer transition-all duration-400 ease-out rounded-xl overflow-hidden ${cardHeight} bg-black/20 ${
                          isMobile && isActive ? 'z-10' : 'z-0'
                        }`}
                        style={{
                          width: `${cardWidth}px`,
                          minWidth: `${cardWidth}px`,
                          transitionDuration: '0.4s',
                          marginLeft: isMobile && isPrev ? 'auto' : '0',
                          marginRight: isMobile && isNext ? 'auto' : '0',
                        }}
                      >
                        {/* Image with padding */}
                        <div
                          className="absolute bg-cover bg-center rounded-lg"
                          style={{
                            backgroundImage: `url(${image.src})`,
                            top: `${padding}px`,
                            left: `${padding}px`,
                            right: `${padding}px`,
                            bottom: `${padding}px`,
                            transform: isActive ? 'scale(1)' : 'scale(1.1)',
                            transition: 'all 0.4s ease-out',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Arrow */}
              {activeIndex < images.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
                  aria-label="Next"
                >
                  <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                </button>
              )}

              {/* Scroll Slider Dots at Bottom */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        activeIndex === index
                          ? 'bg-primary w-8 h-2'
                          : 'bg-white/30 hover:bg-white/50 w-2 h-2'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Gallery Dialog - Enhanced */}
      {showGalleryDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg px-4 animate-fadeIn"
          onClick={() => setShowGalleryDialog(false)}
        >
          <div 
            className="w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-primary/30 bg-black/90 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(34,197,94,0.3)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/20">
              <div>
                <h2 className="text-3xl font-black text-white bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  Full Gallery
                </h2>
                <p className="text-white/60 text-sm mt-1">{images.length} images</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryDialog(false)}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all duration-300 flex items-center justify-center hover:rotate-90 hover:scale-110"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <div 
                  key={`${image.src}-${index}`}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setSelectedImage(image);
                    setShowGalleryDialog(false);
                  }}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden group cursor-pointer border-2 border-primary/20 hover:border-primary/60 transition-all duration-500 hover:scale-105 hover:rotate-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={image.alt}
                    src={image.src}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Number badge */}
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox - Enhanced */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
          onClick={handleCloseModal}
        >
          {/* Blurred Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${selectedImage.src})`,
              filter: 'blur(10px)',
              transform: 'scale(1.1)',
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/80" />

          {/* Close Button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-6 right-6 z-10 w-14 h-14 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:rotate-90 hover:scale-110 shadow-lg"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Previous Button */}
          {selectedImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-6 z-10 w-14 h-14 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
          )}

          {/* Next Button */}
          {selectedImageIndex < images.length - 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-6 z-10 w-14 h-14 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
          )}

          {/* Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-8 md:p-16 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(34,197,94,0.4)] border border-primary/20"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full bg-black/70 backdrop-blur-md border border-primary/30 text-white text-base font-bold shadow-lg">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(24, 24, 27, 1) 0%,
            rgba(34, 197, 94, 0.1) 50%,
            rgba(24, 24, 27, 1) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
};

export default Gallery;
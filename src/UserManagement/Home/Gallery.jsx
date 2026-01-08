import React, { useEffect, useState } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';

const Gallery = ({ refreshFunctionsRef }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

  const displayedImages = images.slice(0, 6);
  const hasMoreImages = images.length > 6;

  const handleImageClick = (image, index) => {
    const actualIndex = images.findIndex(img => img.src === image.src);
    setSelectedImageIndex(actualIndex);
    setSelectedImage(image);
  };

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
        <h2 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight bg-gradient-to-r from-primary via-green-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          From the Roads
        </h2>
        <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="relative w-full aspect-square rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-zinc-900 shimmer-bg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
          ))}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {displayedImages.map((image, index) => (
              <div 
                key={`${image.src}-${index}`}
                onClick={() => handleImageClick(image, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative w-full aspect-square rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 border-2 border-primary/20 hover:border-primary/60 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {/* Gradient glow background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/30 via-emerald-500/30 to-green-500/30 blur-xl transition-opacity duration-500 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}></div>

                {/* Image */}
                <img 
                  className="relative w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                  alt={image.alt}
                  src={image.src}
                  loading="lazy"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Zoom icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                  <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                    <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary to-transparent"></div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-transparent"></div>
                </div>

                {/* Bottom shine */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </div>
            ))}
          </div>

          {hasMoreImages && (
            <button
              onClick={() => setShowGalleryDialog(true)}
              className="relative mt-4 px-10 py-4 bg-gradient-to-r from-primary via-green-600 to-primary bg-[length:200%_100%] bg-[position:0%_0%] hover:bg-[position:100%_0%] text-white text-base font-black rounded-full transition-all duration-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:scale-110 border-2 border-green-400/30 hover:border-green-400/60 group/btn overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              <span className="relative flex items-center gap-2">
                <span>See More</span>
                <span className="material-symbols-outlined text-xl transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span>
              </span>
            </button>
          )}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-xl animate-fadeIn"
          onClick={handleCloseModal}
        >
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
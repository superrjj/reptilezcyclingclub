import React, { useEffect, useState } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';

const Gallery = ({ refreshFunctionsRef }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

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
  }, []);

  // Register refresh function
  useEffect(() => {
    if (refreshFunctionsRef?.current) {
      const index = refreshFunctionsRef.current.length;
      refreshFunctionsRef.current.push(fetchGalleryImages);
      return () => {
        refreshFunctionsRef.current = refreshFunctionsRef.current.filter((_, i) => i !== index);
      };
    }
  }, [refreshFunctionsRef]);

  const displayedImages = showAll ? images : images.slice(0, 6);
  const hasMoreImages = images.length > 6;

  const handleImageClick = (image, index) => {
    // Find the actual index in the full images array
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

  // Handle keyboard navigation
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

  return (
    <section className="flex flex-col items-center gap-6 py-8 px-4">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">From the Roads</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full aspect-square rounded-xl bg-zinc-900 animate-pulse shimmer-bg"></div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="w-full py-12 text-center text-white/60">
          <p className="text-lg font-semibold">No gallery images uploaded yet</p>
          <p className="text-sm mt-2">Please upload images in the admin panel</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
            {displayedImages.map((image, index) => (
              <div 
                key={`${image.src}-${index}`}
                onClick={() => handleImageClick(image, index)}
                className="relative w-full aspect-square rounded-xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <img 
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90" 
                  alt={image.alt}
                  src={image.src}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
          {hasMoreImages && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-6 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/20"
            >
              {showAll ? 'Show Less' : 'See More'}
            </button>
          )}
        </>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Previous Button */}
          {selectedImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
          )}

          {/* Next Button */}
          {selectedImageIndex < images.length - 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
          )}

          {/* Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm font-medium">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;


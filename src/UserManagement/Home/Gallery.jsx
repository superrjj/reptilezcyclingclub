import React, { useEffect, useState, useRef } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';
import GradientText from '../../components/ui/gradient-text';
import { LogoCloudCarousel } from '../../components/ui/logo-cloud-carousel';

// Set A — scrolls LEFT (7 unique logos)
const logosRowA = [
  { name: 'Reptilez Cycling Club', darkUrl: '/rcc1.png' },
  { name: 'Reptilez Cycling Club', darkUrl: '/rcc2.png' },
  { name: 'Reptilez Cycling Club', darkUrl: '/rcc3.png' },
  { name: 'Reptilez Cycling Club', darkUrl: '/rcc4-with-bg.jpg' },
  { name: 'Tarlac Cycling Community', darkUrl: '/tarlac.png' },
  { name: 'Drop & Roll', darkUrl: '/dropnroll.jpg' },
  { name: 'Margin Cycling', darkUrl: '/margin-logo.jpg' },
];

// Set B — scrolls RIGHT (6 unique logos, completely different from Set A)
const logosRowB = [
  { name: 'Izarc Cycling Garments', darkUrl: '/izarc-logo.jpg' },
  { name: 'Pangasinan Ang Galing', darkUrl: '/pangasinan-logo.png' },
  { name: 'Tar1ac', darkUrl: '/tar1ac-logo.jpg' },
  { name: 'Euro 4', darkUrl: '/euro4-logo.jpg' },
  { name: 'Capas, Tarlac', darkUrl: '/capas-logo.jpg' },
  { name: 'D&D', darkUrl: '/d-d-logo.jpg' },
];

const Gallery = ({ refreshFunctionsRef }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isSponsorsVisible, setIsSponsorsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const carouselRef = useRef(null);
  const sectionRef = useRef(null);
  const sponsorsRef = useRef(null);
  const autoPlayRef = useRef(null);

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
    if (images.length <= 1 || isPaused) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(autoPlayRef.current);
  }, [images.length, isPaused]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsSectionVisible(entry.isIntersecting)),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsSponsorsVisible(entry.isIntersecting)),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    const currentRef = sponsorsRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); observer.disconnect(); };
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

  useEffect(() => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (!card) return;
    const container = carouselRef.current;
    const targetScrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
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
      if (e.key === 'Escape') { setSelectedImage(null); setSelectedImageIndex(-1); }
      else if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        e.preventDefault();
        const nextIndex = selectedImageIndex + 1;
        setSelectedImageIndex(nextIndex); setSelectedImage(images[nextIndex]);
      } else if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        e.preventDefault();
        const prevIndex = selectedImageIndex - 1;
        setSelectedImageIndex(prevIndex); setSelectedImage(images[prevIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = 'unset'; };
  }, [selectedImage, selectedImageIndex, images]);

  useEffect(() => {
    if (!showGalleryDialog) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setShowGalleryDialog(false); };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = 'unset'; };
  }, [showGalleryDialog]);

  return (
    <section
      ref={sectionRef}
      data-animate
      className={`flex flex-col items-center gap-8 py-12 transition-all duration-700 ease-out ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Title */}
      <div className={`text-center space-y-2 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}>
        <GradientText
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight"
          animationDuration={2}
        >
          D&amp;R Margin Racing Photos
        </GradientText>
        <div className="w-24 h-1 mx-auto bg-black/10 rounded-full"></div>
      </div>

      {loading ? (
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex gap-3 md:gap-5 overflow-x-hidden px-4 py-2">
            <div className="flex items-center gap-3 md:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden h-[350px] md:h-[450px] bg-[#F5F5F5] ${
                    i === 1 ? 'w-[320px] md:w-[450px]' : 'w-[100px] md:w-[160px]'
                  }`}
                >
                  <div className="absolute inset-0 shimmer-bg rounded-lg" style={{
                    top: i === 1 ? '12px' : '8px', left: i === 1 ? '12px' : '8px',
                    right: i === 1 ? '12px' : '8px', bottom: i === 1 ? '12px' : '8px',
                  }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="w-full py-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-reptilez-green-50 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-reptilez-green-600 text-4xl">photo_library</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#111827]">No gallery images uploaded yet</p>
              <p className="text-sm mt-2 text-[#374151]">Please upload images in the admin panel</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full max-w-7xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative">
            <div
              ref={carouselRef}
              className="gallery-carousel flex gap-3 md:gap-5 overflow-x-auto scroll-smooth py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingLeft: '1rem', paddingRight: '1rem' }}
            >
              <style>{`.gallery-carousel::-webkit-scrollbar { display: none; }`}</style>
              <div className="flex items-center justify-center gap-2 md:gap-5">
                {images.map((image, index) => {
                  const isActive = activeIndex === index;
                  const isMobile = windowWidth < 768;
                  const isPrev = isMobile && index === activeIndex - 1;
                  const isNext = isMobile && index === activeIndex + 1;
                  if (isMobile && !isActive && !isPrev && !isNext) return null;

                  let cardWidth;
                  if (isMobile) {
                    cardWidth = isActive ? (windowWidth <= 375 ? 280 : windowWidth <= 640 ? 300 : 320) : 50;
                  } else {
                    cardWidth = isActive ? (windowWidth <= 768 ? 400 : 450) : (windowWidth <= 768 ? 140 : 160);
                  }
                  const padding = isActive ? 12 : 8;

                  return (
                    <div
                      key={`${image.src}-${index}`}
                      data-index={index}
                      onClick={() => setActiveIndex(index)}
                      className={`relative cursor-pointer transition-all duration-400 ease-out rounded-xl overflow-hidden h-[350px] md:h-[450px] bg-transparent ${isMobile && isActive ? 'z-10' : 'z-0'}`}
                      style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px`, transitionDuration: '0.4s', marginLeft: isMobile && isPrev ? 'auto' : '0', marginRight: isMobile && isNext ? 'auto' : '0' }}
                    >
                      <div
                        className="absolute bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: `url(${image.src})`, top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, transform: isActive ? 'scale(1)' : 'scale(1.1)', transition: 'all 0.4s ease-out' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2 px-3 py-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all duration-300 rounded-full ${activeIndex === index ? 'bg-[#111827] w-8 h-2' : 'bg-[#E5E5E5] hover:bg-[#D4D4D4] w-2 h-2'}`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery Dialog */}
      {showGalleryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fadeIn" onClick={() => setShowGalleryDialog(false)}>
          <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E5E5E5] bg-white p-8 shadow-xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E5E5]">
              <div>
                <h2 className="text-3xl font-black text-[#111827]">Full Gallery</h2>
                <p className="text-[#374151] text-sm mt-1">{images.length} images</p>
              </div>
              <button type="button" onClick={() => setShowGalleryDialog(false)} className="w-12 h-12 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#374151] hover:text-[#111827] transition-all duration-300 flex items-center justify-center hover:rotate-90 hover:scale-110">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <div key={`${image.src}-${index}`} onClick={() => { setSelectedImageIndex(index); setSelectedImage(image); setShowGalleryDialog(false); }} className="relative w-full aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-[#E5E5E5] transition-all duration-500 hover:scale-105">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={image.alt} src={image.src} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-[#E5E5E5] flex items-center justify-center text-[#111827] font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn" onClick={handleCloseModal}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${selectedImage.src})`, filter: 'blur(10px)', transform: 'scale(1.1)' }} />
          <div className="absolute inset-0 bg-white/90" />
          <button onClick={handleCloseModal} className="absolute top-6 right-6 z-10 w-14 h-14 rounded-full bg-white hover:bg-[#F5F5F5] backdrop-blur-sm border border-[#E5E5E5] text-[#374151] hover:text-[#111827] transition-all duration-300 flex items-center justify-center hover:rotate-90 hover:scale-110 shadow-sm" aria-label="Close">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          {selectedImageIndex > 0 && (
            <button onClick={handlePrevImage} className="absolute left-6 z-10 w-14 h-14 rounded-full bg-white hover:bg-[#F5F5F5] backdrop-blur-sm border border-[#E5E5E5] text-[#374151] hover:text-[#111827] transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-sm" aria-label="Previous image">
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
          )}
          {selectedImageIndex < images.length - 1 && (
            <button onClick={handleNextImage} className="absolute right-6 z-10 w-14 h-14 rounded-full bg-white hover:bg-[#F5F5F5] backdrop-blur-sm border border-[#E5E5E5] text-[#374151] hover:text-[#111827] transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-sm" aria-label="Next image">
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
          )}
          <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} className="max-w-full max-h-full object-contain rounded-2xl shadow-xl" />
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full bg-white/95 backdrop-blur-md border border-[#E5E5E5] text-[#111827] text-base font-bold shadow-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* ── Sponsors / Dual Carousel ── */}
      <div
        ref={sponsorsRef}
        className={`w-full max-w-7xl mx-auto transition-all duration-700 ease-out ${
          isSponsorsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-center space-y-2 mb-1">
            <GradientText
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight"
              animationDuration={2}
            >
              D&amp;R Margin Racing Sponsors
            </GradientText>
            <div className="w-24 h-1 mx-auto bg-black/10 rounded-full"></div>
          </div>

          {/* Row A — scrolls LEFT */}
          <LogoCloudCarousel
            logos={logosRowA}
            variant="card"
            direction="left"
            speedSeconds={50}
            className="w-full mt-6"
          />

          {/* Row B — scrolls RIGHT */}
          <LogoCloudCarousel
            logos={logosRowB}
            variant="card"
            direction="right"
            speedSeconds={50}
            className="w-full mt-6"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .shimmer-bg {
          background: linear-gradient(90deg, rgba(250,250,250,1) 0%, rgba(245,245,245,0.9) 50%, rgba(250,250,250,1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </section>
  );
};

export default Gallery;
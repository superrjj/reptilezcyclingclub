import React, { useState, useEffect, useRef } from 'react';
import { getMaintenanceByType, createMaintenance, deleteMaintenance } from '../../../services/maintenanceService';
import { uploadImage, deleteImage } from '../../../services/imageUploadService';
import AdminLayout from '../AdminLayout';
import { usePageMeta } from '../../../hooks/usePageMeta';

const FileMaintenance = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ hero: false, gallery: false });
  const [selectedFiles, setSelectedFiles] = useState({ hero: null, gallery: null });
  const [imagePreviews, setImagePreviews] = useState({ hero: '', gallery: '' });
  const heroFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    type: 'success',
    message: '',
  });

  usePageMeta('File Maintenance');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const [heroData, galleryData] = await Promise.all([
        getMaintenanceByType('Hero'),
        getMaintenanceByType('Gallery'),
      ]);
      setHeroImages(heroData || []);
      setGalleryImages(galleryData || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleImageFile = (file, type) => {
    if (!file) {
      console.log('No file provided');
      return;
    }

    console.log('File selected:', file.name, 'Type:', type);

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      showToast('error', 'Image size should be less than 30MB');
      return;
    }

    setSelectedFiles(prev => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      showToast('error', 'Error reading image file');
    };
    reader.onloadend = () => {
      if (reader.result) {
        setImagePreviews(prev => ({ ...prev, [type]: reader.result }));
        console.log('Preview set successfully for', type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected in input');
      return;
    }
    console.log('handleImageUpload called with type:', type, 'file:', file.name);
    handleImageFile(file, type);
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleImageFile(file, type);
  };

  const removeImage = (type) => {
    setSelectedFiles(prev => ({ ...prev, [type]: null }));
    setImagePreviews(prev => ({ ...prev, [type]: '' }));
    if (type === 'hero' && heroFileInputRef.current) {
      heroFileInputRef.current.value = '';
    }
    if (type === 'gallery' && galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const selectedFile = selectedFiles[type];
    const imagePreview = imagePreviews[type];
    
    if (!selectedFile) return;

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      let imageUrl;

      try {
        imageUrl = await uploadImage(selectedFile, 'file-maintenance');
      } catch (uploadError) {
        console.error('Error uploading image, using base64 fallback:', uploadError);
        if (imagePreview) {
          imageUrl = imagePreview;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      const maintenanceData = {
        type: type === 'hero' ? 'Hero' : 'Gallery',
        image_url: imageUrl,
      };

      await createMaintenance(maintenanceData);
      fetchImages();
      removeImage(type);
      showToast('success', `${type === 'hero' ? 'Hero' : 'Gallery'} image uploaded successfully.`);
    } catch (error) {
      console.error('Error saving image:', error);
      const errorMessage = error?.message || 'Error uploading image. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDelete = async (id, category, imageUrl) => {
    try {
      // Delete from storage first
      if (imageUrl) {
        try {
          await deleteImage(imageUrl, 'file-maintenance');
        } catch (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue with database delete even if storage delete fails
        }
      }
      
      // Delete from database
      await deleteMaintenance(id);
      fetchImages();
      showToast('success', `${category} image deleted successfully.`);
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('error', 'Error deleting image. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const ImageUploadSection = ({ type, title, description, images, fileInputRef }) => (
    <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 sm:p-6">
      <div className="mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm font-medium text-primary mb-1">{title}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">{title} Management</h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, type)} className="mb-4 sm:mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{title} Image</label>
          {imagePreviews[type] ? (
            <div className="relative mt-1 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
              <img
                src={imagePreviews[type]}
                alt="Preview"
                className="h-40 sm:h-48 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(type)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 rounded-full bg-red-500 p-1.5 sm:p-2 text-white shadow-md hover:bg-red-600"
                aria-label="Remove image"
              >
                <span className="material-symbols-outlined text-sm sm:text-base">close</span>
              </button>
            </div>
          ) : (
            <div
              className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, type)}
            >
              <div className="space-y-1 text-center">
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-400 dark:text-gray-500">upload_file</span>
                <div className="flex text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <p>Drag & drop or tap to upload</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">JPG/PNG, max 30MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            data-type={type}
            onChange={(e) => {
              const fileType = e.target.getAttribute('data-type') || type;
              console.log('File input onChange triggered, type:', fileType);
              handleImageUpload(e, fileType);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </div>

        {imagePreviews[type] && (
          <button
            type="submit"
            className="mt-3 sm:mt-4 w-full bg-primary text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 text-sm sm:text-base"
            disabled={uploading[type]}
          >
            {uploading[type] ? 'Uploading...' : `Upload ${title} Image`}
          </button>
        )}
      </form>

      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Existing {title} Images</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 sm:h-32 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shimmer-bg"></div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="py-6 sm:py-8 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No {title.toLowerCase()} images uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 aspect-video">
                  <img
                    src={image.image_url}
                    alt={`${title} image`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setDeleteTarget({ id: image.id, category: title, imageUrl: image.image_url })}
                  className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 opacity-0 group-hover:opacity-100 rounded-full bg-red-500/90 p-1.5 sm:p-2 text-white shadow-md hover:bg-red-600 transition-opacity"
                  aria-label="Delete image"
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <AdminLayout>
      <main className="relative flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 sm:p-6 md:p-8">
        {/* Delete Confirmation Dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-3 sm:px-4">
            <div className="w-full max-w-sm rounded-xl sm:rounded-2xl border border-white/10 bg-background-dark/95 px-4 sm:px-6 py-5 sm:py-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-red-500/15 border border-red-400/60 text-red-400 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">warning</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-white">Delete image?</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    This action cannot be undone. The image will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/5 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteTarget.id, deleteTarget.category, deleteTarget.imageUrl)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors order-1 sm:order-2"
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {toast.visible && (
          <div
            className={`fixed right-3 sm:right-6 top-20 z-50 flex items-center gap-2 sm:gap-3 rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold shadow-lg max-w-[calc(100vw-1.5rem)] ${
              toast.type === 'success'
                ? 'border-green-400/60 bg-green-500/10 text-green-700 dark:text-green-200'
                : 'border-red-400/60 bg-red-500/10 text-red-700 dark:text-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl flex-shrink-0">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="break-words">{toast.message}</p>
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-4 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">File Maintenance</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Upload and manage images for Hero and Gallery sections.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ImageUploadSection
              type="hero"
              title="Hero"
              description="Upload images for the hero carousel on the home page."
              images={heroImages}
              fileInputRef={heroFileInputRef}
            />
            <ImageUploadSection
              type="gallery"
              title="Gallery"
              description="Upload images for the gallery section on the home page."
              images={galleryImages}
              fileInputRef={galleryFileInputRef}
            />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default FileMaintenance;


import React, { useState, useEffect, useRef } from 'react';
import { getMaintenanceByType, createMaintenance, deleteMaintenance } from '../../../services/maintenanceService';
import { uploadImage, deleteImage } from '../../../services/imageUploadService';
import AdminLayout from '../AdminLayout';

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
    <section className="rounded-2xl border border-[#2b4c1f] bg-[#111b10] p-6 shadow-[0_20px_60px_rgba(5,10,4,0.6)]">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6fb95b]">{title}</p>
        <h2 className="text-white text-2xl font-semibold mt-1">{title} Management</h2>
        <p className="text-xs text-[#9fb99a] mt-1">{description}</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, type)} className="mb-6">
        <div>
          <label className="text-sm font-semibold text-[#c7f5b8]">{title} Image</label>
          {imagePreviews[type] ? (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-[#385c2d]">
              <img
                src={imagePreviews[type]}
                alt="Preview"
                className="h-48 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(type)}
                className="absolute right-3 top-3 rounded-full bg-[#f25757] p-2 text-white shadow-md hover:bg-[#ff7a7a]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ) : (
            <div
              className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#3c5d31] bg-[#0b1208] px-6 py-8 text-center text-[#98c589] transition hover:border-[#6fe05f] hover:text-[#c9ffb8]"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, type)}
            >
              <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
              <p className="text-sm font-medium">Drag & drop or tap to upload</p>
              <p className="text-xs text-[#6b8a63] mt-1">JPG/PNG, max 30MB</p>
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
            className="mt-4 w-full rounded-full bg-[#6fe05f] px-4 py-3 text-sm font-bold text-[#041005] shadow-lg shadow-[#6fe05f33] transition hover:bg-[#5ec84f] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={uploading[type]}
          >
            {uploading[type] ? 'Uploading...' : `Upload ${title} Image`}
          </button>
        )}
      </form>

      <div>
        <p className="text-sm font-semibold text-[#c7f5b8] mb-3">Existing {title} Images</p>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-[#0f160c] border border-[#385c2d] shimmer-bg"></div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="py-8 text-center text-[#96b78e] text-sm">No {title.toLowerCase()} images uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="overflow-hidden rounded-xl border border-[#385c2d] aspect-video">
                  <img
                    src={image.image_url}
                    alt={`${title} image`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setDeleteTarget({ id: image.id, category: title, imageUrl: image.image_url })}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-full bg-red-500/90 p-2 text-white shadow-md hover:bg-red-500 transition-opacity"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
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
      <main className="relative flex-1 overflow-y-auto bg-black/10 p-6">
        {/* Delete Confirmation Dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-[#0b0909] px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10 border border-red-400/60 text-red-300">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Delete image?</p>
                  <p className="text-xs text-red-200/80">
                    This action cannot be undone. The image will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full border border-zinc-600 px-4 py-2 text-zinc-200 hover:bg-zinc-800/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteTarget.id, deleteTarget.category, deleteTarget.imageUrl)}
                  className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {toast.visible && (
          <div
            className={`fixed right-6 top-20 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-[0_18px_50px_rgba(0,0,0,0.65)] ${
              toast.type === 'success'
                ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                : 'border-red-400/60 bg-red-500/10 text-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p>{toast.message}</p>
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-1">
            <p className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">File Maintenance</p>
            <p className="text-[#7fe06c] text-sm font-medium">Upload and manage images for Hero and Gallery sections.</p>
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


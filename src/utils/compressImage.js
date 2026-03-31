/**
 * Compresses an image File/Blob before upload.
 * @param {File} file - Original image file
 * @param {object} options
 * @param {number} options.maxWidth  - Max width in px (default 1920)
 * @param {number} options.maxHeight - Max height in px (default 1920)
 * @param {number} options.quality  - JPEG quality 0–1 (default 0.82)
 * @param {number} options.maxSizeBytes - Abort compression if result is still larger (default 1MB)
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = (file, {
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82,
  maxSizeBytes = 1 * 1024 * 1024, // 1MB
} = {}) => {
  return new Promise((resolve, reject) => {
    // Skip non-images and GIFs (GIF compression breaks animation)
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down proportionally
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      // White background for transparent PNGs converted to JPEG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG for photos, PNG for images with transparency (png)
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const outputQuality = outputType === 'image/png' ? undefined : quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas compression failed'));

          // If compressed is somehow larger than original, return original
          const result = blob.size < file.size ? blob : file;

          const compressed = new File(
            [result],
            file.name.replace(/\.[^.]+$/, outputType === 'image/png' ? '.png' : '.jpg'),
            { type: outputType, lastModified: Date.now() }
          );

          resolve(compressed);
        },
        outputType,
        outputQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback: use original
    };

    img.src = objectUrl;
  });
};
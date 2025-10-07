import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ImagePreview from './components/ImagePreview';
import { supabase } from './lib/supabaseClient';
import { Image, Plus, X, AlertTriangle, Info, Loader2, GripVertical } from 'lucide-react';
import './ImageUpload.css';
import { ImageUploadProps } from './types';

const ImageUpload = forwardRef<any, ImageUploadProps>(function ImageUpload({ existingImages = [], onChange, locationType, locationId = null }, ref) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // files waiting for location id
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Generate unique filename
  const generateFileName = (file: File): string => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    
    // Include locationId in filename if available
    if (locationId) {
      return `${locationType}_${locationId}_${timestamp}_${randomStr}.${extension}`;
    }
    
    // Fallback for new locations without ID yet
    return `${locationType}_${timestamp}_${randomStr}.${extension}`;
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File, forcedLocationId: string | null = null): Promise<string | null> => {
    const effectiveId = forcedLocationId || locationId;
    const fileName = effectiveId ? `${locationType}_${effectiveId}_${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}` : generateFileName(file);
    const filePath = `${locationType}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('location-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('location-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Keep internal state in sync with parent when switching records quickly
  useEffect(() => {
    setImages(existingImages || []);
  }, [existingImages, locationId, locationType]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} nem kép fájl!`);
          continue;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} túl nagy! Maximum 5MB lehet.`);
          continue;
        }

        if (!locationId) {
          // Stage files for later upload when id is available; show preview
          const preview = URL.createObjectURL(file);
          newImageUrls.push(preview);
          setPendingFiles(prev => [...prev, file]);
        } else {
          setUploading(true);
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          try {
            const url = await uploadImage(file);
            newImageUrls.push(url);
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            alert(`Hiba ${file.name} feltöltése során: ${error.message}`);
          } finally {
            setUploading(false);
          }
        }
      }

      // Update images array
      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      if (locationId) onChange(updatedImages);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Hiba a képek feltöltése során');
    } finally {
      setUploadProgress({});
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedItem);
    
    setImages(newImages);
    onChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Delete image
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a képet?')) {
      return;
    }

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/location-images/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('location-images')
          .remove([filePath]);

        if (error) {
          console.error('Delete error:', error);
          // Continue anyway - file might not exist
        }
      }

      // Remove from array
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onChange(updatedImages);

    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Hiba a kép törlése során');
    }
  };

  // Expose method for parent to upload pending files once an id is known
  useImperativeHandle(ref, () => ({
    async uploadPending(withLocationId) {
      if (!pendingFiles.length) return [];
      const uploaded = [];
      try {
        setUploading(true);
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          const url = await uploadImage(file, withLocationId);
          uploaded.push(url);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }
        const updated = images
          .filter(u => !u.startsWith('blob:'))
          .concat(uploaded);
        setImages(updated);
        onChange(updated);
        setPendingFiles([]);
        return uploaded;
      } finally {
        setUploading(false);
        setUploadProgress({});
      }
    }
  }));

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">
        <Image size={16} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
        Képek ({images.length})
        {images.length < 10 && (
          <span className="image-upload-hint"> - Maximum 10 kép tölthető fel</span>
        )}
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((url, index) => (
            <div
              key={index}
              className={`image-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => setPreviewUrl(url)}
              style={{ cursor: 'grab' }}
            >
              <div className="drag-handle">
                <GripVertical size={16} className="text-white/80" />
              </div>
              <img src={url} alt={`Kép ${index + 1}`} />
              <button
                type="button"
                className="image-delete-btn"
                onClick={(e) => { e.stopPropagation(); handleDeleteImage(url, index); }}
                title="Törlés"
              >
                <X size={16} />
              </button>
              <div className="image-number">{index + 1}</div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <ImagePreview src={previewUrl} alt="Előnézet" onClose={() => setPreviewUrl(null)} />
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress-container">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="upload-progress-item">
              <span className="upload-filename">{name}</span>
              <div className="upload-progress-bar">
                <div 
                  className="upload-progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="upload-percentage">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < 10 && (
        <div className="image-upload-actions">
          <label className="image-upload-btn" htmlFor="image-upload-input">
            {uploading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Feltöltés...
              </>
            ) : (
              <>
                <Plus size={20} />
                Képek hozzáadása
              </>
            )}
          </label>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {images.length >= 10 && (
        <p className="image-limit-message">
          <AlertTriangle size={16} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
          Elérted a maximum 10 kép limitet
        </p>
      )}

      <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Megengedett formátumok: JPG, PNG, GIF, WebP | Maximum méret: 5MB képenként
        </span>
      </div>
    </div>
  );
});

export default ImageUpload;


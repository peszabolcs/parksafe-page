import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import ImageUpload from './ImageUpload';
import { useRef } from 'react';
import Switch from './components/Switch';
import { AlertCircle, CheckCircle, Loader2, Plus, X } from 'lucide-react';
import './AddLocationModal.css';
import { lockScroll, unlockScroll } from './utils/modalLock';

function AddLocationModal({ isOpen, onClose, locationType, onSuccess }) {
  const imageUploadRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    lat: '',
    lon: '',
    // Parking specific
    covered: false,
    is_open_24h: false,
    capacity_level: '',
    has_camera: false,
    // Service specific
    phone: '',
    website: '',
    opening_hours: '',
    rating: '',
    price_range: '',
    // Repair station specific
    free: false,
  });
  
  const [pictureUrls, setPictureUrls] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate coordinates
      const lat = parseFloat(formData.lat);
      const lon = parseFloat(formData.lon);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Érvénytelen koordináták');
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error('Koordináták tartományon kívül');
      }

      // Determine table name based on location type
      let tableName;
      let insertData = {
        name: formData.name,
        description: formData.description || null,
        city: formData.city,
        available: true,
        picture_url: pictureUrls.length > 0 ? pictureUrls : null,
      };

      // Add location type specific fields
      if (locationType === 'parking') {
        tableName = 'parkingSpots';
        (insertData as any).covered = formData.covered;
        (insertData as any).is_open_24h = formData.is_open_24h;
        (insertData as any).capacity_level = formData.capacity_level || null;
        (insertData as any).has_camera = formData.has_camera;
      } else if (locationType === 'services') {
        tableName = 'bicycleService';
        (insertData as any).phone = formData.phone || null;
        (insertData as any).website = formData.website || null;
        (insertData as any).opening_hours = formData.opening_hours || null;
        (insertData as any).rating = formData.rating ? parseFloat(formData.rating) : null;
        (insertData as any).price_range = formData.price_range || null;
      } else if (locationType === 'repair') {
        tableName = 'repairStation';
        (insertData as any).covered = formData.covered;
        (insertData as any).free = formData.free;
      }

      // Insert with PostGIS coordinate
      // Use ST_SetSRID and ST_MakePoint for proper geometry
      const { data: inserted, error: insertError } = await supabase
        .from(tableName)
        .insert([{
          ...insertData,
          // PostGIS POINT format: POINT(longitude latitude)
          coordinate: `SRID=4326;POINT(${lon} ${lat})`
        }])
        .select('id')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        
        // Handle specific RLS policy errors
        if (insertError.code === '42501' || insertError.message?.includes('policy')) {
          throw new Error('Nincs jogosultságod új helyszín hozzáadásához. Csak admin felhasználók adhatnak hozzá új helyszíneket.');
        }
        
        throw new Error(insertError.message || 'Hiba történt az adatbázis művelet során');
      }

      // If there are staged files (no id earlier), upload them with new id
      if (imageUploadRef.current && inserted?.id) {
        const newly = await imageUploadRef.current.uploadPending(inserted.id);
        if (newly.length > 0) {
          await supabase.from(tableName).update({ picture_url: newly }).eq('id', inserted.id);
        }
      }

      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          city: '',
          lat: '',
          lon: '',
          covered: false,
          is_open_24h: false,
          capacity_level: '',
          has_camera: false,
          phone: '',
          website: '',
          opening_hours: '',
          rating: '',
          price_range: '',
          free: false,
        });
        setPictureUrls([]);
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error adding location:', err);
      setError(err.message || 'Hiba történt a helyszín hozzáadása során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Lock scroll consistently; hook order must not depend on isOpen
  useEffect(() => {
    if (isOpen) lockScroll();
    return () => {
      if (isOpen) unlockScroll();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (locationType === 'parking') return 'Parkoló Hozzáadása';
    if (locationType === 'services') return 'Szerviz Hozzáadása';
    if (locationType === 'repair') return 'Javító Állomás Hozzáadása';
    return 'Helyszín Hozzáadása';
  };

  return (
    <div className="add-location-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-location-modal-content" key={locationType} onClick={(e) => e.stopPropagation()}>
        <div className="add-location-modal-header">
          <h2>{getTitle()}</h2>
          <button className="add-location-modal-close" onClick={onClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>
        
        <div className="add-location-modal-body">
          <p className="add-location-modal-subtitle">Töltsd ki az alábbi mezőket az új helyszín létrehozásához</p>

          <form onSubmit={handleSubmit} className="add-location-modal-form">
          {/* Common fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Név *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Helyszín neve"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Város *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Város neve"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Leírás</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Rövid leírás a helyszínről"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Coordinates */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lat">Szélesség (Latitude) *</label>
              <input
                type="number"
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="47.4979"
                step="0.000001"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lon">Hosszúság (Longitude) *</label>
              <input
                type="number"
                id="lon"
                name="lon"
                value={formData.lon}
                onChange={handleChange}
                placeholder="19.0402"
                step="0.000001"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="coordinates-helper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tipp: A koordinátákat <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>-ről 
            vagy <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>-ről tudod kimásolni
          </div>

          {/* Parking specific fields */}
          {locationType === 'parking' && (
            <>
              <div className="form-group checkbox-group">
                <Switch
                  label="Fedett parkoló"
                  checked={formData.covered}
                  onChange={handleChange}
                  disabled={isLoading}
                  name="covered"
                />
              </div>

              <div className="form-group checkbox-group">
                <Switch
                  label="24 órás nyitvatartás"
                  checked={formData.is_open_24h}
                  onChange={handleChange}
                  disabled={isLoading}
                  name="is_open_24h"
                />
              </div>

              <div className="form-group checkbox-group">
                <Switch
                  label="Kamera biztonság"
                  checked={formData.has_camera}
                  onChange={handleChange}
                  disabled={isLoading}
                  name="has_camera"
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity_level">Kapacitás szint</label>
                <select
                  id="capacity_level"
                  name="capacity_level"
                  value={formData.capacity_level}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Válassz...</option>
                  <option value="small">Kis (1-10 hely)</option>
                  <option value="medium">Közepes (11-50 hely)</option>
                  <option value="large">Nagy (50+ hely)</option>
                </select>
              </div>
            </>
          )}

          {/* Service specific fields */}
          {locationType === 'services' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telefonszám</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+36 20 123 4567"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Weboldal</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://pelda.hu"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="opening_hours">Nyitvatartás</label>
                  <input
                    type="text"
                    id="opening_hours"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleChange}
                    placeholder="H-P: 9:00-18:00"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rating">Értékelés (1-5)</label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    min="1"
                    max="5"
                    step="0.1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="price_range">Árkategória</label>
                <select
                  id="price_range"
                  name="price_range"
                  value={formData.price_range}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Válassz...</option>
                  <option value="$">$ - Olcsó</option>
                  <option value="$$">$$ - Közepes</option>
                  <option value="$$$">$$$ - Drága</option>
                </select>
              </div>
            </>
          )}

          {/* Repair station specific fields */}
          {locationType === 'repair' && (
            <div className="checkbox-group-container">
              <div className="form-group checkbox-group">
                <Switch
                  label="Fedett állomás"
                  checked={formData.covered}
                  onChange={handleChange}
                  disabled={isLoading}
                  name="covered"
                />
              </div>

              <div className="form-group checkbox-group">
                <Switch
                  label="Ingyenes használat"
                  checked={formData.free}
                  onChange={handleChange}
                  disabled={isLoading}
                  name="free"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}
          <ImageUpload
            existingImages={pictureUrls}
            onChange={setPictureUrls}
            locationType={locationType}
            ref={imageUploadRef}
          />

          {error && (
            <div className="status-message error">
              <AlertCircle size={16} style={{ marginRight: '6px' }} />
              {error}
            </div>
          )}

          {success && (
            <div className="status-message success">
              <CheckCircle size={16} style={{ marginRight: '6px' }} />
              Helyszín sikeresen hozzáadva!
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel-modal"
              onClick={onClose}
              disabled={isLoading}
            >
              Mégse
            </button>
            <button
              type="submit"
              className="btn-submit-modal"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                  Mentés...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={16} style={{ marginRight: '6px' }} />
                  Hozzáadva!
                </>
              ) : (
                <>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Hozzáadás
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

export default AddLocationModal;


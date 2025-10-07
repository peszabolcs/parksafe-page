import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import ImageUpload from './ImageUpload';
import Switch from './components/Switch';
import { AlertCircle, CheckCircle, Loader2, Save, X } from 'lucide-react';
import './AddLocationModal.css'; // Reuse the same styles
import { lockScroll, unlockScroll } from './utils/modalLock';

function EditLocationModal({ isOpen, onClose, locationType, item, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    lat: '',
    lon: '',
    // Parking specific
    covered: false,
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

  // Parse coordinates from the item
  const parseCoordinates = (item) => {
    if (!item) return { lat: '', lon: '' };
    
    // Try direct lat/lon first
    if (item.lat && item.lon) {
      return { lat: item.lat, lon: item.lon };
    }
    
    // Try parsing WKB coordinate field
    if (item.coordinate) {
      // Handle GeoJSON format
      if (typeof item.coordinate === 'object' && item.coordinate.type === 'Point') {
        const [lon, lat] = item.coordinate.coordinates;
        return { lat, lon };
      }
      
      // Handle WKB string format
      if (typeof item.coordinate === 'string') {
        try {
          const coordsHex = item.coordinate.substring(18);
          if (coordsHex.length >= 32) {
            const lonHex = coordsHex.substring(0, 16);
            const latHex = coordsHex.substring(16, 32);
            
            const lonBuffer = new ArrayBuffer(8);
            const lonView = new DataView(lonBuffer);
            for (let i = 0; i < 8; i++) {
              lonView.setUint8(i, parseInt(lonHex.substr(i * 2, 2), 16));
            }
            const lon = lonView.getFloat64(0, true);
            
            const latBuffer = new ArrayBuffer(8);
            const latView = new DataView(latBuffer);
            for (let i = 0; i < 8; i++) {
              latView.setUint8(i, parseInt(latHex.substr(i * 2, 2), 16));
            }
            const lat = latView.getFloat64(0, true);
            
            return { lat, lon };
          }
        } catch (error) {
          console.error('Error parsing coordinates:', error);
        }
      }
    }
    
    return { lat: '', lon: '' };
  };

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      const coords = parseCoordinates(item);
      
      setFormData({
        name: item.name || '',
        description: item.description || '',
        city: item.city || '',
        lat: coords.lat ? coords.lat.toString() : '',
        lon: coords.lon ? coords.lon.toString() : '',
        covered: item.covered || false,
        phone: item.phone || '',
        website: item.website || '',
        opening_hours: item.opening_hours || '',
        rating: item.rating ? item.rating.toString() : '',
        price_range: item.price_range || '',
        free: item.free || false,
      });
      
      // Set existing images; guard by id to avoid race when switching fast
      setPictureUrls(Array.isArray(item.picture_url) ? item.picture_url : []);
    }
  }, [item?.id]);

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
      let updateData = {
        name: formData.name,
        description: formData.description || null,
        city: formData.city,
        picture_url: pictureUrls.length > 0 ? pictureUrls : null,
      };

      // Add location type specific fields
      if (locationType === 'parking') {
        tableName = 'parkingSpots';
        (updateData as any).covered = formData.covered;
      } else if (locationType === 'services') {
        tableName = 'bicycleService';
        (updateData as any).phone = formData.phone || null;
        (updateData as any).website = formData.website || null;
        (updateData as any).opening_hours = formData.opening_hours || null;
        (updateData as any).rating = formData.rating ? parseFloat(formData.rating) : null;
        (updateData as any).price_range = formData.price_range || null;
      } else if (locationType === 'repair') {
        tableName = 'repairStation';
        (updateData as any).covered = formData.covered;
        (updateData as any).free = formData.free;
      }

      // Update with PostGIS coordinate
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          ...updateData,
          // PostGIS POINT format: POINT(longitude latitude)
          coordinate: `SRID=4326;POINT(${lon} ${lat})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) {
        console.error('Update error:', updateError);
        
        // Handle specific RLS policy errors
        if (updateError.code === '42501' || updateError.message?.includes('policy')) {
          throw new Error('Nincs jogosultságod a helyszín szerkesztéséhez. Csak admin felhasználók szerkeszthetnek helyszíneket.');
        }
        
        throw new Error(updateError.message || 'Hiba történt az adatbázis művelet során');
      }

      setSuccess(true);
      
      // Close and refresh
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.message || 'Hiba történt a helyszín frissítése során');
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

  if (!isOpen || !item) return null;

  const getTitle = () => {
    if (locationType === 'parking') return 'Parkoló Szerkesztése';
    if (locationType === 'services') return 'Szerviz Szerkesztése';
    if (locationType === 'repair') return 'Javító Állomás Szerkesztése';
    return 'Helyszín Szerkesztése';
  };

  return (
    <div className="add-location-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-location-modal-content" key={item.id} onClick={(e) => e.stopPropagation()}>
        <div className="add-location-modal-header">
          <h2>{getTitle()}</h2>
          <button className="add-location-modal-close" onClick={onClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>
        
        <div className="add-location-modal-body">
          <p className="add-location-modal-subtitle">Módosítsd az adatokat és mentsd el a változtatásokat</p>

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
            <div className="form-group checkbox-group">
              <Switch
                label="Fedett parkoló"
                checked={formData.covered}
                onChange={handleChange}
                disabled={isLoading}
                name="covered"
              />
            </div>
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
            locationId={item?.id}
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
              Helyszín sikeresen frissítve!
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
                  Mentve!
                </>
              ) : (
                <>
                  <Save size={16} style={{ marginRight: '6px' }} />
                  Mentés
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

export default EditLocationModal;


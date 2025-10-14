import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ImageUpload from '../ImageUpload';
import { AlertCircle, CheckCircle, Loader2, Save, MapPin, Building2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';

function EditLocationModal({ isOpen, onClose, locationType, item, onSuccess }) {
  const [formData, setFormData] = useState({
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
  
  const [pictureUrls, setPictureUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const parseCoordinates = (item) => {
    if (!item) return { lat: '', lon: '' };
    
    if (item.lat && item.lon) {
      return { lat: item.lat, lon: item.lon };
    }
    
    if (item.coordinate) {
      if (typeof item.coordinate === 'object' && item.coordinate.type === 'Point') {
        const [lon, lat] = item.coordinate.coordinates;
        return { lat, lon };
      }
      
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
        is_open_24h: item.is_open_24h || false,
        capacity_level: item.capacity_level || '',
        has_camera: item.has_camera || false,
        phone: item.phone || '',
        website: item.website || '',
        opening_hours: item.opening_hours || '',
        rating: item.rating ? item.rating.toString() : '',
        price_range: item.price_range || '',
        free: item.free || false,
      });
      
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
      const lat = parseFloat(formData.lat);
      const lon = parseFloat(formData.lon);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Érvénytelen koordináták');
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error('Koordináták tartományon kívül');
      }

      let tableName;
      let updateData = {
        name: formData.name,
        description: formData.description || null,
        city: formData.city,
        picture_url: pictureUrls.length > 0 ? pictureUrls : null,
      };

      if (locationType === 'parking') {
        tableName = 'parkingSpots';
        (updateData as any).covered = formData.covered;
        (updateData as any).is_open_24h = formData.is_open_24h;
        (updateData as any).capacity_level = formData.capacity_level || null;
        (updateData as any).has_camera = formData.has_camera;
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

      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          ...updateData,
          coordinate: `SRID=4326;POINT(${lon} ${lat})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) {
        console.error('Update error:', updateError);
        
        if (updateError.code === '42501' || updateError.message?.includes('policy')) {
          throw new Error('Nincs jogosultságod a helyszín szerkesztéséhez. Csak admin felhasználók szerkeszthetnek helyszíneket.');
        }
        
        throw new Error(updateError.message || 'Hiba történt az adatbázis művelet során');
      }

      setSuccess(true);
      
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

  if (!isOpen || !item) return null;

  const getTitle = () => {
    if (locationType === 'parking') return 'Parkoló Szerkesztése';
    if (locationType === 'services') return 'Szerviz Szerkesztése';
    if (locationType === 'repair') return 'Javító Állomás Szerkesztése';
    return 'Helyszín Szerkesztése';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="admin-dark max-w-3xl max-h-[90vh] overflow-hidden bg-card border-border p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground">
            {getTitle()}
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground mb-6">
              Módosítsd az adatokat és mentsd el a változtatásokat
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Név *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Helyszín neve"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Város *</Label>
                  <Input
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

              <div className="space-y-2">
                <Label htmlFor="description">Leírás</Label>
                <Textarea
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
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Koordináták
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Szélesség (Latitude) *</Label>
                    <Input
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

                  <div className="space-y-2">
                    <Label htmlFor="lon">Hosszúság (Longitude) *</Label>
                    <Input
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
                <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Tipp: A koordinátákat{' '}
                    <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Google Maps
                    </a>
                    -ről vagy{' '}
                    <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      OpenStreetMap
                    </a>
                    -ről tudod kimásolni
                  </span>
                </div>
              </div>

              {/* Parking specific fields */}
              {locationType === 'parking' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                    <Label htmlFor="covered" className="cursor-pointer">Fedett parkoló</Label>
                    <Switch
                      id="covered"
                      checked={formData.covered}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, covered: checked }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                    <Label htmlFor="is_open_24h" className="cursor-pointer">24 órás nyitvatartás</Label>
                    <Switch
                      id="is_open_24h"
                      checked={formData.is_open_24h}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_open_24h: checked }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                    <Label htmlFor="has_camera" className="cursor-pointer">Kamera biztonság</Label>
                    <Switch
                      id="has_camera"
                      checked={formData.has_camera}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_camera: checked }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity_level">Kapacitás szint</Label>
                    <select
                      id="capacity_level"
                      name="capacity_level"
                      value={formData.capacity_level}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Válassz...</option>
                      <option value="small">Kis (1-10 hely)</option>
                      <option value="medium">Közepes (11-50 hely)</option>
                      <option value="large">Nagy (50+ hely)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Service specific fields */}
              {locationType === 'services' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Üzlet információk
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefonszám</Label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+36 20 123 4567"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Weboldal</Label>
                          <Input
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="opening_hours">Nyitvatartás</Label>
                          <Input
                            type="text"
                            id="opening_hours"
                            name="opening_hours"
                            value={formData.opening_hours}
                            onChange={handleChange}
                            placeholder="H-P: 9:00-18:00"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rating">Értékelés (1-5)</Label>
                          <Input
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

                      <div className="space-y-2">
                        <Label htmlFor="price_range">Árkategória</Label>
                        <select
                          id="price_range"
                          name="price_range"
                          value={formData.price_range}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Válassz...</option>
                          <option value="$">$ - Olcsó</option>
                          <option value="$$">$$ - Közepes</option>
                          <option value="$$$">$$$ - Drága</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Repair station specific fields */}
              {locationType === 'repair' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                    <Label htmlFor="covered-repair" className="cursor-pointer">Fedett állomás</Label>
                    <Switch
                      id="covered-repair"
                      checked={formData.covered}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, covered: checked }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                    <Label htmlFor="free" className="cursor-pointer">Ingyenes használat</Label>
                    <Switch
                      id="free"
                      checked={formData.free}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, free: checked }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Képek</h3>
                <ImageUpload
                  existingImages={pictureUrls}
                  onChange={setPictureUrls}
                  locationType={locationType}
                  locationId={item?.id}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Helyszín sikeresen frissítve!</span>
                </div>
              )}
            </form>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Mégse
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mentés...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mentve!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditLocationModal;
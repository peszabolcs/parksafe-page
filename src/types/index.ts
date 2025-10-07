// Type definitions for the application

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata?: {
    avatar_url?: string;
    [key: string]: any;
  };
}

export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  picture_url?: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParkingLocation extends Location {
  covered?: boolean;
  free?: boolean;
}

export interface RepairStation extends Location {
  covered?: boolean;
  free?: boolean;
  phone?: string;
  website?: string;
  opening_hours?: string;
  rating?: number;
  price_range?: string;
}

export interface BicycleService extends Location {
  phone?: string;
  website?: string;
  opening_hours?: string;
  rating?: number;
  price_range?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle?: () => Promise<any>;
  signOut: () => Promise<void>;
}

export interface FormData {
  name: string;
  description: string;
  city: string;
  coordinates: string;
  covered?: boolean;
  free?: boolean;
  phone?: string;
  website?: string;
  opening_hours?: string;
  rating?: string;
  price_range?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ImageUploadProps {
  existingImages?: string[];
  onChange: (images: string[]) => void;
  locationType: string;
  locationId?: string | null;
}

export interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  appearance?: {
    onColor: string;
    offColor: string;
    thumbColor: string;
    borderRadius: string;
    width: string;
    height: string;
  };
  labelStyle?: React.CSSProperties;
  name?: string;
  id?: string;
  'aria-label'?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EditLocationModalProps extends ModalProps {
  locationType: string;
  item: Location | ParkingLocation | RepairStation | BicycleService;
  onSuccess: () => void;
}

export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}
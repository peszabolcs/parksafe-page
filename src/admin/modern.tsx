import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  MapPin, 
  Wrench, 
  Settings, 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  ArrowLeft,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Building,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import AddLocationModal from '../AddLocationModal';
import EditLocationModal from '../EditLocationModal';
import { lockScroll, unlockScroll } from '../utils/modalLock';
import ImagePreview from '../components/ImagePreview';

function ModernAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [parkingSpots, setParkingSpots] = useState([]);
  const [bicycleServices, setBicycleServices] = useState([]);
  const [repairStations, setRepairStations] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [detailModal, setDetailModal] = useState({ show: false, item: null, type: null });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [addLocationModal, setAddLocationModal] = useState(false);
  const [editLocationModal, setEditLocationModal] = useState({ show: false, item: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, table: null, id: null });

  // Lock body scroll whenever any top-level modal is open
  useEffect(() => {
    const anyOpen = detailModal.show || addLocationModal || editLocationModal.show || deleteModal.show;
    if (anyOpen) {
      lockScroll();
      return () => unlockScroll();
    }
    unlockScroll();
  }, [detailModal.show, addLocationModal, editLocationModal.show, deleteModal.show]);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      if (!loading && !user) {
        navigate('/login');
        return;
      }

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || data?.role !== 'admin') {
          navigate('/');
        } else {
          setProfile(data);
        }
      }
    };

    checkAdmin();
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch users with pagination and search
    const fetchUsers = async () => {
      try {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        // Apply search filter
        if (searchTerm && activeTab === 'users') {
          query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        // Apply pagination
        const { data, error, count } = await query.range(from, to);

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setUsers(data || []);
          setTotalCount(count || 0);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    if (profile?.role === 'admin' && activeTab === 'users') {
      setUsersLoading(true);
      fetchUsers();
    }
  }, [profile, activeTab, currentPage, pageSize, sortConfig, searchTerm]);

  const fetchAllData = async () => {
    if (profile?.role !== 'admin') return;
    
    setDataLoading(true);
    
    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      if (activeTab === 'parking') {
        let query = supabase
          .from('parkingSpots')
          .select('*, coordinate', { count: 'exact' });

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        const { data, error, count } = await query.range(from, to);
        
        if (error) {
          console.error('Error fetching parking spots:', error);
        } else {
          setParkingSpots(data || []);
          setTotalCount(count || 0);
        }
        
      } else if (activeTab === 'services') {
        let query = supabase
          .from('bicycleService')
          .select('*, coordinate', { count: 'exact' });

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        const { data, error, count } = await query.range(from, to);
        
        if (error) {
          console.error('Error fetching services:', error);
        } else {
          setBicycleServices(data || []);
          setTotalCount(count || 0);
        }
        
      } else if (activeTab === 'repair') {
        let query = supabase
          .from('repairStation')
          .select('*, coordinate', { count: 'exact' });

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        const { data, error, count } = await query.range(from, to);
        
        if (error) {
          console.error('Error fetching repair stations:', error);
        } else {
          setRepairStations(data || []);
          setTotalCount(count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'users') {
      fetchAllData();
    }
  }, [activeTab, profile, currentPage, pageSize, sortConfig, searchTerm]);

  // Reset to page 1 when changing tabs or search term
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const handleDeleteClick = (table, id) => {
    setDeleteModal({ show: true, table, id });
  };

  const confirmDelete = async () => {
    const { table, id } = deleteModal;
    setDeleteModal({ show: false, table: null, id: null });

    try {
      const { data: record, error: fetchErr } = await supabase
        .from(table)
        .select('id, picture_url')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove related images from storage bucket
      if (record?.picture_url && Array.isArray(record.picture_url) && record.picture_url.length > 0) {
        const paths = [];
        for (const url of record.picture_url) {
          const parts = String(url).split('/location-images/');
          if (parts.length === 2) paths.push(parts[1]);
        }
        if (paths.length > 0) {
          try {
            const { error: removeErr } = await supabase.storage
              .from('location-images')
              .remove(paths);
            if (removeErr) console.warn('Storage cleanup error:', removeErr.message);
          } catch (e) {
            console.warn('Storage cleanup exception:', e);
          }
        }
      }

      await fetchAllData();
      alert('Elem sikeresen törölve!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Hiba történt a törlés során.');
    }
  };

  const handleRowClick = (item, type) => {
    setDetailModal({ show: true, item, type });
  };

  const closeDetailModal = () => {
    setDetailModal({ show: false, item: null, type: null });
  };

  const handleAddLocation = () => {
    setAddLocationModal(true);
  };

  const closeAddLocationModal = () => {
    setAddLocationModal(false);
  };

  const handleLocationAdded = async () => {
    await fetchAllData();
  };

  const handleEditLocation = (item) => {
    setEditLocationModal({ show: true, item });
  };

  const closeEditLocationModal = () => {
    setEditLocationModal({ show: false, item: null });
  };

  const handleLocationUpdated = async () => {
    await fetchAllData();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleToggleAvailability = async (table, id, currentStatus) => {
    setToggleLoading(id);
    
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from(table)
        .update({ 
          available: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating availability:', error);
        throw error;
      }

      // Update local state immediately for instant feedback
      if (table === 'parkingSpots') {
        setParkingSpots(prev => prev.map(item => 
          item.id === id ? { ...item, available: newStatus } : item
        ));
      } else if (table === 'bicycleService') {
        setBicycleServices(prev => prev.map(item => 
          item.id === id ? { ...item, available: newStatus } : item
        ));
      } else if (table === 'repairStation') {
        setRepairStations(prev => prev.map(item => 
          item.id === id ? { ...item, available: newStatus } : item
        ));
      }
      
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(`Hiba történt a státusz módosítása során: ${error.message}`);
      await fetchAllData();
    } finally {
      setToggleLoading(null);
    }
  };

  // Parse PostGIS WKB format to extract lat/lon
  const parseWKBPoint = (wkb) => {
    if (!wkb) return null;
    
    // Handle GeoJSON format
    if (typeof wkb === 'object' && wkb.type === 'Point' && Array.isArray(wkb.coordinates)) {
      const [lon, lat] = wkb.coordinates;
      return { lat, lon };
    }
    
    if (typeof wkb !== 'string') return null;
    
    try {
      const coordsHex = wkb.substring(18);
      if (coordsHex.length < 32) return null;
      
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
    } catch (error) {
      console.error('Error parsing WKB:', error);
      return null;
    }
  };

  const getCoordinates = (item) => {
    if (item.lat && item.lon) {
      return { lat: item.lat, lon: item.lon };
    }
    
    if (item.coordinate) {
      return parseWKBPoint(item.coordinate);
    }
    
    return null;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <MoreHorizontal className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-green-500" /> : 
      <ChevronDown className="h-4 w-4 text-green-500" />;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping"></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Admin Panel betöltése</h3>
                <p className="text-gray-400">Kérjük várjon...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 mx-auto mb-6 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Hozzáférés megtagadva</h2>
              <p className="text-gray-400 mb-6">Nincs jogosultságod az admin panel megtekintéséhez. Csak adminisztrátorok érhetik el ezt az oldalt.</p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza a főoldalra
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="admin-dark min-h-screen bg-background text-foreground flex w-full">
          {/* Sidebar */}
          <Sidebar 
            className="bg-sidebar border-r border-sidebar-border" 
            collapsible="icon"
          >
            <SidebarHeader className="border-b border-sidebar-border p-6">
              <div className="flex items-center gap-3 group-data-[state=collapsed]:justify-center">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <img src="/logo.png" alt="ParkSafe" className="w-8 h-8" />
                </div>
                <div className="group-data-[state=collapsed]:hidden">
                  <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
                  <p className="text-xs text-muted-foreground">ParkSafe kezelés</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent>
              <ScrollArea className="flex-1">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Adatkezelés
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setActiveTab('users')}
                        isActive={activeTab === 'users'}
                        tooltip="Összes regisztrált felhasználó kezelése"
                        className={`w-full h-12 transition-all duration-200 ${
                          activeTab === 'users'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                            : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                        <span>Felhasználók</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setActiveTab('parking')}
                        isActive={activeTab === 'parking'}
                        tooltip="Bicikli parkolók létrehozása és kezelése"
                        className={`w-full h-12 transition-all duration-200 ${
                          activeTab === 'parking'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                            : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <MapPin className="h-5 w-5" />
                        <span>Parkolók</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setActiveTab('services')}
                        isActive={activeTab === 'services'}
                        tooltip="Kerékpár szervizek és boltok kezelése"
                        className={`w-full h-12 transition-all duration-200 ${
                          activeTab === 'services'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                            : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <Building className="h-5 w-5" />
                        <span>Szervizek</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setActiveTab('repair')}
                        isActive={activeTab === 'repair'}
                        tooltip="Önkiszolgáló javító állomások kezelése"
                        className={`w-full h-12 transition-all duration-200 ${
                          activeTab === 'repair'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                            : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <Wrench className="h-5 w-5" />
                        <span>Javító Állomások</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <Separator className="my-4 bg-gray-700" />

              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-2 py-2">
                  Rendszer
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="Rendszer beállítások"
                        className="w-full h-10 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Beállítások</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
              <SidebarMenu className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
                <SidebarMenuItem className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
                  <SidebarMenuButton
                    onClick={() => navigate('/profile')}
                    tooltip="Vissza a felhasználói profilhoz"
                    className="w-full justify-start group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:p-0 gap-3 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent border border-sidebar-border"
                  >
                    <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                    <span className="group-data-[state=collapsed]:hidden">Vissza a profilhoz</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="mb-8">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="block xl:hidden space-y-4">
                {/* Top row: Trigger + Title */}
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground transition-all duration-200" />
                  
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      {activeTab === 'users' && <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                      {activeTab === 'parking' && <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                      {activeTab === 'services' && <Building className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                      {activeTab === 'repair' && <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                        {activeTab === 'users' && 'Felhasználók'}
                        {activeTab === 'parking' && 'Bicikli Parkolók'}
                        {activeTab === 'services' && 'Szervizek & Boltok'}
                        {activeTab === 'repair' && 'Javító Állomások'}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {totalCount} elem
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom row: Search + Action */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Keresés..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-8 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchTerm('')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {activeTab !== 'users' && (
                    <Button
                      onClick={handleAddLocation}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Új hozzáadása</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden xl:flex items-center justify-between">
                {/* Left Section - Title & Controls */}
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground transition-all duration-200" />
                  
                  <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      {activeTab === 'users' && <Users className="h-5 w-5 text-white" />}
                      {activeTab === 'parking' && <MapPin className="h-5 w-5 text-white" />}
                      {activeTab === 'services' && <Building className="h-5 w-5 text-white" />}
                      {activeTab === 'repair' && <Wrench className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        {activeTab === 'users' && 'Felhasználók'}
                        {activeTab === 'parking' && 'Bicikli Parkolók'}
                        {activeTab === 'services' && 'Szervizek & Boltok'}
                        {activeTab === 'repair' && 'Javító Állomások'}
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {totalCount} elem
                        </Badge>
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        {activeTab === 'users' && 'Összes regisztrált felhasználó kezelése'}
                        {activeTab === 'parking' && 'Bicikli parkolók létrehozása és kezelése'}
                        {activeTab === 'services' && 'Kerékpár szervizek és boltok kezelése'}
                        {activeTab === 'repair' && 'Önkiszolgáló javító állomások kezelése'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section - Search & Actions */}
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        activeTab === 'users' ? 'Keresés név vagy email alapján...' :
                        activeTab === 'parking' ? 'Keresés név, város vagy leírás alapján...' :
                        activeTab === 'services' ? 'Keresés név vagy város alapján...' :
                        'Keresés név vagy város alapján...'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchTerm('')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {activeTab !== 'users' && (
                    <>
                      <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                      
                      <Button
                        onClick={handleAddLocation}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-primary/25 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                        Új hozzáadása
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        {/* Content */}
        {(usersLoading || dataLoading) ? (
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardContent className="p-16">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border border-green-500/40 animate-pulse"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {activeTab === 'users' && 'Felhasználók betöltése'}
                    {activeTab === 'parking' && 'Bicikli parkolók betöltése'}
                    {activeTab === 'services' && 'Szervizek betöltése'}
                    {activeTab === 'repair' && 'Javító állomások betöltése'}
                  </h3>
                  <p className="text-gray-400">Kérjük várjon, amíg az adatok betöltődnek...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              {/* Users Table */}
              {activeTab === 'users' && (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/50">
                        <TableHead className="text-gray-300">Avatar</TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('username')}
                        >
                          <div className="flex items-center justify-between">
                            Felhasználónév
                            <SortIcon columnKey="username" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center justify-between">
                            Email
                            <SortIcon columnKey="email" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('role')}
                        >
                          <div className="flex items-center justify-between">
                            Szerepkör
                            <SortIcon columnKey="role" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Telefonszám</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow 
                          key={user.id} 
                          className="border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => handleRowClick(user, 'user')}
                        >
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar_url} alt={user.username || 'User'} />
                              <AvatarFallback className="bg-green-600 text-white">
                                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium text-white">
                            {user.username || 'Nincs megadva'}
                          </TableCell>
                          <TableCell className="text-gray-300">{user.email || 'Nincs email'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 'secondary'}
                              className={
                                user.role === 'admin' 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-gray-600 text-gray-200'
                              }
                            >
                              {user.role === 'admin' ? 'Admin' : 'Felhasználó'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Ismeretlen'}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user.phone || 'Nincs megadva'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {users.length === 0 && (
                    <div className="p-12 text-center">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek felhasználók'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Parking Spots Table */}
              {activeTab === 'parking' && (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/50">
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('city')}
                        >
                          <div className="flex items-center justify-between">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Leírás</TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('covered')}
                        >
                          <div className="flex items-center justify-between">
                            Fedett
                            <SortIcon columnKey="covered" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('available')}
                        >
                          <div className="flex items-center justify-between">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parkingSpots.map((spot) => {
                        const coords = getCoordinates(spot);
                        return (
                          <TableRow 
                            key={spot.id} 
                            className="border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                            onClick={() => handleRowClick(spot, 'parking')}
                          >
                            <TableCell className="font-medium text-white">
                              <div>
                                {spot.name}
                                {coords && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{spot.city}</TableCell>
                            <TableCell className="text-gray-300">
                              {spot.description || 'Nincs leírás'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={spot.covered ? 'default' : 'secondary'}
                                className={
                                  spot.covered 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-gray-600 text-gray-200'
                                }
                              >
                                {spot.covered ? 'Igen' : 'Nem'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={spot.available ? 'default' : 'destructive'}
                                className={
                                  spot.available 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                              >
                                {spot.available ? 'Aktív' : 'Inaktív'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(spot.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLocation(spot);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className={`h-8 w-8 border-gray-600 ${
                                    spot.available 
                                      ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                                      : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAvailability('parkingSpots', spot.id, spot.available);
                                  }}
                                  disabled={toggleLoading === spot.id}
                                >
                                  {toggleLoading === spot.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : spot.available ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-600 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick('parkingSpots', spot.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {parkingSpots.length === 0 && (
                    <div className="p-12 text-center">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek parkolók'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Services Table */}
              {activeTab === 'services' && (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/50">
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('city')}
                        >
                          <div className="flex items-center justify-between">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Telefon</TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('rating')}
                        >
                          <div className="flex items-center justify-between">
                            Értékelés
                            <SortIcon columnKey="rating" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('available')}
                        >
                          <div className="flex items-center justify-between">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bicycleServices.map((service) => {
                        const coords = getCoordinates(service);
                        return (
                          <TableRow 
                            key={service.id} 
                            className="border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                            onClick={() => handleRowClick(service, 'service')}
                          >
                            <TableCell className="font-medium text-white">
                              <div>
                                {service.name}
                                {coords && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{service.city}</TableCell>
                            <TableCell className="text-gray-300">{service.phone || 'Nincs'}</TableCell>
                            <TableCell className="text-gray-300">{service.rating || 'N/A'} ⭐</TableCell>
                            <TableCell>
                              <Badge 
                                variant={service.available ? 'default' : 'destructive'}
                                className={
                                  service.available 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                              >
                                {service.available ? 'Aktív' : 'Inaktív'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(service.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLocation(service);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className={`h-8 w-8 border-gray-600 ${
                                    service.available 
                                      ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                                      : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAvailability('bicycleService', service.id, service.available);
                                  }}
                                  disabled={toggleLoading === service.id}
                                >
                                  {toggleLoading === service.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : service.available ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-600 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick('bicycleService', service.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {bicycleServices.length === 0 && (
                    <div className="p-12 text-center">
                      <Building className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek szervizek'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Repair Stations Table */}
              {activeTab === 'repair' && (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/50">
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('city')}
                        >
                          <div className="flex items-center justify-between">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('covered')}
                        >
                          <div className="flex items-center justify-between">
                            Fedett
                            <SortIcon columnKey="covered" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('free')}
                        >
                          <div className="flex items-center justify-between">
                            Ingyenes
                            <SortIcon columnKey="free" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('available')}
                        >
                          <div className="flex items-center justify-between">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repairStations.map((station) => {
                        const coords = getCoordinates(station);
                        return (
                          <TableRow 
                            key={station.id} 
                            className="border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                            onClick={() => handleRowClick(station, 'repair')}
                          >
                            <TableCell className="font-medium text-white">
                              <div>
                                {station.name}
                                {coords && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{station.city}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={station.covered ? 'default' : 'secondary'}
                                className={
                                  station.covered 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-gray-600 text-gray-200'
                                }
                              >
                                {station.covered ? 'Igen' : 'Nem'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={station.free ? 'default' : 'secondary'}
                                className={
                                  station.free 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-gray-600 text-gray-200'
                                }
                              >
                                {station.free ? 'Igen' : 'Nem'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={station.available ? 'default' : 'destructive'}
                                className={
                                  station.available 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                              >
                                {station.available ? 'Aktív' : 'Inaktív'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(station.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLocation(station);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className={`h-8 w-8 border-gray-600 ${
                                    station.available 
                                      ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                                      : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAvailability('repairStation', station.id, station.available);
                                  }}
                                  disabled={toggleLoading === station.id}
                                >
                                  {toggleLoading === station.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : station.available ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 border-gray-600 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick('repairStation', station.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {repairStations.length === 0 && (
                    <div className="p-12 text-center">
                      <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek javító állomások'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between p-4">
                    {/* Page Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Oldal</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {currentPage} / {totalPages}
                      </Badge>
                      <span>összesen {totalCount} elem</span>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Első
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Előző
                      </Button>
                      
                      <Separator orientation="vertical" className="h-6 bg-gray-600 mx-2" />
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={
                                currentPage === pageNum
                                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25 transition-all duration-200'
                                  : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200'
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Separator orientation="vertical" className="h-6 bg-gray-600 mx-2" />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Következő
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Utolsó
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modern Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-500/20 border-2 border-red-500/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-white text-xl font-semibold">Megerősítés szükséges</CardTitle>
              <CardDescription className="text-gray-400 mt-2 leading-relaxed">
                Biztosan törölni szeretnéd ezt az elemet? Ez a művelet nem vonható vissza, és az összes kapcsolódó adat is elvész!
              </CardDescription>
            </CardHeader>
            
            <Separator className="bg-gray-700" />
            
            <CardContent className="pt-6">
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModal({ show: false, table: null, id: null })}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 min-w-[80px]"
                >
                  Mégse
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/25 transition-all duration-200 min-w-[80px]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Törlés
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={addLocationModal}
        onClose={closeAddLocationModal}
        locationType={activeTab}
        onSuccess={handleLocationAdded}
      />

      {/* Edit Location Modal */}
      <EditLocationModal
        isOpen={editLocationModal.show}
        onClose={closeEditLocationModal}
        locationType={activeTab}
        item={editLocationModal.item}
        onSuccess={handleLocationUpdated}
      />

      {/* Image Preview */}
      {imagePreviewUrl && (
        <ImagePreview src={imagePreviewUrl} alt="Előnézet" onClose={() => setImagePreviewUrl(null)} />
      )}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default ModernAdmin;
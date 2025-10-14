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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  X,
  Calendar,
  Mail,
  Phone,
  Clock,
  Shield,
  Star,
  Car,
  Camera
} from 'lucide-react';
import AddLocationModal from '../AddLocationModal';
import EditLocationModal from '../components/EditLocationModal';
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
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

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
          query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
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

        // Apply search filter
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        // Apply pagination
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

        // Apply search filter
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        // Apply pagination
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

        // Apply search filter
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        const sortKey = sortConfig.key || 'created_at';
        const ascending = sortConfig.direction === 'asc';
        query = query.order(sortKey, { ascending });

        // Apply pagination
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setDetailModal(prev => ({ ...prev, show: false }));
    // Clear item and type after animation completes
    setTimeout(() => {
      setDetailModal({ show: false, item: null, type: null });
    }, 300);
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

  // Row selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const currentData = activeTab === 'users' ? users : 
                         activeTab === 'parking' ? parkingSpots :
                         activeTab === 'services' ? bicycleServices : repairStations;
      setSelectedRows(new Set(currentData.map(item => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
      setSelectAll(false);
    }
    setSelectedRows(newSelected);
  };

  // Reset selection and clear data when changing tabs
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
    
    // Clear previous tab data to prevent showing stale data
    if (activeTab === 'users') {
      setParkingSpots([]);
      setBicycleServices([]);
      setRepairStations([]);
    } else if (activeTab === 'parking') {
      setUsers([]);
      setBicycleServices([]);
      setRepairStations([]);
    } else if (activeTab === 'services') {
      setUsers([]);
      setParkingSpots([]);
      setRepairStations([]);
    } else if (activeTab === 'repair') {
      setUsers([]);
      setParkingSpots([]);
      setBicycleServices([]);
    }
  }, [activeTab]);



  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <MoreHorizontal className="h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-green-500" /> : 
      <ChevronDown className="h-4 w-4 text-green-500" />;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card border-border shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Admin Panel betöltése</h3>
                <p className="text-muted-foreground">Kérjük várjon...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card border-border shadow-2xl max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/20 border-2 border-destructive/30 mx-auto mb-6 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Hozzáférés megtagadva</h2>
              <p className="text-muted-foreground mb-6">Nincs jogosultságod az admin panel megtekintéséhez. Csak adminisztrátorok érhetik el ezt az oldalt.</p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
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

              <Separator className="my-4 bg-sidebar-border" />

              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-2 py-2">
                  Rendszer
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="Rendszer beállítások"
                        className="w-full h-10 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
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
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-16">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border border-primary/40 animate-pulse"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {activeTab === 'users' && 'Felhasználók betöltése'}
                    {activeTab === 'parking' && 'Bicikli parkolók betöltése'}
                    {activeTab === 'services' && 'Szervizek betöltése'}
                    {activeTab === 'repair' && 'Javító állomások betöltése'}
                  </h3>
                  <p className="text-muted-foreground">Kérjük várjon, amíg az adatok betöltődnek...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-0 m-0">
              {/* Users Table */}
              {activeTab === 'users' && (
                <div className="max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
                  {/* Table Header with Bulk Actions */}
                  {selectedRows.size > 0 && (
                    <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {selectedRows.size} kijelölt
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedRows.size} felhasználó kijelölve
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRows(new Set());
                            setSelectAll(false);
                          }}
                          className="border-border"
                        >
                          Kijelölés törlése
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow className="border-border hover:bg-muted/80">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={handleSelectAll}
                              className="border-muted-foreground"
                            />
                          </TableHead>
                          <TableHead className="text-muted-foreground font-medium">Avatar</TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('username')}
                        >
                          <div className="flex items-center justify-between">
                            Felhasználónév
                            <SortIcon columnKey="username" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center justify-between">
                            Email
                            <SortIcon columnKey="email" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('role')}
                        >
                          <div className="flex items-center justify-between">
                            Szerepkör
                            <SortIcon columnKey="role" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium">Telefonszám</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-16">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow 
                          key={user.id} 
                          className={`border-border hover:bg-muted/50 transition-colors ${
                            selectedRows.has(user.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.has(user.id)}
                              onCheckedChange={(checked) => handleSelectRow(user.id, checked)}
                              className="border-muted-foreground"
                            />
                          </TableCell>
                          <TableCell>
                            <Avatar className="h-10 w-10 ring-1 ring-border">
                              <AvatarImage src={user.avatar_url} alt={user.username || 'User'} />
                              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell 
                            className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleRowClick(user, 'user')}
                          >
                            {user.username || 'Nincs megadva'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email || 'Nincs email'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 'secondary'}
                              className={
                                user.role === 'admin' 
                                  ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }
                            >
                              {user.role === 'admin' ? 'Admin' : 'Felhasználó'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Ismeretlen'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.phone || 'Nincs megadva'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={() => handleRowClick(user, 'user')}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Részletek megtekintése
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>

                  {users.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek felhasználók'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'Próbálj meg más keresési kifejezést használni.' 
                          : 'Még nem regisztrált senki az alkalmazásba.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Parking Spots Table */}
              {activeTab === 'parking' && (
                <div className="max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
                  {/* Table Header with Bulk Actions */}
                  {selectedRows.size > 0 && (
                    <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {selectedRows.size} kijelölt
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedRows.size} parkoló kijelölve
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRows(new Set());
                            setSelectAll(false);
                          }}
                          className="border-border"
                        >
                          Kijelölés törlése
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-auto">
                    <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border hover:bg-muted/80">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            className="border-muted-foreground"
                          />
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('city')}
                        >
                          <div className="flex items-center justify-between">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium">Leírás</TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('covered')}
                        >
                          <div className="flex items-center justify-between">
                            Fedett
                            <SortIcon columnKey="covered" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('available')}
                        >
                          <div className="flex items-center justify-between">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium w-16">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parkingSpots.map((spot) => {
                        const coords = getCoordinates(spot);
                        return (
                          <TableRow 
                            key={spot.id} 
                            className={`border-border hover:bg-muted/50 transition-colors ${
                              selectedRows.has(spot.id) ? 'bg-primary/5' : ''
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.has(spot.id)}
                                onCheckedChange={(checked) => handleSelectRow(spot.id, checked)}
                                className="border-muted-foreground"
                              />
                            </TableCell>
                            <TableCell 
                              className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleRowClick(spot, 'parking')}
                            >
                              <div>
                                <div className="font-medium">{spot.name}</div>
                                {coords && (
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{spot.city}</TableCell>
                            <TableCell className="text-muted-foreground max-w-48 truncate">
                              {spot.description || 'Nincs leírás'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={spot.covered ? 'default' : 'secondary'}
                                className={
                                  spot.covered 
                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                    : 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
                                }
                              >
                                <div className="flex items-center gap-1">
                                  {spot.available ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {spot.available ? 'Aktív' : 'Inaktív'}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(spot.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={() => handleRowClick(spot, 'parking')}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Részletek megtekintése
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditLocation(spot)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Szerkesztés
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleAvailability('parkingSpots', spot.id, spot.available)}
                                    className="cursor-pointer"
                                    disabled={toggleLoading === spot.id}
                                  >
                                    {toggleLoading === spot.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : spot.available ? (
                                      <EyeOff className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    {spot.available ? 'Deaktiválás' : 'Aktiválás'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick('parkingSpots', spot.id)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Törlés
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    </Table>
                  </div>

                  {parkingSpots.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek parkolók'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'Próbálj meg más keresési kifejezést használni.' 
                          : 'Kattints az "Új hozzáadása" gombra az első parkoló létrehozásához.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Services Table */}
              {activeTab === 'services' && (
                <div className="max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
                  {/* Table Header with Bulk Actions */}
                  {selectedRows.size > 0 && (
                    <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {selectedRows.size} kijelölt
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedRows.size} szerviz kijelölve
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRows(new Set());
                            setSelectAll(false);
                          }}
                          className="border-border"
                        >
                          Kijelölés törlése
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-auto">
                    <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border hover:bg-muted/80">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            className="border-muted-foreground"
                          />
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('city')}
                        >
                          <div className="flex items-center justify-between">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium">Telefon</TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('rating')}
                        >
                          <div className="flex items-center justify-between">
                            Értékelés
                            <SortIcon columnKey="rating" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('available')}
                        >
                          <div className="flex items-center justify-between">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium w-16">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bicycleServices.map((service) => {
                        const coords = getCoordinates(service);
                        return (
                          <TableRow 
                            key={service.id} 
                            className={`border-border hover:bg-muted/50 transition-colors ${
                              selectedRows.has(service.id) ? 'bg-primary/5' : ''
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.has(service.id)}
                                onCheckedChange={(checked) => handleSelectRow(service.id, checked)}
                                className="border-muted-foreground"
                              />
                            </TableCell>
                            <TableCell 
                              className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleRowClick(service, 'service')}
                            >
                              <div>
                                <div className="font-medium">{service.name}</div>
                                {coords && (
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{service.city}</TableCell>
                            <TableCell className="text-muted-foreground">{service.phone || 'Nincs'}</TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span>{service.rating || 'N/A'}</span>
                                {service.rating && <span className="text-yellow-500">⭐</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={service.available ? 'default' : 'destructive'}
                                className={
                                  service.available 
                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                    : 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
                                }
                              >
                                <div className="flex items-center gap-1">
                                  {service.available ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {service.available ? 'Aktív' : 'Inaktív'}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(service.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={() => handleRowClick(service, 'service')}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Részletek megtekintése
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditLocation(service)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Szerkesztés
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleAvailability('bicycleService', service.id, service.available)}
                                    className="cursor-pointer"
                                    disabled={toggleLoading === service.id}
                                  >
                                    {toggleLoading === service.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : service.available ? (
                                      <EyeOff className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    {service.available ? 'Deaktiválás' : 'Aktiválás'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick('bicycleService', service.id)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Törlés
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    </Table>
                  </div>

                  {bicycleServices.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek szervizek'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'Próbálj meg más keresési kifejezést használni.' 
                          : 'Kattints az "Új hozzáadása" gombra az első szerviz létrehozásához.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Repair Stations Table */}
              {activeTab === 'repair' && (
                <div className="max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
                  {/* Table Header with Bulk Actions */}
                  {selectedRows.size > 0 && (
                    <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {selectedRows.size} kijelölt
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedRows.size} javító állomás kijelölve
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRows(new Set());
                            setSelectAll(false);
                          }}
                          className="border-border"
                        >
                          Kijelölés törlése
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-auto">
                    <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border hover:bg-muted/80">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            className="border-muted-foreground"
                          />
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('city')}
                        >
                          <div className="flex items-center justify-between">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('covered')}
                        >
                          <div className="flex items-center justify-between">
                            Fedett
                            <SortIcon columnKey="covered" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('free')}
                        >
                          <div className="flex items-center justify-between">
                            Ingyenes
                            <SortIcon columnKey="free" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('available')}
                        >
                          <div className="flex items-center justify-between">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center justify-between">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium w-16">Műveletek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repairStations.map((station) => {
                        const coords = getCoordinates(station);
                        return (
                          <TableRow 
                            key={station.id} 
                            className={`border-border hover:bg-muted/50 transition-colors ${
                              selectedRows.has(station.id) ? 'bg-primary/5' : ''
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.has(station.id)}
                                onCheckedChange={(checked) => handleSelectRow(station.id, checked)}
                                className="border-muted-foreground"
                              />
                            </TableCell>
                            <TableCell 
                              className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleRowClick(station, 'repair')}
                            >
                              <div>
                                <div className="font-medium">{station.name}</div>
                                {coords && (
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{station.city}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={station.covered ? 'default' : 'secondary'}
                                className={
                                  station.covered 
                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                                    ? 'bg-primary hover:bg-primary/80 text-primary-foreground' 
                                    : 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
                                }
                              >
                                <div className="flex items-center gap-1">
                                  {station.available ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {station.available ? 'Aktív' : 'Inaktív'}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(station.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={() => handleRowClick(station, 'repair')}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Részletek megtekintése
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditLocation(station)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Szerkesztés
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleAvailability('repairStation', station.id, station.available)}
                                    className="cursor-pointer"
                                    disabled={toggleLoading === station.id}
                                  >
                                    {toggleLoading === station.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : station.available ? (
                                      <EyeOff className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    {station.available ? 'Deaktiválás' : 'Aktiválás'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick('repairStation', station.id)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Törlés
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    </Table>
                  </div>

                  {repairStations.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Wrench className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? 'Nincs találat' : 'Nincsenek javító állomások'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'Próbálj meg más keresési kifejezést használni.' 
                          : 'Kattints az "Új hozzáadása" gombra az első javító állomás létrehozásához.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Modern Pagination */}
              {totalCount > pageSize && (
                <div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between p-4">
                    {/* Page Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Oldal</span>
                      <Badge variant="outline" className="border-border text-foreground">
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
                        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Első
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Előző
                      </Button>
                      
                      <Separator orientation="vertical" className="h-6 bg-border mx-2" />
                      
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
                                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200'
                                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200'
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Separator orientation="vertical" className="h-6 bg-border mx-2" />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Következő
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
          <Card className="bg-card border-border w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-destructive/20 border-2 border-destructive/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-foreground text-xl font-semibold">Megerősítés szükséges</CardTitle>
              <CardDescription className="text-muted-foreground mt-2 leading-relaxed">
                Biztosan törölni szeretnéd ezt az elemet? Ez a művelet nem vonható vissza, és az összes kapcsolódó adat is elvész!
              </CardDescription>
            </CardHeader>
            
            <Separator className="bg-border" />
            
            <CardContent className="pt-6">
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModal({ show: false, table: null, id: null })}
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 min-w-[80px]"
                >
                  Mégse
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-destructive/25 transition-all duration-200 min-w-[80px]"
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

      {/* User Detail Modal - Compact Design */}
      {detailModal.type === 'user' && (
        <Dialog open={detailModal.show} onOpenChange={closeDetailModal}>
          <DialogContent className="admin-dark max-w-2xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
            <div className="flex flex-col h-[85vh]">
              {/* Header */}
              <div className="p-6 border-b border-border flex-shrink-0">
                <DialogTitle className="text-foreground flex items-center gap-4 text-xl font-bold">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate">
                      {detailModal.item?.username || 'Felhasználó'}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 truncate">
                      Felhasználói profil és beállítások
                    </p>
                  </div>
                </DialogTitle>
              </div>

              {/* Scrollable Content */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {detailModal.item && (
                    <div className="space-y-6">
                      {/* User Profile Section */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span>Felhasználói adatok</span>
                        </h3>
                        <div className="space-y-6">
                          {/* Profile Section */}
                          <div className="flex items-start gap-6">
                            <Avatar className="h-20 w-20 ring-2 ring-border flex-shrink-0">
                              <AvatarImage src={detailModal.item.avatar_url} alt={detailModal.item.username || 'User'} />
                              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                                {(detailModal.item.username || detailModal.item.email || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-3">
                              <div>
                                <h3 className="font-semibold text-foreground text-2xl">{detailModal.item.username || 'Nincs megadva'}</h3>
                                <p className="text-muted-foreground text-base truncate">{detailModal.item.email}</p>
                              </div>
                              <Badge 
                                variant={detailModal.item.role === 'admin' ? 'default' : 'secondary'}
                                className={`text-sm px-3 py-1 ${detailModal.item.role === 'admin' ? 'bg-primary hover:bg-primary/80 text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                              >
                                {detailModal.item.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                              </Badge>
                            </div>
                          </div>
                          
                          <Separator className="bg-border" />
                          
                          {/* Contact Information */}
                          <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-foreground">Email cím</p>
                                <p className="text-sm text-muted-foreground truncate mt-1">{detailModal.item.email || 'Nincs megadva'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-foreground">Telefonszám</p>
                                <p className="text-sm text-muted-foreground mt-1">{detailModal.item.phone || 'Nincs megadva'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-foreground">Regisztráció dátuma</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {detailModal.item.created_at
                                    ? new Date(detailModal.item.created_at).toLocaleDateString('hu-HU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'Ismeretlen'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional User Stats */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Aktivitás</span>
                        </h3>
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground text-sm">Jelenleg nincs aktivitási információ elérhető erről a felhasználóról.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="p-6 border-t border-border flex-shrink-0">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={closeDetailModal}
                    className="px-8"
                  >
                    Bezárás
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Marker Detail Modal - Old Admin Design with Shadcn */}
      {detailModal.type !== 'user' && (
        <Dialog open={detailModal.show} onOpenChange={closeDetailModal}>
          <DialogContent className="admin-dark max-w-4xl max-h-[90vh] overflow-hidden bg-card border-border p-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {detailModal.item?.name || 'Helyszín'}
                </DialogTitle>
                <Badge variant={detailModal.item?.available ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs">
                  {detailModal.item?.available ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Aktív
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inaktív
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {detailModal.item && (
                  <>
                    {/* Image Gallery */}
                    {detailModal.item.picture_url && detailModal.item.picture_url.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                          <Eye className="h-4 w-4" />
                          Képek ({detailModal.item.picture_url.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {detailModal.item.picture_url.map((url, index) => (
                            <div
                              key={index}
                              className="relative w-28 h-28 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors group"
                              onClick={() => setImagePreviewUrl(url)}
                            >
                              <img 
                                src={url} 
                                alt={`${detailModal.item.name} - ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alapadatok */}
                    <div>
                      <h3 className="text-base font-semibold mb-3">Alapadatok</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-3">
                          <div className="flex-1 min-w-[200px]">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                              <MapPin className="h-3 w-3" />
                              Város
                            </p>
                            <p className="text-sm font-medium">{detailModal.item.city}</p>
                          </div>
                          
                          {(detailModal.type === 'parking' || detailModal.type === 'repair') && detailModal.item.covered !== undefined && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Shield className="h-3 w-3" />
                                Fedett
                              </p>
                              <p className="text-sm font-medium">{detailModal.item.covered ? 'Igen' : 'Nem'}</p>
                            </div>
                          )}
                          
                          {detailModal.type === 'parking' && detailModal.item.is_open_24h !== undefined && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Clock className="h-3 w-3" />
                                24 órás
                              </p>
                              <p className="text-sm font-medium">{detailModal.item.is_open_24h ? 'Igen' : 'Nem'}</p>
                            </div>
                          )}
                          
                          {detailModal.type === 'parking' && detailModal.item.has_camera !== undefined && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Camera className="h-3 w-3" />
                                Kamera
                              </p>
                              <p className="text-sm font-medium">{detailModal.item.has_camera ? 'Igen' : 'Nem'}</p>
                            </div>
                          )}
                          
                          {detailModal.type === 'parking' && detailModal.item.capacity_level && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Users className="h-3 w-3" />
                                Kapacitás
                              </p>
                              <p className="text-sm font-medium">
                                {detailModal.item.capacity_level === 'small' ? 'Kis (1-10 hely)' :
                                 detailModal.item.capacity_level === 'medium' ? 'Közepes (11-50 hely)' :
                                 detailModal.item.capacity_level === 'large' ? 'Nagy (50+ hely)' :
                                 detailModal.item.capacity_level}
                              </p>
                            </div>
                          )}
                          
                          {detailModal.type === 'repair' && detailModal.item.free !== undefined && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Star className="h-3 w-3" />
                                Ingyenes
                              </p>
                              <p className="text-sm font-medium">{detailModal.item.free ? 'Igen' : 'Nem'}</p>
                            </div>
                          )}
                          
                          {detailModal.type === 'service' && detailModal.item.phone && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Phone className="h-3 w-3" />
                                Telefonszám
                              </p>
                              <p className="text-sm font-medium">{detailModal.item.phone}</p>
                            </div>
                          )}
                          
                          {detailModal.type === 'service' && detailModal.item.rating && (
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <Star className="h-3 w-3" />
                                Értékelés
                              </p>
                              <p className="text-sm font-medium">{detailModal.item.rating} / 5</p>
                            </div>
                          )}
                        </div>
                        
                        {detailModal.type === 'parking' && detailModal.item.description && (
                          <div className="w-full">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                              <Eye className="h-3 w-3" />
                              Leírás
                            </p>
                            <p className="text-sm">{detailModal.item.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coordinates & Map */}
                    {(() => {
                      const coords = getCoordinates(detailModal.item);
                      return coords ? (
                        <>
                          <div>
                            <h3 className="text-base font-semibold mb-3">Koordináták</h3>
                            <div className="flex gap-6">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-0.5">Szélesség (Latitude)</p>
                                <p className="text-sm font-mono font-semibold">{coords.lat.toFixed(6)}</p>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-0.5">Hosszúság (Longitude)</p>
                                <p className="text-sm font-mono font-semibold">{coords.lon.toFixed(6)}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                              <MapPin className="h-4 w-4" />
                              Térkép
                            </h3>
                            <div className="rounded-lg overflow-hidden border border-border mb-3">
                              <iframe
                                width="100%"
                                height="350"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coords.lon - 0.002).toFixed(6)},${(coords.lat - 0.002).toFixed(6)},${(coords.lon + 0.002).toFixed(6)},${(coords.lat + 0.002).toFixed(6)}&layer=mapnik&marker=${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`}
                                allowFullScreen
                                title="Location Map"
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              size="sm"
                              onClick={() => window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`, '_blank')}
                            >
                              <MapPin className="h-3.5 w-3.5 mr-2" />
                              Megnyitás Google Maps-en
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div>
                          <h3 className="text-base font-semibold mb-3">Koordináták</h3>
                          <p className="text-sm text-muted-foreground">Koordináták nem érhetők el</p>
                        </div>
                      );
                    })()}

                    {/* Database Info */}
                    <div>
                      <h3 className="text-base font-semibold mb-3">Adatbázis információk</h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-xs text-muted-foreground mb-0.5">ID</p>
                          <p className="text-xs font-mono text-foreground break-all">{detailModal.item.id}</p>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-xs text-muted-foreground mb-0.5">Létrehozva</p>
                          <p className="text-xs font-medium">
                            {new Date(detailModal.item.created_at).toLocaleDateString('hu-HU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-xs text-muted-foreground mb-0.5">Módosítva</p>
                          <p className="text-xs font-medium">
                            {new Date(detailModal.item.updated_at).toLocaleDateString('hu-HU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border flex justify-end gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={closeDetailModal}>
                Bezárás
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  handleEditLocation(detailModal.item);
                  closeDetailModal();
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Szerkesztés
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
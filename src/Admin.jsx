import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabaseClient';
import AddLocationModal from './AddLocationModal';
import EditLocationModal from './EditLocationModal';
import './Admin.css';
import { lockScroll, unlockScroll } from './utils/modalLock';
import ImagePreview from './components/ImagePreview';

function Admin() {
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
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Items per page
  const [totalCount, setTotalCount] = useState(0);
  const [toggleLoading, setToggleLoading] = useState(null); // Track which item is being toggled
  const [detailModal, setDetailModal] = useState({ show: false, item: null, type: null });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [addLocationModal, setAddLocationModal] = useState(false);
  const [editLocationModal, setEditLocationModal] = useState({ show: false, item: null });

  // Lock body scroll whenever any top-level modal is open
  useEffect(() => {
    const anyOpen = detailModal.show || addLocationModal || editLocationModal.show || showModal;
    if (anyOpen) {
      lockScroll();
      return () => unlockScroll();
    }
    // ensure unlock when none are open
    unlockScroll();
  }, [detailModal.show, addLocationModal, editLocationModal.show, showModal]);

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
          console.log('Fetched parking spots:', data);
          if (data && data.length > 0) {
            console.log('First parking spot sample:', data[0]);
            console.log('Coordinate field:', data[0].coordinate);
          }
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
          console.log('Fetched services:', data);
          if (data && data.length > 0) {
            console.log('First service sample:', data[0]);
          }
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
          console.log('Fetched repair stations:', data);
          if (data && data.length > 0) {
            console.log('First repair station sample:', data[0]);
          }
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

  const [deleteModal, setDeleteModal] = useState({ show: false, table: null, id: null });
  const [userDetail, setUserDetail] = useState({ show: false, user: null });
  const [userDeleteModal, setUserDeleteModal] = useState({ show: false, user: null });

  const handleDeleteClick = (table, id) => {
    setDeleteModal({ show: true, table, id });
  };

  const confirmDelete = async () => {
    const { table, id } = deleteModal;
    setDeleteModal({ show: false, table: null, id: null });

    try {
      // Fetch picture_url before delete so we can clean up storage
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

      // Remove related images from storage bucket (best-effort)
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

      // Refetch data from server to update counts and pagination
      if (activeTab === 'users') {
        // Refetch users if we add delete for users later
      } else {
        await fetchAllData();
      }

      alert('Elem sikeresen törölve!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Hiba történt a törlés során.');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, table: null, id: null });
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
    // Refresh the data after adding a new location
    await fetchAllData();
  };

  const handleEditLocation = (item) => {
    setEditLocationModal({ show: true, item });
  };

  const closeEditLocationModal = () => {
    setEditLocationModal({ show: false, item: null });
  };

  const handleLocationUpdated = async () => {
    // Refresh the data after updating a location
    await fetchAllData();
  };

  // Parse PostGIS WKB format to extract lat/lon
  const parseWKBPoint = (wkb) => {
    console.log('parseWKBPoint called with:', wkb, 'Type:', typeof wkb);
    
    if (!wkb) {
      console.log('WKB is null/undefined');
      return null;
    }
    
    // Handle GeoJSON format (if Supabase returns it)
    if (typeof wkb === 'object' && wkb.type === 'Point' && Array.isArray(wkb.coordinates)) {
      console.log('Found GeoJSON Point format');
      const [lon, lat] = wkb.coordinates;
      return { lat, lon };
    }
    
    if (typeof wkb !== 'string') {
      console.log('WKB is not a string, type:', typeof wkb);
      return null;
    }
    
    try {
      // Remove '0101000020E6100000' prefix (byte order, type, SRID)
      // WKB format: 01 01000020 E6100000 [longitude 8 bytes] [latitude 8 bytes]
      const coordsHex = wkb.substring(18); // Skip first 18 chars
      
      if (coordsHex.length < 32) {
        console.log('Coords hex too short:', coordsHex.length);
        return null;
      }
      
      // Extract longitude (first 16 hex chars = 8 bytes)
      const lonHex = coordsHex.substring(0, 16);
      // Extract latitude (next 16 hex chars = 8 bytes)
      const latHex = coordsHex.substring(16, 32);
      
      console.log('Parsing hex - lon:', lonHex, 'lat:', latHex);
      
      // Convert hex to double (little endian)
      const lonBuffer = new ArrayBuffer(8);
      const lonView = new DataView(lonBuffer);
      for (let i = 0; i < 8; i++) {
        lonView.setUint8(i, parseInt(lonHex.substr(i * 2, 2), 16));
      }
      const lon = lonView.getFloat64(0, true); // true = little endian
      
      const latBuffer = new ArrayBuffer(8);
      const latView = new DataView(latBuffer);
      for (let i = 0; i < 8; i++) {
        latView.setUint8(i, parseInt(latHex.substr(i * 2, 2), 16));
      }
      const lat = latView.getFloat64(0, true);
      
      console.log('Parsed coordinates:', { lat, lon });
      return { lat, lon };
    } catch (error) {
      console.error('Error parsing WKB:', error);
      return null;
    }
  };

  // Get coordinates from item (handles both WKB and direct lat/lon)
  const getCoordinates = (item) => {
    console.log('getCoordinates called with item:', item);
    
    // Try direct lat/lon first
    if (item.lat && item.lon) {
      console.log('Using direct lat/lon');
      return { lat: item.lat, lon: item.lon };
    }
    
    // Try parsing WKB coordinate field
    if (item.coordinate) {
      console.log('Attempting to parse coordinate field');
      return parseWKBPoint(item.coordinate);
    }
    
    console.log('No coordinates found in item');
    return null;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Server-side filtering and sorting, no need for client-side functions
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="sort-icon neutral" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="sort-icon asc" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      );
    }
    return (
      <svg className="sort-icon desc" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  const handleToggleAvailability = async (table, id, currentStatus) => {
    setToggleLoading(id); // Set loading state
    
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
      
      console.log(`✅ Availability toggled for ${table} (ID: ${id}): ${currentStatus} → ${newStatus}`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(`Hiba történt a státusz módosítása során: ${error.message}`);
      
      // Refetch data on error to ensure consistency
      await fetchAllData();
    } finally {
      setToggleLoading(null); // Clear loading state
    }
  };

  if (loading || !profile) {
    return (
      <div className="admin-page">
        <div className="admin-loading"><span className="spinner" /></div>
      </div>
    );
  }

  // Extra safety check - only render admin content for admin users
  if (profile.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-loading">Hozzáférés megtagadva...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">
            <img src="/logo.png" alt="ParkSafe" />
          </div>
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Felhasználók
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Parkolók
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Szervizek
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'repair' ? 'active' : ''}`}
            onClick={() => setActiveTab('repair')}
          >
            <svg className="nav-icon" viewBox="0 0 35 35" fill="none" stroke="currentColor">
            <path d="M31.449 6.748c-0.337-0.155-0.737-0.096-1.017 0.152l-5.041 4.528-4.551-4.669 4.506-5.204c0.245-0.283 0.305-0.673 0.152-1.016s-0.489-0.553-0.86-0.553h-0.271c-2.785 0-7.593 0.239-9.739 2.417l-0.433 0.43c-2.29 2.337-2.697 6.168-1.49 9.081l-11.54 11.778c-1.556 1.578-1.556 4.135 0 5.713l1.409 1.428c0.778 0.788 1.798 1.183 2.818 1.183s2.040-0.395 2.817-1.183l11.71-11.804c1.107 0.599 2.625 0.989 3.899 0.989 2.043 0 3.98-0.824 5.454-2.32l0.427-0.433c2.331-2.364 2.296-7.416 2.306-9.638 0.001-0.378-0.216-0.721-0.554-0.878zM28.302 15.906l-0.371 0.433c-1.117 1.134-2.578 1.677-4.114 1.677-0.76 0-1.784-0.143-2.476-0.431-0.625-0.259-1.206-0.634-1.725-1.107l-12.818 12.925c-0.376 0.382-0.876 0.592-1.408 0.592s-1.032-0.21-1.409-0.592l-1.408-1.427c-0.777-0.788-0.777-2.070-0.001-2.857l12.524-12.777c-0.42-0.611-0.706-1.278-0.877-1.968h-0.001c-0.482-1.95-0.201-4.644 1.313-6.189l0.431-0.435c1.298-1.317 4.67-1.707 6.537-1.822l-3.668 4.236c-0.328 0.379-0.311 0.95 0.038 1.309l5.798 5.948c0.352 0.362 0.92 0.383 1.299 0.047l4.082-3.676c-0.122 1.98-0.506 4.856-1.748 6.115z"></path>            </svg>
            Javító Állomások
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/profile')} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Vissza a profilhoz
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">
              {activeTab === 'users' && 'Felhasználók'}
              {activeTab === 'parking' && 'Bicikli Parkolók'}
              {activeTab === 'services' && 'Szervizek & Boltok'}
              {activeTab === 'repair' && 'Javító Állomások'}
            </h1>
            <p className="admin-subtitle">
              {activeTab === 'users' && 'Összes regisztrált felhasználó kezelése'}
              {activeTab === 'parking' && 'Bicikli parkolók létrehozása és kezelése'}
              {activeTab === 'services' && 'Kerékpár szervizek és boltok kezelése'}
              {activeTab === 'repair' && 'Önkiszolgáló javító állomások kezelése'}
            </p>
          </div>
          <div className="admin-header-actions">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder={
                  activeTab === 'users' ? 'Keresés név vagy email alapján...' :
                  activeTab === 'parking' ? 'Keresés név, város vagy leírás alapján...' :
                  activeTab === 'services' ? 'Keresés név vagy város alapján...' :
                  'Keresés név vagy város alapján...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {activeTab !== 'users' && (
              <button className="btn-add-location" onClick={handleAddLocation}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Új hozzáadása
              </button>
            )}
            <div className="stat-badge">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">
                {searchTerm ? 'Találat' : 'Összes elem'}
              </span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">
                {currentPage} / {totalPages || 1}
              </span>
              <span className="stat-label">Oldal</span>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {(usersLoading || dataLoading) ? (
            <div className="loading-state">
              <div className="spinner"></div>
              {loadingProgress.total > 0 ? (
                <>
                  <p>Adatok betöltése... {loadingProgress.current} / {loadingProgress.total}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {Math.round((loadingProgress.current / loadingProgress.total) * 100)}%
                  </p>
                </>
              ) : (
                <p>{activeTab === 'users' ? 'Felhasználók betöltése...' : 'Adatok betöltése...'}</p>
              )}
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Avatar</th>
                        <th className="sortable" onClick={() => handleSort('username')}>
                          <div className="th-content">
                            Felhasználónév
                            <SortIcon columnKey="username" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('email')}>
                          <div className="th-content">
                            Email
                            <SortIcon columnKey="email" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('role')}>
                          <div className="th-content">
                            Szerepkör
                            <SortIcon columnKey="role" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('created_at')}>
                          <div className="th-content">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </th>
                        <th>Telefonszám</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="clickable-row" onClick={() => setUserDetail({ show: true, user })}>
                          <td>
                            <div className="user-avatar">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username || 'User'} />
                              ) : (
                                <div className="avatar-placeholder-small">
                                  {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="user-username">
                              {user.username || 'Nincs megadva'}
                            </span>
                          </td>
                          <td>
                            <span className="user-email">{user.email || 'Nincs email'}</span>
                          </td>
                          <td>
                            <span className={`role-badge ${user.role || 'user'}`}>
                              {user.role === 'admin' ? 'Admin' : 'Felhasználó'}
                            </span>
                          </td>
                          <td>
                            <span className="user-date">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Ismeretlen'}
                            </span>
                          </td>
                          <td>
                            <span className="user-phone">
                              {user.phone || 'Nincs megadva'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="empty-state">
                      <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p>{searchTerm ? 'Nincs találat' : 'Nincsenek felhasználók'}</p>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <div className="pagination-numbers">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'parking' && (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSort('name')}>
                          <div className="th-content">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('city')}>
                          <div className="th-content">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </th>
                        <th>Leírás</th>
                        <th className="sortable" onClick={() => handleSort('covered')}>
                          <div className="th-content">
                            Fedett
                            <SortIcon columnKey="covered" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('available')}>
                          <div className="th-content">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('created_at')}>
                          <div className="th-content">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parkingSpots.map((spot) => {
                        const coords = getCoordinates(spot);
                        return (
                        <tr key={spot.id} className="clickable-row" onClick={() => handleRowClick(spot, 'parking')}>
                          <td><span className="user-username">{spot.name}</span></td>
                          <td><span className="user-email">{spot.city}</span></td>
                          <td>
                            <span className="user-email">{spot.description || 'Nincs leírás'}</span>
                            {coords && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`role-badge ${spot.covered ? 'admin' : 'user'}`}>
                              {spot.covered ? 'Igen' : 'Nem'}
                            </span>
                          </td>
                          <td>
                            <span className={`role-badge ${spot.available ? 'admin' : 'user'}`}>
                              {spot.available ? 'Aktív' : 'Inaktív'}
                            </span>
                          </td>
                          <td>
                            <span className="user-date">
                              {new Date(spot.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-buttons">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLocation(spot);
                                }}
                                className="btn-edit"
                                title="Szerkesztés"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAvailability('parkingSpots', spot.id, spot.available);
                                }}
                                className={`btn-toggle ${spot.available ? 'active' : 'inactive'} ${toggleLoading === spot.id ? 'loading' : ''}`}
                                title={spot.available ? 'Deaktiválás' : 'Aktiválás'}
                                disabled={toggleLoading === spot.id}
                              >
                                {spot.available ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick('parkingSpots', spot.id);
                                }}
                                className="btn-delete"
                                title="Törlés"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {parkingSpots.length === 0 && (
                    <div className="empty-state">
                      <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <p>{searchTerm ? 'Nincs találat' : 'Nincsenek parkolók'}</p>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <div className="pagination-numbers">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'services' && (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSort('name')}>
                          <div className="th-content">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('city')}>
                          <div className="th-content">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </th>
                        <th>Telefon</th>
                        <th className="sortable" onClick={() => handleSort('rating')}>
                          <div className="th-content">
                            Értékelés
                            <SortIcon columnKey="rating" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('available')}>
                          <div className="th-content">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('created_at')}>
                          <div className="th-content">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bicycleServices.map((service) => {
                        const coords = getCoordinates(service);
                        return (
                        <tr key={service.id} className="clickable-row" onClick={() => handleRowClick(service, 'service')}>
                          <td>
                            <span className="user-username">{service.name}</span>
                            {coords && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                              </div>
                            )}
                          </td>
                          <td><span className="user-email">{service.city}</span></td>
                          <td><span className="user-phone">{service.phone || 'Nincs'}</span></td>
                          <td><span className="user-email">{service.rating || 'N/A'} ⭐</span></td>
                          <td>
                            <span className={`role-badge ${service.available ? 'admin' : 'user'}`}>
                              {service.available ? 'Aktív' : 'Inaktív'}
                            </span>
                          </td>
                          <td>
                            <span className="user-date">
                              {new Date(service.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-buttons">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLocation(service);
                                }}
                                className="btn-edit"
                                title="Szerkesztés"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAvailability('bicycleService', service.id, service.available);
                                }}
                                className={`btn-toggle ${service.available ? 'active' : 'inactive'} ${toggleLoading === service.id ? 'loading' : ''}`}
                                title={service.available ? 'Deaktiválás' : 'Aktiválás'}
                                disabled={toggleLoading === service.id}
                              >
                                {service.available ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick('bicycleService', service.id);
                                }}
                                className="btn-delete"
                                title="Törlés"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {bicycleServices.length === 0 && (
                    <div className="empty-state">
                      <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p>{searchTerm ? 'Nincs találat' : 'Nincsenek szervizek'}</p>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <div className="pagination-numbers">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'repair' && (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSort('name')}>
                          <div className="th-content">
                            Név
                            <SortIcon columnKey="name" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('city')}>
                          <div className="th-content">
                            Város
                            <SortIcon columnKey="city" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('covered')}>
                          <div className="th-content">
                            Fedett
                            <SortIcon columnKey="covered" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('free')}>
                          <div className="th-content">
                            Ingyenes
                            <SortIcon columnKey="free" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('available')}>
                          <div className="th-content">
                            Státusz
                            <SortIcon columnKey="available" />
                          </div>
                        </th>
                        <th className="sortable" onClick={() => handleSort('created_at')}>
                          <div className="th-content">
                            Létrehozva
                            <SortIcon columnKey="created_at" />
                          </div>
                        </th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairStations.map((station) => {
                        const coords = getCoordinates(station);
                        return (
                        <tr key={station.id} className="clickable-row" onClick={() => handleRowClick(station, 'repair')}>
                          <td>
                            <span className="user-username">{station.name}</span>
                            {coords && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                              </div>
                            )}
                          </td>
                          <td><span className="user-email">{station.city}</span></td>
                          <td>
                            <span className={`role-badge ${station.covered ? 'admin' : 'user'}`}>
                              {station.covered ? 'Igen' : 'Nem'}
                            </span>
                          </td>
                          <td>
                            <span className={`role-badge ${station.free ? 'admin' : 'user'}`}>
                              {station.free ? 'Igen' : 'Nem'}
                            </span>
                          </td>
                          <td>
                            <span className={`role-badge ${station.available ? 'admin' : 'user'}`}>
                              {station.available ? 'Aktív' : 'Inaktív'}
                            </span>
                          </td>
                          <td>
                            <span className="user-date">
                              {new Date(station.created_at).toLocaleDateString('hu-HU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-buttons">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLocation(station);
                                }}
                                className="btn-edit"
                                title="Szerkesztés"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAvailability('repairStation', station.id, station.available);
                                }}
                                className={`btn-toggle ${station.available ? 'active' : 'inactive'} ${toggleLoading === station.id ? 'loading' : ''}`}
                                title={station.available ? 'Deaktiválás' : 'Aktiválás'}
                                disabled={toggleLoading === station.id}
                              >
                                {station.available ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick('repairStation', station.id);
                                }}
                                className="btn-delete"
                                title="Törlés"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {repairStations.length === 0 && (
                    <div className="empty-state">
                      <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      <p>{searchTerm ? 'Nincs találat' : 'Nincsenek javító állomások'}</p>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <div className="pagination-numbers">
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <svg className="modal-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3>Megerősítés szükséges</h3>
            </div>
            <div className="modal-body">
              <p>Biztosan törölni szeretnéd ezt az elemet?</p>
              <p className="modal-warning">Ez a művelet nem vonható vissza!</p>
            </div>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                Mégse
              </button>
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}

      {userDetail.show && userDetail.user && (
        <div className="modal-overlay" onClick={() => setUserDetail({ show: false, user: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Felhasználó részletei</h3>
            </div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              <p><strong>Felhasználónév:</strong> {userDetail.user.username || '—'}</p>
              <p><strong>Email:</strong> {userDetail.user.email}</p>
              <p><strong>Szerepkör:</strong> {userDetail.user.role}</p>
              {userDetail.user.full_name && <p><strong>Név:</strong> {userDetail.user.full_name}</p>}
              {userDetail.user.phone && <p><strong>Telefon:</strong> {userDetail.user.phone}</p>}
              {userDetail.user.created_at && (
                <p><strong>Regisztráció:</strong> {new Date(userDetail.user.created_at).toLocaleString('hu-HU')}</p>
              )}
              {userDetail.user.updated_at && (
                <p><strong>Frissítve:</strong> {new Date(userDetail.user.updated_at).toLocaleString('hu-HU')}</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setUserDetail({ show: false, user: null })}>Bezárás</button>
              <button className="btn-confirm-delete" onClick={() => setUserDeleteModal({ show: true, user: userDetail.user })}>Felhasználó törlése</button>
            </div>
          </div>
        </div>
      )}

      {userDeleteModal.show && userDeleteModal.user && (
        <div className="modal-overlay" onClick={() => setUserDeleteModal({ show: false, user: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Biztosan törlöd a felhasználót?</h3>
            </div>
            <div className="modal-body">
              <p>{userDeleteModal.user.email}</p>
              <p className="modal-warning">Ez a művelet nem vonható vissza.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setUserDeleteModal({ show: false, user: null })}>Mégse</button>
              <button className="btn-confirm-delete" onClick={async () => {
                try {
                  const { error } = await supabase.from('profiles').delete().eq('id', userDeleteModal.user.id);
                  if (error) throw error;
                  setUserDeleteModal({ show: false, user: null });
                  setUserDetail({ show: false, user: null });
                  await fetchAllData();
                } catch (err) {
                  alert('Hiba a felhasználó törlése közben: ' + (err.message || 'Ismeretlen hiba'));
                }
              }}>Törlés</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {detailModal.show && detailModal.item && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="detail-modal-content" key={detailModal.item.id} onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-header-left">
                <h2>{detailModal.item.name}</h2>
                <span className={`status-badge ${detailModal.item.available ? 'active' : 'inactive'}`}>
                  {detailModal.item.available ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', marginRight: '4px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Aktív
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', marginRight: '4px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Inaktív
                    </>
                  )}
                </span>
              </div>
              <button className="close-btn" onClick={closeDetailModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="detail-modal-body">
              {/* Image Gallery */}
              {detailModal.item.picture_url && detailModal.item.picture_url.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Képek ({detailModal.item.picture_url.length})
                  </h3>
                  <div className="detail-image-gallery">
                    {detailModal.item.picture_url.map((url, index) => (
                      <div
                        key={index}
                        className="detail-image-item"
                        onClick={() => setImagePreviewUrl(url)}
                        title="Kattints a nagyításhoz"
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={url} alt={`${detailModal.item.name} - ${index + 1}`} />
                        <div className="detail-image-number">{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Alapadatok</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Város
                    </span>
                    <span className="detail-value">{detailModal.item.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Leírás
                    </span>
                    <span className="detail-value">{detailModal.item.description || 'Nincs leírás'}</span>
                  </div>
                  
                  {/* Parking specific fields */}
                  {detailModal.type === 'parking' && detailModal.item.covered !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Fedett
                      </span>
                      <span className="detail-value">{detailModal.item.covered ? 'Igen' : 'Nem'}</span>
                    </div>
                  )}
                  
                  {/* Repair station specific fields */}
                  {detailModal.type === 'repair' && (
                    <>
                      {detailModal.item.covered !== undefined && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Fedett
                          </span>
                          <span className="detail-value">{detailModal.item.covered ? 'Igen' : 'Nem'}</span>
                        </div>
                      )}
                      {detailModal.item.free !== undefined && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ingyenes
                          </span>
                          <span className="detail-value">{detailModal.item.free ? 'Igen' : 'Nem'}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Service specific fields */}
                  {detailModal.type === 'service' && (
                    <>
                      {detailModal.item.phone && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Telefonszám
                          </span>
                          <span className="detail-value">{detailModal.item.phone}</span>
                        </div>
                      )}
                      {detailModal.item.website && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Weboldal
                          </span>
                          <span className="detail-value">
                            <a href={detailModal.item.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                              {detailModal.item.website}
                            </a>
                          </span>
                        </div>
                      )}
                      {detailModal.item.opening_hours && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Nyitvatartás
                          </span>
                          <span className="detail-value">{detailModal.item.opening_hours}</span>
                        </div>
                      )}
                      {detailModal.item.rating && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Értékelés
                          </span>
                          <span className="detail-value">{detailModal.item.rating} / 5</span>
                        </div>
                      )}
                      {detailModal.item.price_range && (
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Árkategória
                          </span>
                          <span className="detail-value">{detailModal.item.price_range}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {(() => {
                const coords = getCoordinates(detailModal.item);
                return coords ? (
                  <>
                    <div className="detail-section">
                      <h3>Koordináták</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Szélesség (Latitude)
                          </span>
                          <span className="detail-value">{coords.lat.toFixed(6)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Hosszúság (Longitude)
                          </span>
                          <span className="detail-value">{coords.lon.toFixed(6)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Térkép
                      </h3>
                      <div className="map-container">
                        <iframe
                          width="100%"
                          height="400"
                          frameBorder="0"
                          style={{ border: 0, borderRadius: '12px' }}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
                          allowFullScreen
                          title="Location Map"
                        ></iframe>
                        <div className="map-links">
                          <a 
                            href={`https://www.google.com/maps?q=${coords.lat},${coords.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="map-link"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Megnyitás Google Maps-en
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="detail-section">
                    <h3>Koordináták</h3>
                    <div className="detail-item">
                      <span className="detail-value">Koordináták nem érhetők el</span>
                    </div>
                  </div>
                );
              })()}


              <div className="detail-section">
                <h3>Adatbázis információk</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      ID
                    </span>
                    <span className="detail-value small">{detailModal.item.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Létrehozva
                    </span>
                    <span className="detail-value">
                      {new Date(detailModal.item.created_at).toLocaleDateString('hu-HU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Módosítva
                    </span>
                    <span className="detail-value">
                      {new Date(detailModal.item.updated_at).toLocaleDateString('hu-HU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-modal-footer">
              <button className="btn-secondary" onClick={closeDetailModal}>
                Bezárás
              </button>
            </div>
          </div>
          {imagePreviewUrl && (
            <ImagePreview src={imagePreviewUrl} alt="Előnézet" onClose={() => setImagePreviewUrl(null)} />
          )}
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
    </div>
  );
}

export default Admin;

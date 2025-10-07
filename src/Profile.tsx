import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabaseClient';
import './Profile.css';

function Profile() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch profile data from Supabase
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url, role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);

    try {
      // Delete the user account from Supabase Auth
      const { error } = await supabase
        .rpc('delete_user_account', { user_id: user.id });
      
      if (error) {
        console.error('Error deleting account:', error);
        setDeleteError('Hiba történt a fiók törlése során. Kérjük, próbálja újra később.');
        setDeleteLoading(false);
        return;
      }

      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Hiba történt a fiók törlése során. Kérjük, próbálja újra később.');
      setDeleteLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1>Profil</h1>
  
          {isAdmin && (
            <div className="admin-badge">
              <svg className="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
            </div>
          )}
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h2>Fiók információk</h2>
            <div className="info-grid">
              {user.user_metadata?.full_name && (
                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-label">Teljes Név</div>
                    <div className="info-value">{user.user_metadata.full_name}</div>
                  </div>
                </div>
              )}

              <div className="info-item">
                <div className="info-icon-wrapper">
                  <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="info-content">
                  <div className="info-label">Email Cím</div>
                  <div className="info-value">{user.email}</div>
                </div>
              </div>

              {user.app_metadata?.provider && (
                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-label">Bejelentkezési Módszer</div>
                    <div className="info-value provider">
                      {user.app_metadata.provider === 'google' && (
                        <span className="provider-badge google">
                          <svg className="provider-icon" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google fiók
                        </span>
                      )}
                      {user.app_metadata.provider === 'email' && (
                        <span className="provider-badge email">
                          📧 Email & jelszó
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="info-item">
                <div className="info-icon-wrapper">
                  <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="info-content">
                  <div className="info-label">Fiók Létrehozva</div>
                  <div className="info-value">
                    {new Date(user.created_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon-wrapper">
                  <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="info-content">
                  <div className="info-label">Utolsó Belépés</div>
                  <div className="info-value">
                    {new Date(user.last_sign_in_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon-wrapper">
                  <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div className="info-content">
                  <div className="info-label">Felhasználó Azonosító</div>
                  <div className="info-value user-id" title={user.id}>{user.id}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <div className="button-group">
              {isAdmin && (
                <button onClick={() => navigate('/admin')} className="admin-button">
                  <svg className="admin-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </button>
              )}
              <button onClick={handleLogout} className="logout-button">
                <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Kijelentkezés
              </button>
            </div>

            <div className="danger-zone">
              <h3 className="danger-zone-title">Veszélyes zóna</h3>
              <p className="danger-zone-description">
                A fiók törlése végleges és nem vonható vissza. Minden adat véglegesen törlődik.
              </p>
              <button onClick={() => setShowDeleteModal(true)} className="delete-account-button">
                <svg className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Fiók törlése
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2>Fiók törlése</h2>
            </div>
            
            <div className="delete-modal-content">
              <p className="delete-warning">
                <strong>Figyelem!</strong> Ez a művelet véglegesen törli a fiókját és minden kapcsolódó adatot:
              </p>
              <ul className="delete-warning-list">
                <li>Profilinformációk</li>
                <li>Bejelentkezési adatok</li>
                <li>Minden mentett beállítás</li>
              </ul>
              <p className="delete-confirmation-text">
                Ez a művelet <strong>nem vonható vissza</strong>. Biztos, hogy folytatja?
              </p>
              
              {deleteError && (
                <div className="delete-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {deleteError}
                </div>
              )}
            </div>

            <div className="delete-modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="cancel-button"
                disabled={deleteLoading}
              >
                Mégsem
              </button>
              <button 
                onClick={handleDeleteAccount} 
                className="confirm-delete-button"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Törlés...' : 'Igen, törlöm a fiókomat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;


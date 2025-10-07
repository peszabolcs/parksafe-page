import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import "./Header.css";

function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="ParkSafe" className="logo-image" />
          <span className="logo-text">ParkSafe</span>
        </Link>
        <div className="header-actions">
          <Link to="/contact" className="contact-button">
            Írj nekünk
          </Link>
          {!loading && (
            <>
              {user ? (
                <Link to="/profile" className="profile-link">
                  Profil
                </Link>
              ) : (
                <Link to="/login" className="login-link">
                  Bejelentkezés
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

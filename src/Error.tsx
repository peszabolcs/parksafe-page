import { Link } from "react-router-dom";
import "./Error.css";

function Error() {
  return (
    <div className="error-page">
      <div className="container">
        <div className="error-content">
          <div className="error-icon">
            <div className="error-symbol">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
          </div>
          
          <h1 className="error-title">
            ❌ Hiba történt az email megerősítésekor
          </h1>
          
          <p className="error-description">
            Sajnálom, de valami hiba történt az email címed megerősítése során. 
            Ez különböző okok miatt fordulhat elő - az alábbi lépésekkel próbálkozz.
          </p>
          
          <div className="error-reasons">
            <div className="reason-item">
              <div className="reason-icon">🔗</div>
              <div className="reason-text">
                <strong>Lejárt link</strong><br />
                A megerősítő link csak 24 óráig érvényes
              </div>
            </div>
            <div className="reason-item">
              <div className="reason-icon">✉️</div>
              <div className="reason-text">
                <strong>Már megerősített</strong><br />
                Az email cím már korábban megerősítésre került
              </div>
            </div>
            <div className="reason-item">
              <div className="reason-icon">⚠️</div>
              <div className="reason-text">
                <strong>Hibás link</strong><br />
                A megerősítő link sérült vagy hibás
              </div>
            </div>
          </div>
          
          <div className="error-actions">
            <Link to="/contact" className="primary-button">
              📧 Segítség kérése
            </Link>
            <Link to="/" className="secondary-button">
              🏠 Vissza a főoldalra
            </Link>
          </div>
          
          <div className="error-help">
            <h3>Mit tehetsz?</h3>
            <ul>
              <li>Ellenőrizd, hogy a teljes linket másoltad-e át</li>
              <li>Próbáld meg újra regisztrálni az email címed</li>
              <li>Nézd meg a spam mappában a megerősítő emailt</li>
              <li>Írj nekünk, ha továbbra is problémád van</li>
            </ul>
          </div>
          
          <div className="error-footer">
            <p>
              <strong>Segítségre van szükséged?</strong><br />
              Írj nekünk a <a href="mailto:hello@parksafe.hu">hello@parksafe.hu</a> címre, 
              és 24-48 órán belül válaszolunk!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Error;

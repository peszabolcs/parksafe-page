import { Link } from "react-router-dom";
import "./EmailChangeSuccess.css";

function EmailChangeSuccess() {
  return (
    <div className="email-change-success-page">
      <div className="container">
        <div className="email-change-success-content">
          <div className="success-icon">
            <div className="success-checkmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </div>

          <h1 className="success-title">
            ✅ Email cím sikeresen megváltoztatva!
          </h1>

          <p className="success-description">
            Köszönjük! Az email címed sikeresen meg lett változtatva a ParkSafe rendszerben.
            Az új email címeddel mostantól be tudsz jelentkezni az alkalmazásba.
          </p>

          <div className="success-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">✉️</div>
              <div className="benefit-text">
                <strong>Új email cím aktív</strong><br />
                Az új címedre érkeznek az értesítések
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🔒</div>
              <div className="benefit-text">
                <strong>Biztonságos váltás</strong><br />
                A fiókod továbbra is védett
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <div className="benefit-text">
                <strong>Folytathatod</strong><br />
                Minden adatod megmaradt
              </div>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/" className="primary-button">
              🏠 Vissza a főoldalra
            </Link>
            <a href="mailto:hello@parksafe.hu" className="secondary-button">
              📧 Kapcsolat
            </a>
          </div>

          <div className="success-footer">
            <p>
              <strong>Következő lépések:</strong><br />
              Jelentkezz be az alkalmazásba az új email címeddel.
              Ha bármilyen problémád van, írj nekünk bátran!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailChangeSuccess;

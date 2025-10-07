import { Link } from "react-router-dom";
import "./Success.css";

function Success() {
  return (
    <div className="success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">
            <div className="success-checkmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </div>
          
          <h1 className="success-title">
            ✅ Email cím sikeresen megerősítve!
          </h1>
          
          <p className="success-description">
            Köszönjük! Az email címed sikeresen meg lett erősítve a ParkSafe rendszerben. 
            Most már teljes hozzáférésed van a fiókodhoz és az összes funkcióhoz.
          </p>
          
          <div className="success-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">🎉</div>
              <div className="benefit-text">
                <strong>Teljes hozzáférés</strong><br />
                Használhatod az összes ParkSafe funkciót
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🔔</div>
              <div className="benefit-text">
                <strong>Értesítések</strong><br />
                Kapsz értesítéseket az új funkciókról
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎁</div>
              <div className="benefit-text">
                <strong>Prémium előnyök</strong><br />
                1 hónap ingyenes prémium funkciók
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
              Az alkalmazás hamarosan elérhető lesz Androidos és iOS készülékeken. 
              Amint elkészül, értesítést fogsz kapni az email címedre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;

import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <img src="/logo.png" alt="ParkSafe" className="logo-image" />
            <span className="logo-text">ParkSafe</span>
          </div>
          <button className="contact-button">Írj nekünk</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Soha többé ne izgulj a{" "}
              <span className="highlight">biciklid biztonságáért</span>
            </h1>
            <p className="hero-description">
              Találd meg a legjobb biciklitárolókat a környéken - biztonságos,
              megbízható és közösség által ellenőrzött helyszínekkel. Több mint
              10,000 tároló 50+ városban.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Tároló</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Város</span>
              </div>
              <div className="stat">
                <span className="stat-number">25,000+</span>
                <span className="stat-label">Felhasználó</span>
              </div>
            </div>
            <button className="cta-button">
              🚀 Értesítést kérek az indulásnál!
            </button>
            <p className="hero-subtext">
              Ingyenes • Androidos és iOS • Hamarosan elérhető
            </p>
          </div>
          <div className="hero-image">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-header">
                  <div className="phone-status">
                    <span className="time">9:41</span>
                    <div className="phone-indicators">
                      <span className="signal">📶</span>
                      <span className="battery">🔋</span>
                    </div>
                  </div>
                  <div className="app-header">
                    <div className="app-title">
                      <img
                        src="/logo.png"
                        alt="ParkSafe"
                        className="phone-logo-image"
                      />
                      <span>ParkSafe</span>
                    </div>
                    <button className="filter-btn">🔍</button>
                  </div>
                </div>
                <div className="phone-map">
                  <div className="map-streets"></div>
                  <div className="map-pins">
                    <div className="pin pin-1">📍</div>
                    <div className="pin pin-2">📍</div>
                    <div className="pin pin-3">📍</div>
                  </div>
                  <button className="locate-btn">🎯</button>
                </div>
                <div className="phone-bottom">
                  <div className="parking-card">
                    <div className="card-header">
                      <span className="parking-name">🚲 Mammut Parkoló</span>
                      <span className="distance">120m</span>
                    </div>
                    <div className="card-details">
                      <div className="rating">⭐ 4.8 • 24/7 • Fedett</div>
                      <div className="availability">
                        <span className="available">🟢 8/12 szabad hely</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2>Miért választják a biciklisek a ParkSafe-et?</h2>
            <p>
              Több mint 25,000 elégedett felhasználó már megtalálta a tökéletes
              tárolóhelyeket
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">📍</div>
              <h3>Valós idejű elérhetőség</h3>
              <p>
                Lásd azonnal, mely tárolók szabad hellyel rendelkeznek. Foglalj
                helyet egy kattintással és spórolj időt.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">🛡️</div>
              <h3>Biztonság mindenek felett</h3>
              <p>
                Csak ellenőrzött, biztonságos tárolóhelyeket listázunk. Kamerás
                megfigyelés és világítás garantálva.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon green">⭐</div>
              <h3>Közösségi visszajelzések</h3>
              <p>
                Olvasd el mások tapasztalatait, értékeléseit és fotóit. Segíts
                másoknak is a véleményeddel.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">🔧</div>
              <h3>Szerviz és kiegészítők</h3>
              <p>
                Találj közeli javítóműhelyeket, alkatrészüzleteket és biciklis
                szolgáltatásokat egyetlen alkalmazásban.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Csatlakozz a biciklis forradalomhoz!</h2>
            <p>
              Légy az elsők között, akik megkapják a legjobb tárolóhelyeket.
              Regisztrálj most és kapj{" "}
              <strong>1 hónap ingyenes prémium funkciót</strong>!
            </p>
            <div className="cta-benefits">
              <div className="benefit">
                ✅ Prioritás a legjobb tárolóhelyekhez
              </div>
              <div className="benefit">
                ✅ Exkluzív kedvezmények partnereinknél
              </div>
              <div className="benefit">✅ Korai hozzáférés új funkciókhoz</div>
            </div>
            <button className="cta-button-white">
              🎉 Igen, csatlakozom az első 1000 közé!
            </button>
            <p className="cta-countdown">
              Már csak <span className="countdown-number">247</span> hely
              maradt!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            {/* <div className="footer-logo">
              <img
                src="/logo.png"
                alt="ParkSafe"
                className="footer-logo-image"
              />
              <span className="logo-text">ParkSafe</span>
            </div> */}
            <div className="footer-links">
              <a href="#">📱 App Store</a>
              <a href="#">🤖 Google Play</a>
              <a href="#">📧 Kapcsolat</a>
              <a href="#">📋 ÁSZF</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 ParkSafe. Minden jog fenntartva.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

import './App.css'

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <div className="logo-icon">📍</div>
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
              Tudd meg egy <span className="highlight">pillanat alatt</span>, hol a legközelebbi biciklitároló.
            </h1>
            <p className="hero-description">
              Rollereseknek, bicikliseknek és turisztáknak. Tárolók, szervizek, értékelések – egyetlen térképen.
            </p>
            <button className="cta-button">
              📍 Értesítést kérek, ha elérhető
            </button>
          </div>
          <div className="hero-image">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-header">
                  <div className="phone-logo">📍 ParkSafe</div>
                </div>
                <div className="phone-map">
                  <div className="map-pin">📍</div>
                  <div className="map-location">Interaktív térkép</div>
                </div>
                <div className="phone-bottom">
                  <div className="location-info">📍 Bartókbéla körtér</div>
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
            <h2>Minden, amire szükséged van</h2>
            <p>Egy helyen minden információ a biztonságos tároláshoz</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">$</div>
              <h3>GPS-alapú keresés</h3>
              <p>Találd meg a legközelebbi biciklitárolót vagy szolgáltatást.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">⚡</div>
              <h3>Biztonsági értékelések</h3>
              <p>Kamera, világítás, biztonság - minden fontos infó.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon orange">🔧</div>
              <h3>Szervizek & Alkatrészek</h3>
              <p>Javítóműhelyek és alkatrészek szolgáltatók.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon teal">🗺️</div>
              <h3>Közösségi értékelések</h3>
              <p>Valós felhasználói tapasztalatok és vélemények.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Légy az elsők között!</h2>
            <p>Értesítést küldünk, amint elérhető lesz az alkalmazás</p>
            <button className="cta-button-white">
              📍 Értesítést kérek
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-icon">📍</div>
              <span className="logo-text">ParkSafe</span>
            </div>
            <div className="footer-links">
              <a href="#">App Store</a>
              <a href="#">Google Play</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 ParkSafe. Minden jog fenntartva.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

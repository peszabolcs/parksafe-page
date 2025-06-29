import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    // Animated counter effect
    const animateCounter = (element, target, duration = 2000) => {
      let startTime = null;

      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * target);

        element.textContent = currentValue.toLocaleString() + "+";

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = target.toLocaleString() + "+";
        }
      };

      requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timer = setTimeout(() => {
      const counters = document.querySelectorAll(".stat-number[data-target]");
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target"));
        animateCounter(counter, target);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);
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
              Tartsd biztonságban a bringád{" "}
              <span className="highlight">bárhol, bármikor</span>
            </h1>
            <p className="hero-description">
              Fedezd fel a legmegbízhatóbb biciklitárolókat a közeledben! Valós
              idejű elérhetőség, közösségi értékelések és kamerával védett
              helyek – több mint 10 000 tároló 50+ városban.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number" data-target="2500">
                  0+
                </span>
                <span className="stat-label">Vizsgált Helyszín</span>
              </div>
              <div className="stat">
                <span className="stat-number" data-target="15">
                  0+
                </span>
                <span className="stat-label">Város</span>
              </div>
              <div className="stat">
                <span className="stat-number" data-target="847">
                  0+
                </span>
                <span className="stat-label">Érdeklődő</span>
              </div>
            </div>
            <button className="cta-button">
              🚀 Értesítést kérek az indulásról!
            </button>
            <p className="hero-subtext">
              Ingyenes • Androidos és iOS • Hamarosan elérhető
            </p>
          </div>
          <div className="hero-image">
            <div className="phone-mockup">
              <div className="phone-screen">
                <img
                  src="/phone.jpeg"
                  alt="ParkSafe app mockup"
                  className="phone-screen-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="target-audience">
        <div className="container">
          <div className="target-header">
            <h2>Kinek szól a ParkSafe?</h2>
            <p>
              Nem csak bicikliseknek! Minden városi közlekedő megtalálja benne a
              számítását.
            </p>
          </div>
          <div className="target-grid">
            <div className="target-card">
              <div className="target-icon">🚴‍♂️</div>
              <h3>Biciklisek</h3>
              <p>
                Napi ingázók és hétvégi kerékpárosok, akik biztonságos
                tárolóhelyet keresnek a városban. Fedezd fel a kamerás, fedett
                és közösség által ellenőrzött helyeket.
              </p>
            </div>
            <div className="target-card">
              <div className="target-icon">🛴</div>
              <h3>Rolleresek</h3>
              <p>
                Elektromos roller tulajdonosok, akiknek ugyanúgy fontos a
                biztonságos tárolás. Találj olyan helyeket, ahol a rollered is
                védve van a lopásoktól.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2>Miért választják a biciklisek a ParkSafe-et?</h2>
            <p>Több mint 800 érdeklődő már regisztrált a korai hozzáférésért</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">📍</div>
              <h3>Valós idejű elérhetőség</h3>
              <p>
                Azonnali információ a szabad helyekről – nincs több felesleges
                körözés.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">🛡️</div>
              <h3>Biztonság mindenek felett</h3>
              <p>
                Csak olyan tárolókat mutatunk, ahol tényleg biztonságban van a
                biciklid – kamerás megfigyelés és világítás biztosítva.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon green">⭐</div>
              <h3>Közösségi visszajelzések</h3>
              <p>
                Nézd meg mások tapasztalatait és oszd meg a sajátod is – együtt
                építjük a megbízható tárolók térképét.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">🔧</div>
              <h3>Szerviz és kiegészítők</h3>
              <p>
                Egy helyen minden, amire bringásként szükséged lehet –
                szervizek, pumpák, kiegészítők a térképen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>
              Legyél az elsők között – és használd ki az extra funkciókat!
            </h2>
            <p>
              Regisztrálj most, és kapj{" "}
              <strong>1 hónap ingyenes prémiumot!</strong>
            </p>
            <div className="cta-benefits">
              <div className="benefit">
                ✅ Elsőként férhetsz hozzá a legjobb tárolóhelyekhez
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

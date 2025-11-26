import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Shield, Star, Wrench, Check, Bike, Zap, Download } from "lucide-react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";

function HomePage() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["bárhol", "bármikor", "egyszerűen", "gyorsan", "könnyedén"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

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
    <div className="home-page">
      {/* Hero Section */}
      <AuroraBackground className="!min-h-[90vh] !h-auto !justify-start !pt-[120px] !pb-[80px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="container hero-container"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div className="hero-content">
            <h1 className="hero-title">
              Tartsd biztonságban a bringád{" "}
              <span className="relative inline-block overflow-hidden" style={{ width: '200px', height: '1.2em', verticalAlign: 'bottom' }}>
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="highlight whitespace-nowrap"
                    style={{ position: 'absolute', left: 0, top: 0 }}
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
            <p className="hero-description">
              Fedezd fel a legmegbízhatóbb biciklitárolókat a közeledben! Valós
              idejű elérhetőség, közösségi értékelések és kamerával védett
              helyek – több mint 7500 vizsgált helyszín 200+ városban.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number" data-target="7500">
                  0+
                </span>
                <span className="stat-label">Vizsgált Helyszín</span>
              </div>
              <div className="stat">
                <span className="stat-number" data-target="200">
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
            <div className="store-buttons">
              <a
                href="https://apps.apple.com/app/id6752813986"
                target="_blank"
                rel="noopener noreferrer"
                className="store-button apple"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="store-text">
                  <span className="store-small">Töltsd le</span>
                  <span className="store-large">App Store</span>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.parksafe.app"
                target="_blank"
                rel="noopener noreferrer"
                className="store-button google"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="store-text">
                  <span className="store-small">Szerezd be</span>
                  <span className="store-large">Google Play</span>
                </div>
              </a>
            </div>
            <p className="hero-subtext">
              Ingyenes • Android és iOS • Már elérhető!
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
        </motion.div>
      </AuroraBackground>

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
              <div className="target-icon">
                <Bike size={40} />
              </div>
              <h3>Biciklisek</h3>
              <p>
                Napi ingázók és hétvégi kerékpárosok, akik biztonságos
                tárolóhelyet keresnek a városban. Fedezd fel a kamerás, fedett
                és közösség által ellenőrzött helyeket.
              </p>
            </div>
            <div className="target-card">
              <div className="target-icon">
                <Zap size={40} />
              </div>
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
            <p>Csatlakozz a több mint 800 felhasználóhoz, akik már használják az appot!</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">
                <MapPin size={28} />
              </div>
              <h3>Valós idejű elérhetőség</h3>
              <p>
                Azonnali információ a szabad helyekről – nincs több felesleges
                körözés.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">
                <Shield size={28} />
              </div>
              <h3>Biztonság mindenek felett</h3>
              <p>
                Csak olyan tárolókat mutatunk, ahol tényleg biztonságban van a
                biciklid – kamerás megfigyelés és világítás biztosítva.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon green">
                <Star size={28} />
              </div>
              <h3>Közösségi visszajelzések</h3>
              <p>
                Nézd meg mások tapasztalatait és oszd meg a sajátod is – együtt
                építjük a megbízható tárolók térképét.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">
                <Wrench size={28} />
              </div>
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
              Töltsd le most a ParkSafe appot!
            </h2>
            <p>
              Kezdd el használni még ma, és találd meg a legbiztonságosabb tárolóhelyeket a közeledben.
            </p>
            <div className="cta-benefits">
              <div className="benefit">
                <Check size={20} className="benefit-icon" />
                Azonnali hozzáférés a legjobb tárolóhelyekhez
              </div>
              <div className="benefit">
                <Check size={20} className="benefit-icon" />
                Valós idejű információk és értékelések
              </div>
              <div className="benefit">
                <Check size={20} className="benefit-icon" />
                Ingyenes használat alapfunkciókkal
              </div>
            </div>
            <div className="store-buttons-cta">
              <a
                href="https://apps.apple.com/app/id6752813986"
                target="_blank"
                rel="noopener noreferrer"
                className="store-button apple"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="store-text">
                  <span className="store-small">Töltsd le</span>
                  <span className="store-large">App Store</span>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.parksafe.app"
                target="_blank"
                rel="noopener noreferrer"
                className="store-button google"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="store-text">
                  <span className="store-small">Szerezd be</span>
                  <span className="store-large">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

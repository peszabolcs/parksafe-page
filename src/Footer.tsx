import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#" className="footer-link">📱 App Store</a>
            <a href="#" className="footer-link">🤖 Google Play</a>
            <Link to="/contact" className="footer-link">📧 Kapcsolat</Link>
            <Link to="/terms" className="footer-link">📋 ÁSZF</Link>
            <Link to="/privacy" className="footer-link">🔒 Adatvédelem</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 ParkSafe. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

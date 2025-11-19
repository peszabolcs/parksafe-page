import { Link } from "react-router-dom";
import { Smartphone, Bot, Mail, FileText, Lock } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <a
              href="https://apps.apple.com/app/id6752813986"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Smartphone size={16} />
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.parksafe.app"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Bot size={16} />
              Google Play
            </a>
            <Link to="/contact" className="footer-link">
              <Mail size={16} />
              Kapcsolat
            </Link>
            <Link to="/terms" className="footer-link">
              <FileText size={16} />
              ÁSZF
            </Link>
            <Link to="/privacy" className="footer-link">
              <Lock size={16} />
              Adatvédelem
            </Link>
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

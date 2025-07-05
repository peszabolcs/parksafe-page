import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="ParkSafe" className="logo-image" />
          <span className="logo-text">ParkSafe</span>
        </Link>
        <Link to="/contact" className="contact-button">
          Írj nekünk
        </Link>
      </div>
    </header>
  );
}

export default Header;
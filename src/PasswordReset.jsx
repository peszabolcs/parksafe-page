import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import "./PasswordReset.css";

function PasswordReset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No valid session, redirect to home
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie");
      return;
    }

    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik meg");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setError("Hiba történt a jelszó megváltoztatása során: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="password-reset-page">
        <div className="container">
          <div className="password-reset-content">
            <div className="success-icon">
              <div className="success-checkmark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
            </div>

            <h1 className="success-title">✅ Jelszó sikeresen megváltoztatva!</h1>

            <p className="success-description">
              Az új jelszavad sikeresen be lett állítva. Most már be tudsz jelentkezni az alkalmazásba az új jelszavaddal.
            </p>

            <div className="success-actions">
              <Link to="/" className="primary-button">
                🏠 Vissza a főoldalra
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-page">
      <div className="container">
        <div className="password-reset-content">
          <div className="reset-icon">
            <div className="reset-symbol">🔒</div>
          </div>

          <h1 className="reset-title">Új jelszó beállítása</h1>

          <p className="reset-description">
            Add meg az új jelszavad, amit használni szeretnél a ParkSafe alkalmazásban.
          </p>

          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label htmlFor="password">Új jelszó</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Legalább 6 karakter"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Új jelszó megerősítése</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Írd be újra a jelszót"
                required
                minLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Mentés..." : "Jelszó megváltoztatása"}
            </button>
          </form>

          <div className="reset-footer">
            <p>
              <Link to="/">← Vissza a főoldalra</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;

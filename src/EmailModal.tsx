import { useState } from "react";
import { X, Rocket, CheckCircle2, XCircle, Loader2, Check } from "lucide-react";
import "./EmailModal.css";

function EmailModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(""); // 'success', 'error', ''
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => {
          onClose();
          setStatus("");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Hiba történt. Kérlek próbáld újra!");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Hálózati hiba. Ellenőrizd az internetkapcsolatot!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Rocket size={32} />
          </div>
          <h2>Értesítést kérek az indulásról!</h2>
          <p>
            Legyél az elsők között, akik megtudják, amikor a ParkSafe elérhető lesz.
            Garantáltan spam-mentes!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="valaki@email.com"
              required
              disabled={isLoading}
            />
          </div>

          {status === "success" && (
            <div className="status-message success">
              <CheckCircle2 size={20} />
              Sikeresen feliratkoztál! Hamarosan jelentkezünk.
            </div>
          )}

          {status === "error" && (
            <div className="status-message error">
              <XCircle size={20} />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="modal-submit"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="spinner" />
                Küldés...
              </>
            ) : (
              <>
                <Rocket size={20} />
                Feliratkozom!
              </>
            )}
          </button>
        </form>

        <div className="modal-benefits">
          <div className="benefit-item">
            <Check size={18} />
            Korai hozzáférés az alkalmazáshoz
          </div>
          <div className="benefit-item">
            <Check size={18} />
            1 hónap ingyenes prémium funkció
          </div>
          <div className="benefit-item">
            <Check size={18} />
            Exkluzív kedvezmények
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailModal;

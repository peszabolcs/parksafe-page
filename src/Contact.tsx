import React, { useState } from "react";
import { Mail, Building2, Clock, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import "./Contact.css";
import { ContactFormData } from "./types";

function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>
            <Mail className="header-icon" size={40} />
            Kapcsolat
          </h1>
          <p>
            Van kérdésed, javaslatos vagy csak szeretnél beszélni velünk?
            Örülünk minden megkeresésnek!
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>Lépj velünk kapcsolatba</h2>
            <div className="info-item">
              <div className="info-icon">
                <Mail size={24} />
              </div>
              <div className="info-details">
                <h3>Email</h3>
                <p>hello@parksafe.hu</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <Building2 size={24} />
              </div>
              <div className="info-details">
                <h3>Cég</h3>
                <p>
                  ParkSafe Kft.
                  <br />
                  1051 Budapest, Október 6. utca 12.
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <Clock size={24} />
              </div>
              <div className="info-details">
                <h3>Válaszidő</h3>
                <p>
                  24-48 órán belül válaszolunk
                  <br />
                  minden megkeresésre
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Írj nekünk</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Név *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Teljes neved"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email cím *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="email@domain.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Üzenet *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Írd le, miben segíthetünk..."
                  rows={5}
                />
              </div>

              {status === "success" && (
                <div className="status-message success">
                  <CheckCircle2 size={20} />
                  Köszönjük az üzeneted! Hamarosan válaszolunk.
                </div>
              )}

              {status === "error" && (
                <div className="status-message error">
                  <XCircle size={20} />
                  Hiba történt az üzenet küldésekor. Kérlek próbáld újra!
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Küldés...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Üzenet küldése
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;

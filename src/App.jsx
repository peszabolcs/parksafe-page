import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./HomePage.jsx";
import Contact from "./Contact.jsx";
import Terms from "./Terms.jsx";
import Privacy from "./Privacy.jsx";
import Success from "./Success.jsx";
import Error from "./Error.jsx";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/success" element={<Success />} />
            <Route path="/error" element={<Error />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

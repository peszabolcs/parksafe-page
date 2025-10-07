import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import HomePage from "./HomePage.tsx";
import Contact from "./Contact.tsx";
import Terms from "./Terms.tsx";
import Privacy from "./Privacy.tsx";
import Success from "./Success.tsx";
import Error from "./Error.tsx";
import EmailChangeSuccess from "./EmailChangeSuccess.tsx";
import PasswordReset from "./PasswordReset.tsx";
import Login from "./Login.tsx";
import Profile from "./Profile.tsx";
import Admin from "./admin/modern.tsx";
import Test from "./Test.tsx";

// Component to handle OAuth redirects
function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash;

    // Check if this is a password recovery/reset
    if (hash.includes('type=recovery')) {
      setTimeout(() => {
        navigate('/password-reset', { replace: true });
      }, 100);
      return;
    }

    // Check if we have auth tokens in the URL hash (regular login)
    if (hash && hash.includes('access_token=')) {
      // Clear the hash from URL and let Supabase auth state listener handle it
      // The AuthContext will pick up the session change
      setTimeout(() => {
        // Give Supabase a moment to process the tokens
        navigate('/profile', { replace: true });
      }, 1000);
    }
  }, [location, navigate]);

  return null;
}

// Layout wrapper component
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return children;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthRedirectHandler />
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/success" element={<Success />} />
            <Route path="/error" element={<Error />} />
            <Route path="/email-change-success" element={<EmailChangeSuccess />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;

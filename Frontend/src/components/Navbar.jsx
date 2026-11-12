import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";
import "../style/navbar.scss";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const isHome = location.pathname === "/";
  const isReportsActive = isHome && location.hash === "#recent-reports";

  // Close mobile menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Close menu whenever the route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // My Reports navigation
  const handleReportsClick = () => {
    closeMenu();

    if (isHome) {
      const reportsSection = document.getElementById("recent-reports");

      if (reportsSection) {
        reportsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      navigate("/", {
        state: { scrollTo: "recent-reports" },
      });
    }
  };

  // Logout
  const handleLogoutClick = async () => {
    const success = await handleLogout();

    if (success) {
      closeMenu();
      navigate("/login", { replace: true });
    }
  };

  // Close menu with Escape key
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="navbar-logo__icon">✦</span>

          <span className="logo-text">
            Interview<span>AI</span>
          </span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Navigation Links */}
        <nav
          id="main-navigation"
          className={`navbar-links ${menuOpen ? "active" : ""}`}
          aria-label="Main navigation"
        >
          {/* Home */}
          <Link
            to="/"
            onClick={closeMenu}
            className={isHome ? "active-link" : ""}
          >
            Home
          </Link>

          {/* My Reports */}
          <button
            type="button"
            onClick={handleReportsClick}
            className={isReportsActive ? "active-link" : ""}
          >
            My Reports
          </button>

          {/* Logout */}
          <button
            type="button"
            className="navbar-logout"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

import api from "../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiFileText,
  FiHelpCircle,
  FiLogIn,
  FiInfo,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  type: "link" | "anchor" | "button";
};

const baseNavItems: NavItem[] = [
  { label: "キャラ対メモ", href: "#", icon: <FiFileText />, type: "anchor" },
  { label: "使い方", href: "#", icon: <FiHelpCircle />, type: "anchor" },
  { label: "インフォメーション", href: "#", icon: <FiInfo />, type: "anchor" },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error("logout failed", e);
    } finally {
      setIsOpen(false);
      await logout(); // 🔥 Context側でstate更新
      navigate("/login");
    }
  };

  const authNavItem: NavItem = isAuthenticated
    ? {
        label: "ログアウト",
        icon: <FiLogOut />,
        type: "button",
      }
    : {
        label: "ログイン",
        href: "/login",
        icon: <FiLogIn />,
        type: "link",
      };

  const navItems = [...baseNavItems, authNavItem];

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">MyApp</div>

        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="メニュー"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${isOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            if (item.type === "link" && item.href) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="nav-item"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            }

            if (item.type === "anchor" && item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-item"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            }

            if (item.type === "button") {
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className="nav-item nav-button"
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            }

            return null;
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
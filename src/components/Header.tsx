import { useState } from "react";
import { 
  FiFileText, 
  FiHelpCircle, 
  FiLogIn, 
  FiInfo 
} from "react-icons/fi";
import "./Header.css";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "キャラ対メモ", href: "#", icon: <FiFileText /> },
  { label: "使い方", href: "#", icon: <FiHelpCircle /> },
  { label: "ログイン", href: "#", icon: <FiLogIn /> },
  { label: "インフォメーション", href: "#", icon: <FiInfo /> },
];


const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="nav-item">
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
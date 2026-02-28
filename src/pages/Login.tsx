import api from "../lib/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const login_id = (form.elements.namedItem("login_id") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await api.post("/login", { login_id, password });

      login(res.data.access_token, res.data.refresh_token);

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("ログイン失敗");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ログイン</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ログインID</label>
            <input name="login_id" required />
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input name="password" type="password" required />
          </div>

          <button type="submit" className="auth-button">
            ログイン
          </button>
        </form>

        <p className="auth-link">
          ユーザー登録は <Link to="/signup">こちら</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import api from "../lib/axios";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { isGuestLogin, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const login_id = (form.elements.namedItem("login_id") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const password_confirmation = (form.elements.namedItem("password_confirmation") as HTMLInputElement).value;
    const url = isGuestLogin ? "/migrate" : "/signup"

    try {
      const res = await api.post(url, {
        login_id,
        password,
        password_confirmation,
      });

      login(res.data.access_token, res.data.refresh_token);

      alert("登録成功！");
      navigate("/");
    } catch (err: any) {
      console.error(err.response?.data);
      alert("登録失敗");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ユーザー登録</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ログインID</label>
            <input name="login_id" required />
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input name="password" type="password" required />
          </div>

          <div className="form-group">
            <label>パスワード確認</label>
            <input name="password_confirmation" type="password" required />
          </div>

          <button type="submit" className="auth-button">
            登録
          </button>
        </form>

        { !isGuestLogin && (
          <p className="auth-link">
            ログインは <Link to="/login">こちら</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
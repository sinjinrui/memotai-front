import { Link } from "react-router-dom";
import "./Auth.css";

const Login: React.FC = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ログイン</h2>

        <form>
          <div className="form-group">
            <label>ログインID</label>
            <input type="text" required />
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input type="password" required />
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
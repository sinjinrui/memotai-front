import { Link } from "react-router-dom";
import "./Auth.css";

const Signup: React.FC = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>サインアップ</h2>

        <form>
          <div className="form-group">
            <label>ログインID</label>
            <input type="text" required />
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input type="password" required />
          </div>

          <div className="form-group">
            <label>パスワード（確認）</label>
            <input type="password" required />
          </div>

          <button type="submit" className="auth-button">
            登録する
          </button>
        </form>

        <p className="auth-link">
          すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
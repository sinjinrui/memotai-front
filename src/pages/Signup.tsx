import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import api from "../lib/axios";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { isGuestLogin, login } = useAuth();
  const LOGIN_ID_REGEX = /^[a-zA-Z0-9_]{4,16}$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const formData = new FormData(form)

    const login_id = formData.get("login_id") as string
    const password = formData.get("password") as string
    const password_confirmation = formData.get("password_confirmation") as string

    if (!LOGIN_ID_REGEX.test(login_id)) {
      alert("ログインIDは4〜16文字の英数字と_のみ使用できます");
      return;
    }

    if (password.length < 8) {
      alert("パスワードは8文字以上にしてください");
      return;
    }

    if (password !== password_confirmation) {
      alert("パスワード確認が一致しません");
      return;
    }
  
    if (!PASSWORD_REGEX.test(password)) {
      alert("パスワードは8〜32文字の英数字で、英字と数字をそれぞれ1文字以上含めてください");
      return;
    }
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
            <input
              name="login_id"
              required
              pattern="[A-Za-z0-9_]{4,16}"
              title="4〜16文字の英数字と_のみ使用できます"
            />
            <small>4〜16文字の英数字と_のみ使用できます</small>
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={32}
              pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}"
              title="8〜32文字の英数字で、英字と数字をそれぞれ1文字以上含めてください"
            />
            <small>8〜32文字の英数字で、英字と数字をそれぞれ1文字以上含めてください</small>
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
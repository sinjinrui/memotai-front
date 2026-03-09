import { useNavigate, Link } from "react-router-dom";
import { getRefreshToken } from "../utils/token";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import "./home.css"

const Home: React.FC = () => {

  const goListMessages = [
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "キャラ対策を始める",
    "ﾃﾞｲﾔｯﾌﾝｯ",
    "楽しんでください...",
    "躱せる？躱せる？流石に？",
    "もうﾋﾞﾝﾋﾞﾝ限界じゃあ！",
    "これが、俺の仕事だ...",
    "しょっぱいキャラ対にご不満のようだぜ～？",
    "対策不足のやつがくたばった、それだけのことだろう",
    "You can't escape!!",
    "Over the limit!!"
  ]

  const randomMessage = goListMessages[Math.floor(Math.random() * goListMessages.length)]
  const token = getRefreshToken()
  const isLoggedIn = !!token
  const navigate = useNavigate();
  const { guestLogin, isAuthenticated } = useAuth();
  const handleGuestLogin = async () => {
    try {
      const res = await api.post("/guest_login");

      guestLogin(res.data.access_token, res.data.refresh_token);
      alert("ゲストユーザーは、セッションが途切れた場合に作成済みの全てのデータが失われます。継続的にご利用される場合は必ずユーザー登録を行ってください。\nまた、ゲストユーザーのうちに作成したデータはユーザー登録時に自動で引き継がれます。")
      navigate("/cardList");
    } catch (err) {
      console.error(err);
      alert("ログイン失敗");
    }
  };

  return (
    <div className="home-container">

      <section className="home-title">
        <h1>StratFramebook</h1>
        <p className="home-description">
          ストリートファイター6のキャラ対策メモを管理しながら、体が覚えたものは「完了」メモとしてアーカイブに残しておきましょう。
        </p>
      </section>

      <section className="home-start">
        { isLoggedIn ? (
          <Link to="/cardList" className="home-start-btn">
            {randomMessage}
          </Link>
        ) : (
          <Link to="/login" className="home-start-btn">
            ログインしてキャラ対策を始める
          </Link>
        )}
        <Link to="/publicList" className="home-start-btn">
          みんなのメモを見る
        </Link>
        {!isAuthenticated && (
          <button onClick={handleGuestLogin} className="home-start-btn guest-btn">
            ゲストユーザーで始める
          </button>
        )}
      </section>

      <h2>更新履歴</h2>
      <section className="home-updates">
        <ul>
          <li>2026-03-08 サイト公開</li>
        </ul>
      </section>

      <footer className="home-footer">
        <p>© StratFramebook</p>
        <div className="home-footer-links">
          <a href="#">プライバシーポリシー</a>
          <a href="#">お問い合わせ</a>
        </div>
      </footer>

    </div>
  )
}

export default Home
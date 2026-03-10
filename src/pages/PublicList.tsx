import { useState, useEffect } from "react"
import api from "../lib/axios";
import { useCharacterState } from "../context/CharacterContext"
import { BottomCharacterMenu } from "../components";
import "./cardList.css"
import { FaRegCopy } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type Card = {
  id: number
  text: string
}

export default function PublicList() {
  const { characterCode, enemyCode } = useCharacterState()
  const [cards, setCards] = useState<Card[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isConfirmingCopy, setIsConfirmingCopy] = useState(false)
  const navigate = useNavigate();
  const [copyingCard, setCopyingCard] = useState<Card | null>(null)

  useEffect(() => {
    setCards([])
    fetchCards()
  }, [characterCode, enemyCode])

  const fetchCards = async () => {
    try {
      const res = await api.get("/cards/share_cards", {
        params: {
          character_code: characterCode,
          enemy_code: enemyCode,
        }
      })

      setCards(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopy = async () => {
    if (!copyingCard) return
    try {
      await api.post(`cards/${copyingCard.id}/copy`)

      navigate("/cardlist")
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = async () => {
    setCards([])
    fetchCards()
  }

  return (
    <div className="card-container" >
      <h2>みんなのメモ</h2>
      <button className="card-create-btn" onClick={() => handleUpdate()}>
        <IoReload />リロード
      </button>
      {cards.map(card => (
        <div
          key={card.id}
          className="memo-card"
        >
          <div className="memo-text">{card.text}</div>
          <div
            onClick={() => {
              setCopyingCard(card)
              setIsConfirmingCopy(true)
            }}
            className="memo-menu"
            >
              <FaRegCopy />
            </div>
        </div>
      ))}

      {isConfirmingCopy && (
        <>
          <div className="modal-overlay">
            <div className="card creating modal-card" id="public-card">
              <div className="confirm-box">
                <p>このメモをコピーしてキャラ対メモに移動しますか？</p>
                <div className="confirm-actions">
                  <button
                    className="regist-btn"
                    onClick={handleCopy}
                  >
                    コピー
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => setIsConfirmingCopy(false)}
                  >
                    戻る
                  </button>
                </div>
              </div>
              <div className="memo-card origin-card">
                {copyingCard?.text}
              </div>
            </div>
          </div>
        </>
      )}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
      <BottomCharacterMenu />
    </div>
  )
}
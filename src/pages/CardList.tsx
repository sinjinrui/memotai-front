import { useState, useEffect, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import api from "../lib/axios";
import SortableCard from "./SortableCard"
import { useCharacterState } from "../context/CharacterContext"
import "./cardList.css"

type Card = {
  id: number
  text: string
}

export default function CardList() {
  const { characterCode, enemyCode } = useCharacterState()
  const [cards, setCards] = useState<Card[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newText, setNewText] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [showArchived, characterCode, enemyCode])

  const fetchCards = async () => {
    try {
      const res = await api.get("/cards", {
        params: {
          character_code: characterCode,
          enemy_code: enemyCode,
          archived: showArchived
        }
      })

      setCards(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async () => {
    if (!newText.trim()) return

    try {
      const res = await api.post("/cards", {
        card: {
          text: newText,
          character_code: characterCode,
          enemy_code: enemyCode,
        },
      })

      setCards(prev => [res.data, ...prev])

      setIsCreating(false)
      setNewText("")
    } catch (e) {
      console.error(e)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over }
      = event

    if (!over || active.id === over.id) return

    const oldIndex = cards.findIndex(c => c.id === active.id)
    const newIndex = cards.findIndex(c => c.id === over.id)

    const newCards = arrayMove(cards, oldIndex, newIndex)
    setCards(newCards)

    try {
      await api.patch(`/cards/${active.id}/update_position`, {
        position: newIndex + 1,
        list_scope_key: `${characterCode}_${enemyCode}`,
      })
    } catch (e) {
      console.error(e)
      fetchCards()
    }
  }

  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editText, setEditText] = useState("")

  const handleUpdate = async () => {
    if (!editingCard || !editText.trim()) return

    try {
      const res = await api.patch(`/cards/${editingCard.id}`, {
        card: { text: editText }
      })

      setCards(prev =>
        prev.map(c => (c.id === editingCard.id ? res.data : c))
      )

      setEditingCard(null)
      setEditText("")
    } catch (e) {
      console.error(e)
    }
  }

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleDeleteConfirmed = async () => {
    if (!editingCard) return

    try {
      await api.delete(`/cards/${editingCard.id}`)

      setCards(prev =>
        prev.filter(c => c.id !== editingCard.id)
      )

      setEditingCard(null)
      setEditText("")
      setIsConfirmingDelete(false)

      setToastMessage("メモを削除しました")

      setTimeout(() => {
        setToastMessage(null)
      }, 3000)

    } catch (e) {
      console.error(e)
    }
  }

  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false)
  const handleArchiveConfirmed = async () => {
    if (!editingCard) return

    try {
      await api.patch(`/cards/${editingCard.id}/archive`)

      setCards(prev =>
        prev.filter(c => c.id !== editingCard.id)
      )

      setEditingCard(null)
      setIsConfirmingArchive(false)
      setToastMessage("メモを完了にしました")

      setTimeout(() => {
        setToastMessage(null)
      }, 3000)
    } catch (e) {
      console.error(e)
    }
  }

  const [isConfirmingRestore, setIsConfirmingRestore] = useState(false)

  const handleRestoreConfirmed = async () => {
    if (!editingCard) return

    try {
      await api.patch(`/cards/${editingCard.id}/restore`)

      // 完了リストから消す
      if (showArchived) {
        setCards(prev =>
          prev.filter(c => c.id !== editingCard.id)
        )
      }

      setEditingCard(null)
      setIsConfirmingRestore(false)

      setToastMessage("メモを通常に戻しました")
      setTimeout(() => setToastMessage(null), 3000)

    } catch (e) {
      console.error(e)
    }
  }

  const handleCardClick = useCallback((card: Card) => {
    setEditingCard(card)
    setEditText(card.text)
  }, [])
  
  return (
    <div className="card-container" >
      <div
        className={`toggle ${showArchived ? "archived" : ""}`}
        onClick={() => setShowArchived(prev => !prev)}
      >
        <div className="toggle-slider" />
        <span className="toggle-option">通常</span>
        <span className="toggle-option">完了</span>
      </div>
      {!isCreating && (
        showArchived ? null : (
          <button className="card-create-btn" onClick={() => setIsCreating(true)}>
            新規メモ作成
          </button>
        )
      )}
      {isCreating && (
        <div className="card creating">
          <div className="card-actions">
            <button
              className="regist-btn"
              onClick={handleCreate}
              >
                登録
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setIsCreating(false)
                setNewText("")
              }}
            >
              キャンセル
            </button>
          </div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="140文字以内でメモを入力..."
            autoFocus
          />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map(card => (
            <SortableCard
              key={card.id}
              card={card}
              disabled={showArchived}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {editingCard && (
        <div className="modal-overlay">
          <div className="card creating modal-card">
            {showArchived ? (
              <>
                <div className="card-actions">
                  <div className="right-actions">
                    <button
                      className="delete-btn"
                      onClick={() => setIsConfirmingDelete(true)}
                    >
                      削除
                    </button>
                    <button
                      className="archive-btn"
                      onClick={() => setIsConfirmingRestore(true)}
                    >
                      復元
                    </button>
                  </div>

                  <div className="right-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => setEditingCard(null)}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
                <div className="memo-card">
                  {editText}
                </div>
              </>
            ) : (
              <>
                <div className="card-actions">
                  <div className="right-actions">
                    <button
                      className="delete-btn"
                      onClick={() => setIsConfirmingDelete(true)}
                    >
                      削除
                    </button>
                    {!showArchived && (
                      <button
                        className="archive-btn"
                        onClick={() => setIsConfirmingArchive(true)}
                      >
                        完了
                      </button>
                    )}
                  </div>

                  <div className="right-actions">
                    <button className="regist-btn" onClick={handleUpdate}>
                      更新
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditingCard(null)
                        setEditText("")
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>

                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
              </>
            )}


            {isConfirmingDelete && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <p>本当に削除しますか？</p>

                  <div className="confirm-actions">
                    <button
                      className="delete-btn"
                      onClick={handleDeleteConfirmed}
                    >
                      削除する
                    </button>

                    <button
                      className="cancel-btn"
                      onClick={() => setIsConfirmingDelete(false)}
                    >
                      戻る
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isConfirmingArchive && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <p>このメモを完了にしますか？</p>

                  <div className="confirm-actions">
                    <button
                      className="archive-btn"
                      onClick={handleArchiveConfirmed}
                    >
                      完了にする
                    </button>

                    <button
                      className="cancel-btn"
                      onClick={() => setIsConfirmingArchive(false)}
                    >
                      戻る
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isConfirmingRestore && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <p>このメモを通常に戻しますか？</p>

                  <div className="confirm-actions">
                    <button
                      className="archive-btn"
                      onClick={handleRestoreConfirmed}
                    >
                      復元する
                    </button>

                    <button
                      className="cancel-btn"
                      onClick={() => setIsConfirmingRestore(false)}
                    >
                      戻る
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
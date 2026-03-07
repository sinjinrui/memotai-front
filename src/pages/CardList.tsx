import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { HiOutlinePlusSmall } from "react-icons/hi2";
import { FaPlay, FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaTrashCan } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
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
import { IoIosClose } from "react-icons/io";

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
  const loadMoreRef = useRef(null)
  const [hasMore, setHasMore] = useState(true)
  const cardIds = useMemo(() => cards.map(c => c.id), [cards])
  const lastIdRef = useRef<number | undefined>(undefined)
  lastIdRef.current = cards[cards.length - 1]?.id
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    setCards([])
    setHasMore(true)
  }, [showArchived, characterCode, enemyCode])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreCards()
      }
    })

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, showArchived])

  const fetchMoreCards = async () => {
    const lastId = lastIdRef.current
    try {
      const res = await api.get("/cards", {
        params: {
          character_code: characterCode,
          enemy_code: enemyCode,
          archived: showArchived,
          last_id: lastId
        }
      })

      setCards(prev => [...prev, ...res.data])
      if (res.data.length < 10) {
        setHasMore(false)
      }
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
      <div className={`toggle ${showArchived ? "archived" : ""}`}>
        <div className="toggle-slider" />
        <span className="toggle-option" onClick={() =>  setShowArchived(false)}><FaPlay />通常</span>
        <span className="toggle-option" onClick={() =>  setShowArchived(true)}><FaCheck />完了</span>
      </div>
      {!isCreating && (
        showArchived ? null : (
          <button className="card-create-btn" onClick={() => setIsCreating(true)}>
            <HiOutlinePlusSmall />新規作成
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
                <FaPlay />登録
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setIsCreating(false)
                setNewText("")
              }}
            >
              <IoClose />
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
          items={cardIds}
          strategy={verticalListSortingStrategy}
        >
          {cards.map(card => (
            <SortableCard
              key={card.id}
              card={card}
              disabled={showArchived}
              onClick={handleCardClick}
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
                      <FaTrashCan />削除
                    </button>
                    <button
                      className="archive-btn"
                      onClick={() => setIsConfirmingRestore(true)}
                    >
                      <FaPlay />復元
                    </button>
                  </div>

                  <div className="right-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => setEditingCard(null)}
                    >
                      <IoIosClose />
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
                      <FaTrashCan />削除
                    </button>
                    {!showArchived && (
                      <button
                        className="archive-btn"
                        onClick={() => setIsConfirmingArchive(true)}
                      >
                        <FaCheck />完了
                      </button>
                    )}
                  </div>

                  <div className="right-actions">
                    <button className="regist-btn" onClick={handleUpdate}>
                      <RxUpdate />更新
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditingCard(null)
                        setEditText("")
                      }}
                    >
                      <IoClose />
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
                  <p>このメモを通常に復元しますか？</p>

                  <div className="confirm-actions">
                    <button
                      className="archive-btn"
                      onClick={handleRestoreConfirmed}
                    >
                      <FaPlay />復元する
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
      <div ref={loadMoreRef}></div>
    </div>
  )
}
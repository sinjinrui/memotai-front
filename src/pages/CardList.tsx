import { useState, useEffect } from "react"
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
import "./cardList.css"

type Card = {
  id: number
  text: string
}

export default function CardList() {
const [cards, setCards] = useState<Card[]>([])
const [isCreating, setIsCreating] = useState(false)
const [newText, setNewText] = useState("")

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const res = await api.get("/cards", {
        params: {
          character_code: "001",
          enemy_code: "002",
        },
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
          character_code: "001",
          enemy_code: "002",
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
        list_scope_key: "001_002",
      })
    } catch (e) {
      console.error(e)
      fetchCards() // 失敗したら巻き戻し
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

  return (
    <div className="card-container" >
      {!isCreating && (
        <button className="card-create-btn" onClick={() => setIsCreating(true)}>
          新規メモ作成
        </button>
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
              onClick={() => {
                setEditingCard(card)
                setEditText(card.text)
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
      {editingCard && (
        <div className="modal-overlay">
          <div className="card creating modal">
            <div className="card-actions">
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
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  )
}
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  card: {
    id: number
    text: string
  }
  onClick: () => void
}

export default function SortableCard({ card, onClick}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="memo-card"
    >
      <div
        {...attributes}
        {...listeners}
        className="drag-handle"
      >
        ☰
      </div>
      <div className="memo-text">{card.text}</div>
      <div className="memo-footer"></div>
    </div>
  )
}
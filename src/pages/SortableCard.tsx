import { memo, useMemo } from "react"
import { FaArrowsUpDown } from "react-icons/fa6"
import { MdEditNote } from "react-icons/md"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  card: {
    id: number
    text: string
  }
  onClick: (card: { id: number; text: string }) => void
  disabled: boolean
}

function SortableCard({ card, onClick, disabled = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: card.id,
    disabled
  })

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition
  }), [transform, transition])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="memo-card"
    >
      {!disabled ? (
        <div
          {...attributes}
          {...listeners}
          className="drag-handle"
          style={{ touchAction: "none" }}
        >
          <FaArrowsUpDown />
        </div>
      ) : null}

      <div className="memo-text">{card.text}</div>

      <div
        onClick={(e) => {
          e.stopPropagation()
          onClick(card)
        }}
        className="memo-menu"
      >
        <MdEditNote />
      </div>
    </div>
  )
}

export default memo(SortableCard)
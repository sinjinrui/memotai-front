import { useState } from "react"
import { useCharacterState, useCharacterActions } from "../context/CharacterContext"
import "./bottomMenu.css"

type Character = {
  id: number
  name: string
  image: string
}

const imageModules = import.meta.glob(
  "../assets/images/*.png",
  { eager: true, import: "default" }
) as Record<string, string>

const characters: Character[] = Object.entries(imageModules).map(
  ([path, image], index) => {
    const fileName = path.split("/").pop()!.replace(".png", "")

    return {
      id: index,
      name: fileName,
      image
    }
  }
)

export default function BottomCharacterMenu() {
  const { characterCode, enemyCode } = useCharacterState()
  const { setCharacterCode, setEnemyCode } = useCharacterActions()
  const player = characters.find(c => c.name === characterCode) ?? characters[0]
  const enemy = characters.find(c => c.name === enemyCode) ?? characters[1]
  const [openSide, setOpenSide] = useState<"left" | "right" | null>(null)

  const handleSelect = (char: Character) => {

    if (openSide === "left") {
      setCharacterCode(char.name)
    }

    if (openSide === "right") {
      setEnemyCode(char.name)
    }

    setOpenSide(null)
  }

  return (
    <>
      {/* Drawer */}
      <div className={`drawer ${openSide ? "open" : ""}`}>
        <div className="drawer-content">
          {characters.map((char) => (
            <img
              key={char.id}
              src={char.image}
              alt={char.name}
              onClick={() => handleSelect(char)}
              className="char-item"
            />
          ))}
        </div>
      </div>

      {/* Overlay */}
      {openSide && (
        <div className="overlay" onClick={() => setOpenSide(null)} />
      )}

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="character-icon you">
          <img
            src={player.image}
            className="char-icon left"
            onClick={() => setOpenSide("left")}
          />
          <span className="label">YOU</span>
        </div>
        <div className="vs-text">VS</div>
        <div className="character-icon enemy">
          <img
            src={enemy.image}
            className="char-icon right"
            onClick={() => setOpenSide("right")}
          />
          <span className="label">ENEMY</span>
        </div>
      </div>
    </>
  )
}
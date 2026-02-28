import { useState, useEffect } from "react"
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

const STORAGE_KEY = "game_character_selection"

const saveSelection = (player: Character, enemy: Character) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      player,
      enemy
    })
  )
}

export default function BottomCharacterMenu() {
  const [player, setPlayer] = useState<Character>(characters[0])
  const [enemy, setEnemy] = useState<Character>(characters[1])
  const [openSide, setOpenSide] = useState<"left" | "right" | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return

    try {
      const parsed = JSON.parse(stored)

      if (parsed.player) setPlayer(parsed.player)
      if (parsed.enemy) setEnemy(parsed.enemy)

    } catch {
      console.error("localStorage parse error")
    }
  }, [])

  const handleSelect = (char: Character) => {
    let newPlayer = player
    let newEnemy = enemy

    if (openSide === "left") newPlayer = char
    if (openSide === "right") newEnemy = char

    setPlayer(newPlayer)
    setEnemy(newEnemy)

    saveSelection(newPlayer, newEnemy)

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
import { createContext, useContext, useState } from "react"

type CharacterState = {
  characterCode: string
  enemyCode: string
}

type CharacterActions = {
  setCharacterCode: (code: string) => void
  setEnemyCode: (code: string) => void
}

const CHARACTERS_KEY = "game_character_selection"

const CharacterStateContext = createContext<CharacterState | null>(null)
const CharacterActionsContext = createContext<CharacterActions | null>(null)

const loadInitialState = (): CharacterState => {
  const stored = localStorage.getItem(CHARACTERS_KEY)

  if (!stored) {
    return {
      characterCode: "001",
      enemyCode: "002"
    }
  }

  try {
    const parsed = JSON.parse(stored)

    return {
      characterCode: parsed.characterCode ?? "001",
      enemyCode: parsed.enemyCode ?? "002"
    }

  } catch {
    return {
      characterCode: "001",
      enemyCode: "002"
    }
  }
}

export const CharacterProvider = ({ children }: { children: React.ReactNode }) => {

  const [characterCode, setCharacterCode] = useState(() => loadInitialState().characterCode)
  const [enemyCode, setEnemyCode] = useState(() => loadInitialState().enemyCode)

  const save = (c: string, e: string) => {
    localStorage.setItem(
      CHARACTERS_KEY,
      JSON.stringify({
        characterCode: c,
        enemyCode: e
      })
    )
  }

  const updateCharacterCode = (code: string) => {
    setCharacterCode(code)
    save(code, enemyCode)
  }

  const updateEnemyCode = (code: string) => {
    setEnemyCode(code)
    save(characterCode, code)
  }

  return (
    <CharacterStateContext.Provider value={{ characterCode, enemyCode }}>
      <CharacterActionsContext.Provider
        value={{
          setCharacterCode: updateCharacterCode,
          setEnemyCode: updateEnemyCode
        }}
      >
        {children}
      </CharacterActionsContext.Provider>
    </CharacterStateContext.Provider>
  )
}

export const useCharacterState = () => {
  const context = useContext(CharacterStateContext)
  if (!context) throw new Error("useCharacterState must be used within provider")
  return context
}

export const useCharacterActions = () => {
  const context = useContext(CharacterActionsContext)
  if (!context) throw new Error("useCharacterActions must be used within provider")
  return context
}
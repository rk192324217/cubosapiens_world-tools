"use client"

import React, { useState, useEffect, useCallback } from "react"

interface GameTile {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
  mergedInto?: number
}

interface Game2048State {
  tiles: GameTile[]
  score: number
  gameOver: boolean
}

let globalTileIdCounter = 0

export default function Game2048() {
  const [gameState, setGameState] = useState<Game2048State>({
    tiles: [],
    score: 0,
    gameOver: false,
  })

  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("2048_highScore") || "0")
    }
    return 0
  })

  const spawnTile = useCallback((currentTiles: GameTile[]): GameTile | null => {
    const occupied = new Set(currentTiles.map((t) => `${t.row}-${t.col}`))
    const emptyCells: { r: number; c: number }[] = []

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!occupied.has(`${r}-${c}`)) {
          emptyCells.push({ r, c })
        }
      }
    }

    if (emptyCells.length === 0) return null

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    return {
      id: globalTileIdCounter++,
      value: Math.random() < 0.9 ? 2 : 4,
      row: r,
      col: c,
      isNew: true,
    }
  }, [])

  const initGame = useCallback(() => {
    globalTileIdCounter = 0
    let initialTiles: GameTile[] = []

    const t1 = spawnTile(initialTiles)
    if (t1) initialTiles.push(t1)
    const t2 = spawnTile(initialTiles)
    if (t2) initialTiles.push(t2)

    setGameState({
      tiles: initialTiles,
      score: 0,
      gameOver: false,
    })
  }, [spawnTile])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (gameState.score > highScore) {
      setHighScore(gameState.score)
      localStorage.setItem("2048_highScore", String(gameState.score))
    }
  }, [gameState.score, highScore])

  const checkGameOverStatus = (tiles: GameTile[]): boolean => {
    if (tiles.length < 16) return false

    const grid = Array(4).fill(null).map(() => Array(4).fill(0))
    tiles.forEach((t) => { grid[t.row][t.col] = t.value })

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return false
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return false
      }
    }
    return true
  }

  const move = useCallback((direction: "LEFT" | "RIGHT" | "UP" | "DOWN") => {
    setGameState((prev) => {
      if (prev.gameOver) return prev

      let currentTiles = prev.tiles.map((t) => ({ ...t, isNew: false, isMerged: false }))
      let scoreIncrement = 0
      let hasMoved = false

      let rowVector = 0
      let colVector = 0

      if (direction === "UP")    rowVector = -1
      if (direction === "DOWN")  rowVector = 1
      if (direction === "LEFT")  colVector = -1
      if (direction === "RIGHT") colVector = 1

      currentTiles.sort((a, b) => {
        if (direction === "UP")    return a.row - b.row
        if (direction === "DOWN")  return b.row - a.row
        if (direction === "LEFT")  return a.col - b.col
        if (direction === "RIGHT") return b.col - a.col
        return 0
      })

      const mergedPositions = new Set<string>()

      currentTiles.forEach((tile) => {
        let currentRow = tile.row
        let currentCol = tile.col

        while (true) {
          const nextRow = currentRow + rowVector
          const nextCol = currentCol + colVector

          if (nextRow < 0 || nextRow >= 4 || nextCol < 0 || nextCol >= 4) break

          const blockingTile = currentTiles.find(
            (t) => t.row === nextRow && t.col === nextCol && !t.mergedInto
          )

          if (!blockingTile) {
            currentRow = nextRow
            currentCol = nextCol
            hasMoved = true
          } else {
            const targetKey = `${nextRow}-${nextCol}`
            if (blockingTile.value === tile.value && !mergedPositions.has(targetKey) && !blockingTile.isMerged) {
              tile.row = nextRow
              tile.col = nextCol
              blockingTile.value *= 2
              blockingTile.isMerged = true
              scoreIncrement += blockingTile.value
              tile.mergedInto = blockingTile.id
              mergedPositions.add(targetKey)
              hasMoved = true
            }
            break
          }
        }

        if (!tile.mergedInto) {
          tile.row = currentRow
          tile.col = currentCol
        }
      })

      if (hasMoved) {
        const activeTiles: GameTile[] = currentTiles.filter((t) => !t.mergedInto)
        const newTile = spawnTile(activeTiles)
        if (newTile !== null && newTile !== undefined) {
          activeTiles.push(newTile)
        }
        return {
          tiles: activeTiles,
          score: prev.score + scoreIncrement,
          gameOver: checkGameOverStatus(activeTiles),
        }
      }

      return prev
    })
  }, [spawnTile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === "ArrowLeft")  move("LEFT")
      if (e.key === "ArrowRight") move("RIGHT")
      if (e.key === "ArrowUp")    move("UP")
      if (e.key === "ArrowDown")  move("DOWN")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [move])

  const getTileStyles = (value: number) => {
    const colors: Record<number, string> = {
      2:    "border-[#ff6b00] text-[#ff6b00] drop-shadow-[0_0_6px_rgba(255,107,0,0.4)] bg-[#ff6b00]/5",
      4:    "border-[#ffaa00] text-[#ffaa00] drop-shadow-[0_0_6px_rgba(255,170,0,0.4)] bg-[#ffaa00]/5",
      8:    "border-[#e0246a] text-[#e0246a] drop-shadow-[0_0_8px_rgba(224,36,106,0.5)] bg-[#e0246a]/5",
      16:   "border-[#ff2e93] text-[#ff2e93] drop-shadow-[0_0_8px_rgba(255,46,147,0.5)] bg-[#ff2e93]/10",
      32:   "border-[#00f0ff] text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] bg-[#00f0ff]/5",
      64:   "border-[#00a8ff] text-[#00a8ff] drop-shadow-[0_0_8px_rgba(0,168,255,0.5)] bg-[#00a8ff]/5",
      128:  "border-[#ab47bc] text-[#ab47bc] drop-shadow-[0_0_10px_rgba(171,71,188,0.6)] bg-[#ab47bc]/10 text-xl",
      256:  "border-[#39ff14] text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.6)] bg-[#39ff14]/10 text-xl",
      512:  "border-[#ffff00] text-[#ffff00] drop-shadow-[0_0_12px_rgba(255,255,0,0.6)] bg-[#ffff00]/10 text-xl",
      1024: "border-[#ff003c] text-[#ff003c] drop-shadow-[0_0_14px_rgba(255,0,60,0.7)] bg-[#ff003c]/10 text-lg",
      2048: "border-[#00ffcc] text-[#00ffcc] drop-shadow-[0_0_20px_rgba(0,255,204,0.9)] bg-[#00ffcc]/20 text-lg font-extrabold",
    }
    return colors[value] || "border-zinc-500 text-zinc-400"
  }

  return (
    // 👇 overflow-y-auto + max-h added for scrollbar
   <div
  className="flex flex-col items-center justify-start w-full max-w-md mx-auto select-none font-mono text-white bg-black"
  style={{ padding: "16px" }}
>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleUp {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popMerge {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); filter: brightness(1.1); }
          100% { transform: scale(1); }
        }
        .animate-scaleUp { animation: scaleUp 150ms ease-out forwards; }
        .animate-popMerge { animation: popMerge 160ms ease-in-out forwards; }
        .game-scroll::-webkit-scrollbar { width: 4px; }
        .game-scroll::-webkit-scrollbar-track { background: #0a0a0a; }
        .game-scroll::-webkit-scrollbar-thumb { background: #ff6b00; border-radius: 4px; }
      `}} />

      {/* ── HEADER BANNER ─────────────────────────────────── */}
      <div
        className="w-full relative border border-t-4 border-[#ff6b00] bg-[#120d1a]/60 px-4 py-3 rounded-sm text-center shadow-[0_0_15px_rgba(255,107,0,0.15)]"
        style={{ marginBottom: "24px" }}
      >
        <h1 className="text-3xl font-black tracking-widest text-[#ff6b00] drop-shadow-[0_0_8px_rgba(255,107,0,0.6)] uppercase">
          2048 ENGINE
        </h1>
        <div className="text-[10px] tracking-widest text-zinc-500 uppercase mt-0.5 font-bold">
          Combine tiles to hit ultimate value
        </div>
      </div>

      {/* ── SCORE + BEST + RESET ── */}
      <div
        className="grid grid-cols-3 w-full"
        style={{ gap: "20px", marginBottom: "24px" }}
      >
        <div className="border border-[#00f0ff] bg-[#09141c]/80 p-2.5 rounded-sm text-center shadow-[0_0_12px_rgba(0,240,255,0.15)] flex flex-col justify-center">
          <div className="text-[9px] text-[#00f0ff] uppercase font-bold tracking-widest drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]">
            SCORE
          </div>
          <div className="text-xl font-black text-white mt-0.5 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
            {gameState.score}
          </div>
        </div>

        <div className="border border-[#39ff14] bg-[#0d1a0d]/80 p-2.5 rounded-sm text-center shadow-[0_0_12px_rgba(57,255,20,0.15)] flex flex-col justify-center">
          <div className="text-[9px] text-[#39ff14] uppercase font-bold tracking-widest drop-shadow-[0_0_4px_rgba(57,255,20,0.4)]">
            BEST RUN
          </div>
          <div className="text-xl font-black text-white mt-0.5 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
            {highScore}
          </div>
        </div>

        <button
          onClick={initGame}
          className="border border-[#e0246a] bg-[#1a0a12]/80 text-[#e0246a] hover:bg-[#e0246a]/10 font-bold uppercase tracking-widest text-[10px] p-2.5 transition-all rounded-sm flex items-center justify-center shadow-[0_0_12px_rgba(224,36,106,0.15)] active:scale-95"
        >
          ♻ Reset
        </button>
      </div>

      {/* ── INPUT STATUS ─────────────────── */}
      <div
        className="w-full border border-zinc-900 bg-zinc-950/80 py-1.5 rounded-sm text-center text-[11px] uppercase tracking-widest text-[#ff6b00] font-bold"
        style={{ marginBottom: "24px" }}
      >
        {gameState.gameOver ? "SYSTEM SHUTDOWN" : "🎮 INPUT STATUS: ACTIVE"}
      </div>

      {/* ── GRID ────────────────────────── */}
      <div className="relative bg-[#0b0c16]/90 rounded-sm border-2 border-indigo-950 shadow-[0_0_30px_rgba(15,23,42,0.8)] aspect-square w-full p-2 overflow-hidden">

        {/* Background grid */}
        <div className="absolute inset-0 p-2 grid grid-cols-4 grid-rows-4 gap-3 pointer-events-none z-0">
          {Array(16).fill(0).map((_, idx) => (
            <div key={idx} className="bg-[#04060d]/60 border border-zinc-900/40 rounded-sm aspect-square shadow-inner" />
          ))}
        </div>

        {/* Active tiles */}
        <div className="absolute inset-0 p-2 w-full h-full z-10 pointer-events-none">
          {gameState.tiles.map((tile) => {
            const translationStyle = {
              transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)`,
              width: "25%",
              height: "25%",
              transition: "transform 150ms ease-in-out",
            }
            return (
              <div
                key={tile.id}
                style={translationStyle}
                className="absolute top-0 left-0 p-1.5 will-change-transform"
              >
                <div
                  className={`w-full h-full flex items-center justify-center font-bold text-2xl border-2 rounded-sm bg-black ${getTileStyles(tile.value)} ${
                    tile.isNew ? "animate-scaleUp" : ""
                  } ${
                    tile.isMerged ? "animate-popMerge" : ""
                  }`}
                >
                  {tile.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Game Over overlay */}
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-black/95 rounded-sm border border-[#ff003c] flex flex-col items-center justify-center backdrop-blur-xs px-4 z-50">
            <h2 className="text-3xl font-black text-[#ff003c] drop-shadow-[0_0_10px_rgba(255,0,60,0.8)] tracking-wider mb-1 uppercase">
              CRITICAL FAILURE
            </h2>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-6">No executable moves remain</p>
            <div className="bg-[#1a0a0e] border border-[#ff003c]/40 rounded-sm px-6 py-2 mb-6 text-center min-w-[160px]">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Final Log</span>
              <span className="text-xl font-bold text-white tracking-wide">{gameState.score} PTS</span>
            </div>
            <button
              onClick={initGame}
              className="bg-[#ff003c]/10 text-[#ff003c] hover:bg-[#ff003c]/20 border border-[#ff003c] font-black uppercase tracking-widest px-6 py-2.5 rounded-sm text-xs transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,0,60,0.3)]"
            >
              Reboot Matrix
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
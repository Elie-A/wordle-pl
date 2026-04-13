"use client";

import { useEffect, useState } from "react";

type TileState = "empty" | "green" | "yellow" | "gray";

export default function Home() {
  const [length, setLength] = useState(5);
  const [guess, setGuess] = useState("");
  const [board, setBoard] = useState<string[][]>([]);
  const [colors, setColors] = useState<TileState[][]>([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    resetGame();
  }, [length]);

  function resetGame() {
    setBoard([]);
    setColors([]);
    setGuess("");
    setMessage("");
    setGameOver(false);
  }

  async function submitGuess() {
    if (guess.length !== length) return;

    const res = await fetch("/api/guess", {
      method: "POST",
      body: JSON.stringify({ guess, length }),
    });

    const data = await res.json();

    setBoard((prev) => [...prev, guess.split("")]);
    setColors((prev) => [...prev, data.result]);
    setGuess("");

    if (data.isWin) {
      setGameOver(true);
      setMessage(`🎉 ${data.word} (${data.gender}) — ${data.example}`);
    }

    if (board.length + 1 >= 6 && !data.isWin) {
      setGameOver(true);
      setMessage("💀 You lost. Try again tomorrow.");
    }
  }

  function getColorClass(color: TileState) {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "gray":
        return "bg-gray-500";
      default:
        return "bg-gray-200";
    }
  }

  return (
    <main className="flex flex-col items-center p-6 gap-4">
      <h1 className="text-2xl font-bold">Polish Wordle</h1>

      {/* Length selector */}
      <select
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="border p-2"
      >
        {[4, 5, 6, 7, 8, 9, 10].map((n) => (
          <option key={n} value={n}>
            {n} letters
          </option>
        ))}
      </select>

      {/* Board */}
      <div className="grid gap-2">
        {board.map((row, i) => (
          <div key={i} className="flex gap-2">
            {row.map((letter, j) => (
              <div
                key={j}
                className={`w-12 h-12 flex items-center justify-center text-white font-bold ${getColorClass(colors[i][j])}`}
              >
                {letter.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Current guess */}
      {!gameOver && (
        <>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value.toLowerCase())}
            maxLength={length}
            className="border p-2 text-center uppercase"
          />

          <button
            onClick={submitGuess}
            className="bg-black text-white px-4 py-2"
          >
            Guess
          </button>
        </>
      )}

      {/* Message */}
      {message && <p className="mt-4 text-center">{message}</p>}
    </main>
  );
}

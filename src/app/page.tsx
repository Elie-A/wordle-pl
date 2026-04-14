"use client";

import { useState } from "react";
import styles from "./page.module.css";

type TileState = "empty" | "green" | "yellow" | "gray";

export default function Home() {
  const [length, setLength] = useState(5);
  const [guess, setGuess] = useState("");
  const [board, setBoard] = useState<string[][]>([]);
  const [colors, setColors] = useState<TileState[][]>([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  function resetGame() {
    setBoard([]);
    setColors([]);
    setGuess("");
    setMessage("");
    setGameOver(false);
  }

  function handleLengthChange(nextLength: number) {
    setLength(nextLength);
    resetGame();
  }

  async function submitGuess() {
    if (guess.length !== length) {
      setMessage(`Napisz dokładnie ${length} liter.`);
      return;
    }

    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess, length }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessage(data.error || "Wystąpił błąd serwera.");
        return;
      }

      const nextBoard = [...board, guess.split("")];
      const nextColors = [...colors, data.result];

      setBoard(nextBoard);
      setColors(nextColors);
      setGuess("");

      if (data.isWin) {
        setGameOver(true);
        setMessage(`🎉 ${data.word} (${data.gender}) — ${data.example}`);
        return;
      }

      if (nextBoard.length >= 6) {
        setGameOver(true);
        setMessage("Niestety, przegrałeś. Spróbuj jutro.");
        return;
      }

      setMessage("");
    } catch (error) {
      console.error("submitGuess error:", error);
      setMessage("Wystąpił błąd serwera. Spróbuj ponownie później.");
    }
  }

  function getColorClass(color: TileState) {
    switch (color) {
      case "green":
        return styles.tileCorrect;
      case "yellow":
        return styles.tilePresent;
      case "gray":
        return styles.tileAbsent;
      default:
        return styles.tileEmpty;
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.badge}>Wordle Polska</span>
        <div className={styles.heroStripe}>
          <span />
          <span />
        </div>
        <h1 className={styles.title}>Zgadnij polskie słowo</h1>
        <p className={styles.subtitle}>
          Wybierz długość słowa, wpisz swoją propozycję i sprawdź, które litery
          pasują.
        </p>
      </section>

      <section className={styles.card}>
        <div className={styles.row}>
          <label htmlFor="length" className={styles.label}>
            Długość słowa
          </label>
          <select
            id="length"
            value={length}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className={styles.select}
          >
            {[4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} liter
              </option>
            ))}
          </select>
        </div>

        <div className={styles.board}>
          {board.length === 0 ? (
            <div className={styles.boardHint}>
              Zacznij zgadywać — trafienia pojawią się tutaj.
            </div>
          ) : (
            board.map((row, i) => (
              <div key={i} className={styles.row}>
                {row.map((letter, j) => (
                  <div
                    key={j}
                    className={`${styles.tile} ${getColorClass(colors[i][j])}`}
                  >
                    {letter.toUpperCase()}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className={styles.controls}>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value.toLocaleLowerCase("pl"))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !gameOver) {
                submitGuess();
              }
            }}
            maxLength={length}
            placeholder={`${length} liter`}
            className={styles.input}
            disabled={gameOver}
          />
          <button
            onClick={submitGuess}
            className={styles.guessButton}
            disabled={gameOver}
          >
            Zgadnij
          </button>
        </div>
        <p className={styles.footnote}>
          Użyj polskich znaków: ą ć ę ł ń ó ś ź ż
        </p>

        <div className={styles.status}>
          <div className={styles.stats}>
            <span>Ruchy</span>
            <strong>{board.length} / 6</strong>
          </div>
          <button onClick={resetGame} className={styles.resetButton}>
            Nowa gra
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
        <p className={styles.footnote}>Wszystkie słowa są w języku polskim.</p>
      </section>
    </main>
  );
}

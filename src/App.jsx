import { useState, useEffect } from "react";

const WORD_BANK = {
  "2026-04-15": { word: "TERRA", fact: "a beloved madison staple tied to terrace days and lake views" },
  "2026-04-16": { word: "UNION", fact: "where the terrace lives and sunsets get crowded" },
  "2026-04-17": { word: "CURDS", fact: "squeaky if you know what you're doing" }
};

const getDevDate = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("date");
};

const getTodayKey = () => {
  const devDate = getDevDate();
  return devDate || new Date().toISOString().slice(0, 10);
};

const getTodayEntry = () => {
  const key = getTodayKey();
  return WORD_BANK[key] || { word: "TERRA", fact: "a beloved madison staple tied to terrace days and lake views" };
};

const MAX_GUESSES = 5;
const TODAY_KEY = getTodayKey();

function evaluateGuess(guess, solution) {
  const result = Array(5).fill("gray");
  const solutionArr = solution.split("");

  for (let i = 0; i < 5; i++) {
    if (guess[i] === solution[i]) {
      result[i] = "green";
      solutionArr[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === "gray" && solutionArr.includes(guess[i])) {
      result[i] = "blue";
      solutionArr[solutionArr.indexOf(guess[i])] = null;
    }
  }

  return result;
}

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const formatDate = () => {
  const devDate = getDevDate();
  const d = devDate ? new Date(devDate) : new Date();
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric"
  });
};

const { word: SOLUTION, fact: DESCRIPTION } = getTodayEntry();

export default function App() {
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [keyStatus, setKeyStatus] = useState({});
  const [streak, setStreak] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedStreak = localStorage.getItem("streak");
    const savedGame = localStorage.getItem("gameState");
    const savedSolution = localStorage.getItem("solution");
    const savedDate = localStorage.getItem("playedDate");

    if (savedStreak) setStreak(parseInt(savedStreak));

    if (savedGame && savedDate === TODAY_KEY && savedSolution === SOLUTION) {
      const parsed = JSON.parse(savedGame);
      setGuesses(parsed.guesses || []);
      setCurrent(parsed.current || "");
      setGameOver(parsed.gameOver || false);
      setKeyStatus(parsed.keyStatus || {});
    }
  }, []);

  useEffect(() => {
    const state = { guesses, current, gameOver, keyStatus };
    localStorage.setItem("gameState", JSON.stringify(state));
    localStorage.setItem("solution", SOLUTION);
    if (gameOver) {
      localStorage.setItem("playedDate", TODAY_KEY);
    }
  }, [guesses, current, gameOver, keyStatus]);

  const submitGuess = () => {
    if (current.length !== 5 || gameOver) return;

    const guess = current.toUpperCase();
    const evaluated = evaluateGuess(guess, SOLUTION);

    const newKeyStatus = { ...keyStatus };
    guess.split("").forEach((letter, i) => {
      const res = evaluated[i];
      if (res === "green") newKeyStatus[letter] = "green";
      else if (res === "blue" && newKeyStatus[letter] !== "green") newKeyStatus[letter] = "blue";
      else if (!newKeyStatus[letter]) newKeyStatus[letter] = "gray";
    });

    setKeyStatus(newKeyStatus);

    const newGuesses = [...guesses, { word: guess, result: evaluated }];
    setGuesses(newGuesses);
    setCurrent("");

    if (guess === SOLUTION || newGuesses.length === MAX_GUESSES) {
      setGameOver(true);
    }
  };

  const handleKey = (key) => {
    if (gameOver) return;
    if (key === "ENTER") return submitGuess();
    if (key === "DEL") return setCurrent(current.slice(0, -1));
    if (current.length < 5) setCurrent(current + key);
  };

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("DEL");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [current, gameOver]);

  const emojiMap = { green: "🟩", blue: "🟦", gray: "⬜" };

  const handleShare = () => {
    const grid = guesses.map(g => g.result.map(r => emojiMap[r]).join("")).join("\n");
    const text = `CAPITOL LETTERS\n${formatDate()} • ${guesses.length}/${MAX_GUESSES}\n\n${grid}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.date}>{formatDate()}</div>
        <h1 style={styles.title}>CAPITOL LETTERS</h1>
        <p style={styles.subtitle}>A Madison Word Game</p>
        <div style={styles.streak}>{streak}d streak</div>
      </div>

      <div>
        {[...Array(MAX_GUESSES)].map((_, r) => (
          <div key={r} style={styles.row}>
            {[...Array(5)].map((_, c) => {
              const guess = guesses[r];
              const isCurrentRow = r === guesses.length;
              const letter = guess ? guess.word[c] : isCurrentRow ? current[c] || "" : "";

              const color = guess
                ? guess.result[c] === "green" ? "#34d399" :
                  guess.result[c] === "blue" ? "#60a5fa" : "#e5e7eb"
                : "#ffffff";

              return (
                <div key={c} style={{ ...styles.tile, backgroundColor: color }}>
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div>
        {KEYS.map((row, i) => (
          <div key={i} style={styles.keyboardRow}>
            {i === 2 && <button onClick={() => handleKey("ENTER")} style={styles.key}>Enter</button>}
            {row.split("").map(k => (
              <button key={k} onClick={() => handleKey(k)} style={styles.key}>{k}</button>
            ))}
            {i === 2 && <button onClick={() => handleKey("DEL")} style={styles.key}>Delete</button>}
          </div>
        ))}
      </div>

      {gameOver && (
        <div style={styles.result}>
          <div style={styles.answer}>{SOLUTION}</div>
          <div style={styles.fact}>{DESCRIPTION}</div>
          <button onClick={handleShare} style={styles.share}>Play with your people</button>
          {copied && <div style={styles.copied}>Copied to clipboard, send to friends</div>}
          <div style={styles.return}>Same time tomorrow?</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", fontFamily: "Georgia, serif", padding: 20, backgroundColor: "#fdfcf8", color: "#111" },
  header: { marginBottom: 20 },
  date: { fontSize: 12, color: "#888" },
  title: { fontSize: 34, margin: "10px 0", color: "#111", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.04em" },
  subtitle: { fontSize: 14, color: "#666" },
  streak: { fontSize: 12, marginTop: 5, color: "#333" },
  row: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 },
  tile: { width: 50, height: 50, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: "600", color: "#111", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  keyboardRow: { display: "flex", justifyContent: "center", gap: 6, margin: "6px 0" },
  key: { padding: "8px 10px", border: "1px solid #ccc", cursor: "pointer", backgroundColor: "#f3f4f6", color: "#111" },
  result: { marginTop: 20 },
  answer: { fontWeight: "bold", fontSize: 18, color: "#111" },
  fact: { fontStyle: "italic", fontSize: 14, color: "#555" },
  share: { marginTop: 10, padding: "8px 12px" },
  copied: { fontSize: 12, marginTop: 5 },
  return: { fontSize: 12, marginTop: 12, color: "#888" }
};

import { useState, useEffect } from "react";

// --- WORD SYSTEM ---
const WORD_BANK = {
  "2026-04-16": { word: "UNION", fact: "where the terrace lives and sunsets get crowded" },
  "2026-04-17": { word: "CURDS", fact: "squeaky if you know what you're doing" }
};

const BASE_DATE = "2026-04-16";

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
  return WORD_BANK[key] || WORD_BANK[BASE_DATE];
};

const getPuzzleNumber = () => {
  const base = new Date(BASE_DATE);
  const today = new Date(getTodayKey());
  const diff = Math.floor((today - base) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const MAX_GUESSES = 6;

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
  const [started, setStarted] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [keyStatus, setKeyStatus] = useState({});
  const [copied, setCopied] = useState(false);

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
      if (!started) return;
      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("DEL");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [current, gameOver, started]);

  const emojiMap = { green: "🟩", blue: "🟦", gray: "⬜" };

  const handleShare = () => {
    const grid = guesses.map(g => g.result.map(r => emojiMap[r]).join("")).join("\n");
    const text = `CAPITOL LETTERS\n${formatDate()} • ${guesses.length}/${MAX_GUESSES}\n\n${grid}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!started) {
    return (
      <div style={styles.launchContainer}>
        <img src="/capitol.png" style={styles.logo} />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet" />
        <h1 style={styles.title}>CAPITOL LETTERS</h1>
        <p style={styles.subtitle}>A Madison word game.</p>

        <button onClick={() => setStarted(true)} style={styles.playButton}>
          Play now
        </button>

        <div style={styles.meta}>
          {formatDate()} • Puzzle #{getPuzzleNumber()}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.gameContainer}>

      {/* GRID */}
      <div style={styles.gridWrapper}>
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
      </div>

      {/* KEYBOARD */}
      <div style={styles.keyboardContainer}>
        {KEYS.map((row, i) => (
          <div key={i} style={styles.keyboardRow}>
            {i === 2 && (
              <button onClick={() => handleKey("ENTER")} style={{ ...styles.key, flex: 1.5 }}>
                Enter
              </button>
            )}
            {row.split("").map(k => (
              <button key={k} onClick={() => handleKey(k)} style={styles.key}>{k}</button>
            ))}
            {i === 2 && (
              <button onClick={() => handleKey("DEL")} style={{ ...styles.key, flex: 1.5 }}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {gameOver && (
        <div style={styles.result}>
          <div style={styles.answer}>{SOLUTION}</div>
          <div style={styles.fact}>{DESCRIPTION}</div>

          <button onClick={handleShare} style={styles.share}>
            Play with your people
          </button>

          {copied && <div style={styles.copied}>Copied to clipboard, send to friends</div>}

          <div style={styles.return}>Same time tomorrow?</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  launchContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Georgia, serif",
    backgroundColor: "#ffffff",
    color: "#111111"
  },

  logo: { width: 70, marginBottom: 3 },

  title: {
    fontSize: 36,
    margin: "14px 0",
    fontFamily: "'Playfair Display', serif",
    color: "#111111"
  },

  subtitle: { fontSize: 16, color: "#555" },

  playButton: {
    marginTop: 15,
    padding: "10px 20px",
    borderRadius: 6,
    border: "1px solid #ccc",
    backgroundColor: "#111",
    color: "#fff",
    cursor: "pointer"
  },

  meta: { marginTop: 16, fontSize: 12, color: "#777" },

  gameContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    color: "#111111"
  },

  gridWrapper: {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  paddingBottom: 140 // 👈 reserve space for keyboard
},

  row: { display: "flex", gap: 6, marginBottom: 6 },

  tile: {
    width: 56,
    height: 56,
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    borderRadius: 6,
    color: "#111"
  },

  keyboardContainer: {
    width: "100%",
    maxWidth: 500,
    padding: "0 8px",
    position: "fixed",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    backgroundColor: "#ffffff"
  },

  keyboardRow: {
    display: "flex",
    gap: 3,
    margin: "3px 0",
    width: "100%"
  },

  key: {
    flex: 1,
    minWidth: 0,
    height: 52,
    padding: "0 4px",
    border: "1px solid #ccc",
    cursor: "pointer",
    backgroundColor: "#f3f4f6",
    color: "#111",
    fontSize: 14,
    borderRadius: 6,
    boxSizing: "border-box"
  },

  result: { textAlign: "center", marginTop: 16 },

  answer: { fontWeight: "bold", fontSize: 18 },

  fact: { fontStyle: "italic", fontSize: 14 },

  share: {
    marginTop: 10,
    padding: "10px 16px",
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 6,
    border: "none",
    cursor: "pointer"
  },

  copied: { fontSize: 12, marginTop: 5 },

  return: { fontSize: 12, marginTop: 10, color: "#888" }
};
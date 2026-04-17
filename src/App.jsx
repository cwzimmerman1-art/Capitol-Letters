import { useState, useEffect } from "react";

// --- WORD SYSTEM ---
const WORD_BANK = {
  "2026-04-16": { word: "STATE", fact: "A million vape shops will never fill the void that Paul’s Bookstore left in our hearts. But the THC may help…" },
  "2026-04-17": { word: "METRO", fact: "The Madison Metro Transit operates with approximately 1,346 bus stops. There, now you know." }
};

const BASE_DATE = "2026-04-16";

// --- BADGES ---
const BADGES = [
  { days: 15, label: 'Knows what "242-2000" is' },
  { days: 10, label: "Can name every Madison lake" },
  { days: 5, label: "Isthmuskateer" },
  { days: 3, label: 'Familiar with the term "sett"' },
  { days: 1, label: "Knows how to zipper merge" }
];

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

// --- NEW: YESTERDAY HELPER ---
const getYesterdayEntry = () => {
  const today = new Date(getTodayKey());
  today.setDate(today.getDate() - 1);
  const key = today.toISOString().slice(0, 10);
  return WORD_BANK[key];
};

const getPuzzleNumber = () => {
  const base = new Date(BASE_DATE);
  const today = new Date(getTodayKey());
  const diff = Math.floor((today - base) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

// --- STREAK SYSTEM ---
const getStreakData = () => {
  const data = JSON.parse(localStorage.getItem("capitol_streak") || "{}");
  return {
    streak: data.streak || 0,
    lastPlayed: data.lastPlayed || null
  };
};

const updateStreak = (won) => {
  const today = getTodayKey();
  const { streak, lastPlayed } = getStreakData();

  let newStreak = streak;

  if (!won) {
    newStreak = 0;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    if (lastPlayed === yesterdayKey) {
      newStreak += 1;
    } else if (lastPlayed !== today) {
      newStreak = 1;
    }
  }

  localStorage.setItem(
    "capitol_streak",
    JSON.stringify({ streak: newStreak, lastPlayed: today })
  );

  return newStreak;
};

const getBadge = (streak) => {
  for (let badge of BADGES) {
    if (streak >= badge.days) return badge.label;
  }
  return "Solve to unlock a title";
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
  const [streak, setStreak] = useState(0);

  const yesterday = getYesterdayEntry();

  useEffect(() => {
    const { streak } = getStreakData();
    setStreak(streak);
  }, []);

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

      const won = guess === SOLUTION;
      const newStreak = updateStreak(won);
      setStreak(newStreak);
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
    const grid = guesses.map(g => g.result.map(r => emojiMap[r]).join(""))
      .join("\n");
    const text = `CAPITOL LETTERS\n${formatDate()} • ${guesses.length}/${MAX_GUESSES}\n\n${grid}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getKeyColor = (k) => {
    if (keyStatus[k] === "green") return "#34d399";
    if (keyStatus[k] === "blue") return "#60a5fa";
    if (keyStatus[k] === "gray") return "#d1d5db";
    return "#f3f4f6";
  };

  if (!started) {
    return (
      <div style={styles.launchContainer}>
        <img src="/capitol.png" style={styles.logo} />

        <p style={styles.subtitle}>Play daily for a Madison fact</p>

        <button onClick={() => setStarted(true)} style={styles.playButton}>
          Solve now
        </button>

        <div style={styles.streak}>{streak} day streak</div>
        <div style={styles.badge}>{getBadge(streak)}</div>

        <div style={styles.meta}>
          {formatDate()} • Puzzle {getPuzzleNumber()}
        </div>

        {/* NEW TICKER */}
        {yesterday && (
          <div style={styles.tickerWrapper}>
            <div style={styles.ticker}>
              Yesterday’s word: {yesterday.word} — {yesterday.fact}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.gameContainer}>

      <div style={{ ...styles.gridWrapper, paddingBottom: gameOver ? 0 : 140 }}>
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

      {!gameOver && (
        <div style={styles.keyboardContainer}>
          {KEYS.map((row, i) => (
            <div key={i} style={styles.keyboardRow}>
              {i === 2 && (
                <button
                  onClick={() => handleKey("ENTER")}
                  style={{ ...styles.key, flex: 1.5, backgroundColor: "#e5e7eb" }}
                >
                  Enter
                </button>
              )}
              {row.split("").map(k => (
                <button
                  key={k}
                  onClick={() => handleKey(k)}
                  style={{ ...styles.key, backgroundColor: getKeyColor(k) }}
                >
                  {k}
                </button>
              ))}
              {i === 2 && (
                <button
                  onClick={() => handleKey("DEL")}
                  style={{ ...styles.key, flex: 1.5, backgroundColor: "#e5e7eb" }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div style={styles.resultCentered}>
          <div style={styles.answer}>{SOLUTION}</div>
          <div style={styles.fact}>{DESCRIPTION}</div>

          <button onClick={handleShare} style={styles.share}>
            Share with friends
          </button>

          {copied && <div style={styles.copied}>Copied to clipboard, share with friends</div>}

          <div style={styles.return}>Play again tomorrow</div>
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
    backgroundColor: "#fff",
    color: "#111",
    position: "relative"
  },

  logo: { width: 375, marginBottom: 2},

  subtitle: { fontSize: 16, color: "#555" },

  playButton: {
    marginTop: 20,
    padding: "10px 25px",
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 8
  },

  meta: { marginTop: 16, fontSize: 12, color: "#868686" },

  streak: { marginTop: 10, fontSize: 14 },
  badge: { fontSize: 12, color: "#666", fontStyle: "italic", marginTop: 4 },

  // --- NEW TICKER STYLES ---
  tickerWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    overflow: "hidden",
    borderTop: "1px solid #eee",
    backgroundColor: "#fafafa"
  },

  ticker: {
    whiteSpace: "nowrap",
    display: "inline-block",
    padding: "8px 0",
    fontSize: 12,
    color: "#666",
    animation: "scrollText 18s linear infinite"
  },

  gameContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    color: "#111"
  },

  gridWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingBottom: 140
  },

  row: { display: "flex", gap: 6, marginBottom: 6 },

  tile: {
    width: 56,
    height: 56,
    border: "1px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    borderRadius: 6,
    color: "#111",
    backgroundColor: "#f9fafb"
  },

  keyboardContainer: {
    width: "100%",
    maxWidth: 500,
    padding: "0 8px",
    position: "fixed",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)"
  },

  keyboardRow: {
    display: "flex",
    gap: 3,
    margin: "3px 0"
  },

  key: {
    flex: 1,
    height: 60,
    fontSize: 15,
    borderRadius: 8,
    color: "#5b5b5b",
    margin: 1,
    fontWeight: 600
  },

  resultCentered: {
    textAlign: "center",
    marginTop: 20
  },

  answer: { fontWeight: "bold", fontSize: 18 },
  fact: { fontStyle: "italic", fontSize: 14 },

  share: {
    marginTop: 10,
    padding: "10px 16px",
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 6
  },

  copied: { fontSize: 12, marginTop: 5 },
  return: { fontSize: 12, marginTop: 10, color: "#888" }
};

/*
ADD THIS TO YOUR GLOBAL CSS FILE:

@keyframes scrollText {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
*/

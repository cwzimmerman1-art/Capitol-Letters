import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";

// --- WORD SYSTEM ---
const WORD_BANK = {
  "2026-04-18": { word: "CHAIR", fact: "As in, a Union chair. The Memorial Union typically replaces about 60 Terrace chairs annually. That's enough to seat about 60 people." },
  "2026-04-19": { word: "VILAS", fact: "As in, Vilas Zoo. When Vilas opened in 1911, locals would donate animals they owned or found to the zoo. Because that’s how things worked in 1911." },
  "2026-04-20": { word: "BRATS", fact: "As in, the world's largest Brat Fest. In 2010, Madison ate a record 209,376 brats. That's 26.4 miles worth of brats. That's too many brats." },
  "2026-04-21": { word: "BIRDS", fact: "As in, our city's official bird: the plastic pink flamingo. Charming and quirky, or just another win for Big Plastic? You be the judge." },
  "2026-04-22": { word: "BROOM", fact: "As in, Broom Street. It closes tomorrow, and will reopen sometime in early June. In the meantime, a detour can be found on Dustpan Drive." },
  "2026-04-23": { word: "HAPPY", fact: "As in, happy hour. Madison's best? Canteen gets my vote: 2-5pm daily. Half-off tacos and margs, $3 Tecates. We made it to patio season, people."},
  "2026-04-24": { word: "METRO", fact: "As in, the Madison Metro Transit. It operates with approximately 1,346 bus stops. That's it. That's today's fact." },
  "2026-04-25": { word: "PLAZA", fact: "As in, the Plaza. The large paintings throughout the Plaza were given to the bar in return for erasing the painter's $1,400+ running bar tab." },
  "2026-04-26": { word: "GARTH", fact: "As in, Garth’s Brew Bar. The bar’s mascot (Marvins) is a Frankenmoose. His head and antlers come from two different moose."} 
};

const BASE_DATE = "2026-04-18";

// --- BADGES ---
const BADGES = [
  { days: 30, label: '👻 Has seen an Ohio Tavern ghost' },
  { days: 25, label: '🔦 First name basis w/ Tunnel Bob' },
  { days: 15, label: '🚕 Knows the "242-2000" jingle' },
  { days: 10, label: "🍔 Loves a good Caribou burger" },
  { days: 5, label: "⛵ Can name every Madison lake" },
  { days: 3, label: '🚘 Zipper merges on beltline' },
  { days: 1, label: "🛒 Expert Woodman's navigator" }
];

const getDevDate = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("date");
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getTodayKey = () => {
  const devDate = getDevDate();
  if (devDate) return devDate;

  const now = new Date();
  return formatDateKey(now);
};

const getTodayEntry = () => {
  const key = getTodayKey();
  return WORD_BANK[key] || WORD_BANK[BASE_DATE];
};

// --- NEW: YESTERDAY HELPER ---
const getYesterdayEntry = () => {
  const todayKey = getTodayKey();
  console.log("todayKey:", todayKey);
  console.log("WORD_BANK keys:", Object.keys(WORD_BANK));
  const [year, month, day] = todayKey.split("-").map(Number);

  const base = new Date(year, month - 1, day); // LOCAL date (this is key)
  base.setDate(base.getDate() - 1);

  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");

  const key = `${y}-${m}-${d}`;
  return WORD_BANK[key];
};

const getPuzzleNumber = () => {
const parseLocalDate = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const base = parseLocalDate(BASE_DATE);
const today = parseLocalDate(getTodayKey());
  const diff = Math.floor((today - base) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

// --- STREAK SYSTEM ---
const normalizeDateKey = (str) => {
  if (!str) return null;
  if (str.includes("-")) return str;
  const [m, d, y] = str.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

const getStreakData = () => {
  const data = JSON.parse(localStorage.getItem("capitol_streak") || "{}");

  return {
    streak: data.streak || 0,
    lastPlayed: normalizeDateKey(data.lastPlayed)
  };
};

// --- BADGE KEEPER ---
const getUnlockedBadges = () => {
  const badges = JSON.parse(localStorage.getItem("capitol_badges") || "[]");
  return [...badges]; // IMPORTANT: forces React update
};

const unlockBadge = (badgeLabel) => {
  const badges = getUnlockedBadges();
  if (!badges.includes(badgeLabel)) {
    const updated = [...badges, badgeLabel];
    localStorage.setItem("capitol_badges", JSON.stringify(updated));
    window.dispatchEvent(new Event('achievementsUpdated'));
    return true;
  }

  return false;
};

const updateStreak = (won) => {
  const today = getTodayKey();
  const { streak, lastPlayed } = getStreakData();

  let newStreak = streak;

  if (!won) {
    newStreak = 0;
  } else {
    const [year, month, day] = today.split("-").map(Number);
    const yesterday = new Date(year, month - 1, day);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

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
  return "Solve to earn a city badge";
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
  const todayKey = getTodayKey();
  const [year, month, day] = todayKey.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric"
  });
};

const formatFullDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

const { word: SOLUTION, fact: DESCRIPTION } = getTodayEntry();

export default function App() {
  const [showTrophies, setShowTrophies] = useState(false);
  const [started, setStarted] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [keyStatus, setKeyStatus] = useState({});
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState(0);
  const [newBadge, setNewBadge] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const yesterday = getYesterdayEntry();
  const todayKey = getTodayKey();
  const parseLocalDate = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};
  const archiveEntries = Object.entries(WORD_BANK)
  .filter(([date]) => date < todayKey)
  .sort((a, b) => parseLocalDate(b[0]) - parseLocalDate(a[0]));
  const [showInstructions, setShowInstructions] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

useEffect(() => {
  const loadData = () => {
    const { streak } = getStreakData();
    setStreak(streak);

    const savedBadges = getUnlockedBadges();
    setUnlockedBadges(savedBadges);
  };

  loadData();

  window.addEventListener('achievementsUpdated', loadData);

  return () => {
    window.removeEventListener('achievementsUpdated', loadData);
  };
}, []);

  const submitGuess = () => {
    const prevStreak = getStreakData().streak;
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
      

// --- BADGE DETECTION ---
const prevBadge = getBadge(prevStreak);
const nextBadge = getBadge(newStreak);

if (prevBadge !== nextBadge) {
  const isNew = unlockBadge(nextBadge);

  if (isNew) {
    setNewBadge(nextBadge);
  }
}
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
    const text = `MAD TILES\n${formatDate()} • ${guesses.length}/${MAX_GUESSES}\n\n${grid}

Consider myself puzzled. Come play with me at MadTiles.com.`;
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

  if (showInstructions) {
  return (
    <div style={styles.launchContainer}>
      <h2 style={{ marginBottom: 10, fontWeight: "600", color: "#252525" }}>HOW TO PLAY</h2>

      <div style={{ maxWidth: 320, fontSize: 14, color: "#444", lineHeight: 1.5 }}>
        Guess the Madison-themed word in 6 tries.

        <br /><br />

        🟩 = right letter, right spot<br />
        🟦 = right letter, wrong spot<br />
        ⬜ = not in the word

      <br /><br />

        Play daily to add to your streak and unlock new badges.
        <br /><br />
        ~~~
        <br /><br />
        Add Mad Tiles to your phone's home screen to play in a tap.
      </div>

      <button
  onClick={() => {
    setShowInstructions(false);
    setStarted(true);
  }}
  style={styles.playButton}
>
  Play now
</button>

      <button
        onClick={() => setShowInstructions(false)}
        style={{ ...styles.secondaryButton, marginTop: 10 }}
      >
        Back
      </button>

    <Analytics />
    </div>
  );
}
if (showTrophies) {
  const earnedBadges = BADGES.filter(b => unlockedBadges.includes(b.label)).reverse();

const nextBadges = BADGES
  .filter(b => !unlockedBadges.includes(b.label))
  .slice()
  .reverse()
  .slice(0, 4);
  return (
    
    <div style={styles.launchContainer}>
      <h2 style={{ marginBottom: 10, fontWeight: "600",color: "#171717" }}>CITY BADGES</h2>
      <div style={{ marginTop: 10 }}>
       <div style={{ marginTop: 10 }}>

  {/* EARNED BADGES */}
{earnedBadges.length > 0 && (
  <>

    {earnedBadges.map((b, i) => (
      <div key={i} style={{ ...styles.badgeCard, opacity: 1 }}>
        {b.label}
      </div>
    ))}
  </>
)}

  {/* UPCOMING BADGES */}
  {nextBadges.map((b, i) => (
    <div
      key={i}
      style={{
        ...styles.badgeCard,
        opacity: 0.3
      }}
    >
      Unlock with {b.days} day streak
    </div>
  ))}

</div>
      </div>

      <button
        onClick={() => setShowTrophies(false)}
        style={{ ...styles.secondaryButton, marginTop: 20 }}
      >
        Back
      </button>

    <Analytics />
    </div>
  );
}

if (showArchive) {
  return (
    <div style={styles.launchContainer}>
      <h2 style={{ marginBottom: 10, fontWeight: "600", color: "#171717" }}>
        PAST PUZZLES
      </h2>

      <div
  style={{
    maxWidth: 360,
    width: "100%",
    height: "60vh",
    overflowY: "auto",
    padding: "0 clamp(16px, 5vw, 24px)",
    boxSizing: "border-box"
  }}
>
        {archiveEntries.map(([date, entry], i) => (
          <div
            key={i}
            style={{
              marginBottom: 20,
              textAlign: "left",
              borderBottom: "1px solid #eee",
              paddingBottom: 12
            }}
          >
            <div style={{ fontSize: 13, color: "#666" }}>
              {formatFullDate(date)}
            </div>

            <div style={{ fontSize: 18, fontWeight: "700", marginTop: 2 }}>
              {entry.word}
            </div>

            <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>
              {entry.fact}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowArchive(false)}
        style={{ ...styles.secondaryButton, marginTop: 20 }}
      >
        Back
      </button>

      <Analytics />
    </div>
  );
}
  if (!started) {
    return (
      <div style={styles.launchContainer}>
        <img src="/capitol.png" style={styles.logo} />

        <p style={styles.subtitle}>A word game for Madison minds</p>

    <button
      onClick={() => setStarted(true)}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.97)"}
      onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}
      style={styles.playButton}
    >
      Play now
    </button>

        <button
          onClick={() => setShowTrophies(true)}
           style={styles.secondaryButton} >
        City badges
        </button>

        <button
           onClick={() => setShowInstructions(true)}
          style={styles.secondaryButton}
        >
        How to play
        </button>

        <div style={styles.streak}>{streak} day streak</div>
        <div style={styles.badge}>{getBadge(streak)}</div>

        <div style={styles.meta}>
          {formatDate()} • Puzzle {getPuzzleNumber()}
        </div>

        <button
        onClick={() => setShowArchive(true)}
        style={styles.secondaryButton}
      >
        Past puzzles
      </button>

        {/* NEW TICKER */}
        {yesterday && (
          <div style={styles.tickerWrapper}>
            <div style={styles.ticker}>
               ✅ Yesterday’s word: {yesterday.word} — {yesterday.fact}
            </div>
          </div>
        )}
      <Analytics />
      </div>
    );
  }

  return (
    <div style={styles.gameContainer}>
  
  <button
  onClick={() => {
    setStarted(false);
    setGameOver(false);
    setGuesses([]);
    setCurrent("");
    setKeyStatus({});
    setNewBadge(null);
  }}
  style={{
    ...styles.backButton,
    opacity: gameOver ? 0 : 1,
    pointerEvents: gameOver ? "none" : "auto"
  }}
>
  ←
</button>

      <div style={{ ...styles.gridWrapper, paddingBottom: gameOver ? 0 : 260 }}>
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
  

<div
  style={{
    ...styles.resultCentered,
    opacity: gameOver ? 1 : 0,
    transform: gameOver ? "translateY(0px)" : "translateY(10px)",
    transition: "opacity 1.0s ease, transform 0.4s ease"
  }}
>
          <div style={styles.answer}>{SOLUTION}</div>
          <div style={styles.fact}>{DESCRIPTION}</div>

          {newBadge && (
  <div style={styles.badgeCard}>
    <div style={styles.badgeTitle}>New badge unlocked!</div>
    <div style={styles.badgeName}>{newBadge}</div>

    <button
      onClick={() => {
      setNewBadge(null);
      setShowTrophies(true);
  }}
  style={styles.achievementButton}
>
  See city badges
</button>
  </div>
)}

 <div style={styles.buttonStack}>
  <button onClick={handleShare} style={styles.share}>
    Share with friends
  </button>

  <button
    onClick={() => {
      setStarted(false);
      setGameOver(false);
      setGuesses([]);
      setCurrent("");
      setKeyStatus({});
      setNewBadge(null);
    }}
    style={styles.secondaryButton}
  >
    Back to home
  </button>
</div>

{copied && <div style={styles.copied}>Copied to clipboard, challenge your friends</div>}

<div style={styles.return}>Add to bookmarks • New puzzles daily</div>
        </div>
      <Analytics />
    </div>
  );
}

const styles = {

  // --- LAYOUT ---
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
  paddingBottom: 140,
  pointerEvents: "none"
},

  buttonStack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginTop: 12
  },

  // --- TYPOGRAPHY ---
  subtitle: { fontSize: 16, color: "#555" },
  meta: { marginTop: 10, fontSize: 12, color: "#868686" },
  streak: { marginTop: 18, fontSize: 14 },
  badge: { fontSize: 12, color: "#666", fontStyle: "italic", marginTop: 4 },

  answer: { fontWeight: "bold", fontSize: 18 },
  fact: { fontStyle: "italic", fontSize: 14 },
  copied: { fontSize: 12, marginTop: 5 },
  return: { fontSize: 12, marginTop: 10, color: "#888" },

  // --- BUTTONS ---
playButton: {
  marginTop: 20,
  fontWeight: "600",
  padding: "10px 22px",
  backgroundColor: "#3983f3",
  color: "#fff",
  fontSize: 14,
  borderRadius: 8,
  border: "none",
  outline: "none",
  cursor: "pointer",
  transition: "transform 0.1s ease",
},

  secondaryButton: {
    marginTop: 10,
    padding: "8px 18px",
    backgroundColor: "#f3f4f6",
    color: "#111",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    cursor: "pointer"
  },

  share: {
    marginTop: 14,
    padding: "12px 18px",
    backgroundColor: "#3FC28D",
    color: "#000000",
    borderRadius: 8,
    fontSize: 14,
    border: "none",
    cursor: "pointer"
  },

  achievementButton: {
    marginTop: 10,
    padding: "8px 14px",
    backgroundColor: "#111",
    color: "#fff",
    fontSize: 13,
    borderRadius: 6,
    border: "none",
    cursor: "pointer"
  },

  dismissButton: {
    marginTop: 8,
    padding: "6px 12px",
    backgroundColor: "transparent",
    color: "#666",
    fontSize: 12,
    border: "none",
    cursor: "pointer"
  },

backButton: {
  alignSelf: "flex-start",
  marginBottom: 1,
  backgroundColor: "transparent",
  border: "none",
  fontSize: 24,
  color: "#b1b1b1",
  cursor: "pointer",
  padding: 8,
  transition: "opacity 0.3s ease"
},

  // --- GAME BOARD ---
  row: { display: "flex", gap: "clamp(6px, 1.5vw, 10px)", marginBottom: 6 },

  tile: {
    width: "clamp(52px, 14vw, 72px)",
    height: "clamp(52px, 14vw, 72px)",
    border: "1px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(18px, 5vw, 26px)",
    fontWeight: 700,
    borderRadius: 8,
    color: "#111",
    backgroundColor: "#f9fafb"
  },

  keyboardContainer: {
    width: "min(95vw, 600px)",
    padding: "12px 16px 8px",
    position: "fixed",
    bottom: 5,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000
},

  keyboardRow: {
    display: "flex",
    gap: 4,
    margin: "4px 4px"
  },

  key: {
    flex: 1,
    height: "clamp(48px, 10vw, 64px)",
    fontSize: "clamp(14px, 3.5vw, 18px)",
    borderRadius: 8,
    color: "#5b5b5b",
    margin: 1,
    fontWeight: 600,
    border: "none",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    WebkitAppearance: "none",
  },

  // --- RESULTS / BADGES ---
  resultCentered: {
    textAlign: "center",
    marginTop: 20
  },

  badgeCard: {
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    animation: "fadeInUp 0.4s ease"
  },

  badgeTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4
  },

  badgeName: {
    fontSize: 16,
    fontWeight: "600"
  },

  // --- MODAL / OVERLAY ---
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },

  popup: {
    backgroundColor: "#fff",
    padding: "20px 24px",
    borderRadius: 12,
    textAlign: "center",
    width: 280,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    animation: "fadeInUp 0.4s ease"
  },

  // --- MISC ---
  logo: { 
    width: "70vw",
    maxWidth: 375, 
    marginbottom: 5,
  },

  tickerWrapper: {
    position: "absolute",
    top: 0,
    width: "100%",
    overflow: "hidden",
    borderTop: "1px solid #eee",
    backgroundColor: "#fafafa"
  },

  ticker: {
    whiteSpace: "nowrap",
    display: "inline-block",
    padding: "8px 0",
    fontSize: 13,
    color: "#666",
    animation: "scrollText 12s linear infinite"
  }
};
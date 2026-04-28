import { useState, useEffect } from "react";


// --- WORD SYSTEM ---
const WORD_BANK = {
  "2026-04-18": { word: "CHAIR", fact: "As in, a Union chair. The Memorial Union typically replaces about 60 Terrace chairs annually. That's enough to seat about 60 people." },
  "2026-04-19": { word: "VILAS", fact: "As in, Vilas Zoo. When Vilas opened in 1911, locals would donate animals they owned or found to the zoo. Because that’s how things worked in 1911." },
  "2026-04-20": { word: "BRATS", fact: "As in, the world's largest Brat Fest. In 2010, Madison ate a record 209,376 brats. That's 26.4 miles worth of brats. That's too many brats." },
  "2026-04-21": { word: "BIRDS", fact: "As in, our city's official bird: the plastic pink flamingo. Charming and quirky, or just another win for Big Plastic? You be the judge." },
  "2026-04-22": { word: "BROOM", fact: "As in, Broom Street. It closes tomorrow, and will reopen sometime in early June. In the meantime, a detour can be found on Dustpan Drive." },
  "2026-04-23": { word: "HAPPY", fact: "As in, happy hour. Madison's best? Canteen gets my vote: 2-5pm daily. Half-off tacos and margs, $3 Tecates. We made it to patio season, people."},
  "2026-04-24": { word: "UNION", fact: "As in, Memorial Union. Pro-tip: there's a private bathroom tucked away near the Rathskeller entrance. Down the stairs, to the left. Grab a pitcher, poop in peace."},
  "2026-04-25": { word: "PARTY", fact: "As in, Mifflin St. Block Party. Heads up: it's happening today. If you plan on parking your car in the area, make sure you securely anchor it to the earth." },
  "2026-04-26": { word: "FLOCK", fact: "As in, Forward Madison FC's fans. Fun fact: in 2018, the team was nearly named 77 Square Miles SC, a nod to Madison’s almost exactly 77-square-mile footprint."},
  "2026-04-27": { word: "BLOOD", fact: "As in, the Comedy on State + Ian's Pizza Blood Drive happening tomorrow. 10am-2:30pm at the Comedy Club. Donors get tasty perks for doing a good thing. Check it out."},
  "2026-04-28": { word: "BLAZE", fact: "As in, the Capitol Fire that happened on this day in 1904. The state neglected to renew its insurance policy two months prior, leaving it with the full cost of rebuilding." },
  "2026-04-29": { word: "TAPES", fact: "As in, Stanley Kutler—the UW historian who helped release the Nixon tapes. Nixon was the 37th president. 37 students were arrested at this year’s Mifflin. And that's what we call a fact bomb." },
  "2026-04-30": { word: "METRO", fact: "As in, the Madison Metro Transit. It operates with approximately 1,346 bus stops. That's it. That's today's fact. Tell somebody." },
  "2026-05-01": { word: "FRIED", fact: "As in, Bar Corallini's fried eggplant fritters. One of Madison's tastiest appetizers. Eggplants have no business being this good. And the sauce? 🤌"},
  "2026-05-02": { word: "PLAZA", fact: "As in, the Plaza. The large paintings throughout the Plaza were given to the bar in return for erasing the painter's $1,400+ running bar tab." },
  "2026-05-03": { word: "GARTH", fact: "As in, Garth’s Brew Bar. Taxidermy trivia: the bar’s mascot (Marvin) is a Frankenmoose. His head and antlers come from two different moose."} 
};

const BASE_DATE = "2026-04-18";

// --- BADGES ---
const BADGES = [
  { days: 20, label: '🐉 Has seen the Lake Monona monster' },
  { days: 15, label: '🔦 First name basis w/ Tunnel Bob' },
  { days: 10, label: '🚕 Knows the "242-2000" jingle' },
  { days: 5, label: "⛵ Can name every Madison lake" },
  { days: 3, label: '🚘 Zipper merges on beltline' },
  { days: 1, label: "🛒 Expert Woodman's navigator" }
];

// --- TROPHIES ---
const TROPHIES = [
  { id: "first_guess", label: "🎯 First try", description: "Solve in one guess" },
  { id: "speed", label: "⚡ Lightning solve", description: "Solve in ≤10s" },
  { id: "clutch", label: "😅 Last guess", description: "Solve on final guess" }
];

const getDevDate = () => {
  if (typeof window === "undefined") return null;
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

const getUnlockedTrophies = () => {
  return JSON.parse(localStorage.getItem("capitol_trophies") || "[]");
};

const unlockTrophy = (id) => {
  const trophies = getUnlockedTrophies();

  if (!trophies.includes(id)) {
    const updated = [...trophies, id];
    localStorage.setItem("capitol_trophies", JSON.stringify(updated));
    window.dispatchEvent(new Event("trophiesUpdated"));
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
  const [started, setStarted] = useState(() => {
  const saved = JSON.parse(localStorage.getItem("capitol_game_state") || "null");
  return saved && saved.date === getTodayKey();
});
  const savedGame = JSON.parse(localStorage.getItem("capitol_game_state") || "null");
  const hasPlayedToday =
    savedGame &&
    savedGame.date === getTodayKey() &&
    savedGame.gameOver;
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [trophies, setTrophies] = useState([]);
  const [showTrophiesTab, setShowTrophiesTab] = useState(false);
  const isToday = savedGame && savedGame.date === getTodayKey();
  const [guesses, setGuesses] = useState(isToday ? savedGame.guesses || [] : []);
  const [gameOver, setGameOver] = useState(isToday ? savedGame.gameOver || false : false);
  useEffect(() => {
  if (hasPlayedToday) {
    setStarted(true);
    setGameOver(true);
  }
}, []);
  const [current, setCurrent] = useState("");
  const [keyStatus, setKeyStatus] = useState({});
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState(0);
  const [newBadge, setNewBadge] = useState(null);
  const [newTrophy, setNewTrophy] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [secretTapCount, setSecretTapCount] = useState(0);
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
  const [isLandscape, setIsLandscape] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("capitol_game_state") || "null");

  if (saved && saved.date === getTodayKey()) {
    const rebuilt = {};

    saved.guesses.forEach(g => {
      g.word.split("").forEach((letter, i) => {
        const res = g.result[i];
        if (res === "green") rebuilt[letter] = "green";
        else if (res === "blue" && rebuilt[letter] !== "green") rebuilt[letter] = "blue";
        else if (!rebuilt[letter]) rebuilt[letter] = "gray";
      });
    });

    setKeyStatus(rebuilt);
  }
}, []);

useEffect(() => {
  if (started && !gameOver && !startTime) {
    setStartTime(Date.now());
  }
}, [started]);

useEffect(() => {
  if (!startTime || gameOver) return;

  const interval = setInterval(() => {
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
  }, 100);

  return () => clearInterval(interval);
}, [startTime, gameOver]);

useEffect(() => {
  if (typeof track !== "function") return;

  if (showArchive) {
    track("view_archive");
  } else if (showTrophies) {
    track("view_trophies");
  } else if (showInstructions) {
    track("view_instructions");
  } else if (!started) {
    track("view_home");
  } else {
    track("view_game");
  }
}, [showArchive, showTrophies, showInstructions, started]);

useEffect(() => {
  const loadData = () => {
    const { streak } = getStreakData();
    setStreak(streak);
    const savedTrophies = getUnlockedTrophies();
setTrophies(savedTrophies);
window.addEventListener("trophiesUpdated", loadData);
window.removeEventListener("trophiesUpdated", loadData);


    // 🔥 AUTO-FIX: backfill missing badges
    BADGES.forEach(badge => {
      if (streak >= badge.days) {
        unlockBadge(badge.label);
      }
    });

    const savedBadges = getUnlockedBadges();
    setUnlockedBadges(savedBadges);
  };

  loadData();

  window.addEventListener("achievementsUpdated", loadData);

  return () => {
    window.removeEventListener("achievementsUpdated", loadData);
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

    if (won) {
        let earnedTrophy = null;

        if (newGuesses.length === 1) {
          if (unlockTrophy("first_guess")) earnedTrophy = "🎯 First try";
        }

        if (elapsedTime <= 10) {
          if (unlockTrophy("speed")) earnedTrophy = "⚡ 10 seconds or less";
        }

        if (newGuesses.length === MAX_GUESSES) {
          if (unlockTrophy("clutch")) earnedTrophy = "😅 Final guess";
        }

        if (earnedTrophy) {
          setNewTrophy(earnedTrophy);
  }
}
      const newStreak = updateStreak(won);
      setStreak(newStreak);
      
      localStorage.setItem(
  "capitol_game_state",
  JSON.stringify({
    date: getTodayKey(),
    guesses: newGuesses,
    gameOver: true,
    won: guess === SOLUTION,
    started: true
  })
);
      

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

  useEffect(() => {
  if (gameOver) {
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });
    }, 300); // slight delay so UI finishes rendering
  }
}, [gameOver]);

  useEffect(() => {
  const updateCountdown = () => {
    const now = new Date();

    // next midnight (local time)
    const next = new Date();
    next.setHours(24, 0, 0, 0);

    const diff = next - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, "0");

    setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
  };

  updateCountdown(); // run immediately
  const interval = setInterval(updateCountdown, 1000); // update every second

  return () => clearInterval(interval);
}, []);

 useEffect(() => {
  const checkOrientation = () => {
    const isMobile = window.innerWidth < 768; // tweak if you want
    const isLandscapeNow = window.innerWidth > window.innerHeight;

    setIsLandscape(isMobile && isLandscapeNow);
  };

  checkOrientation();
  window.addEventListener("resize", checkOrientation);

  return () => window.removeEventListener("resize", checkOrientation);

}, []);


  const emojiMap = { green: "🟩", blue: "🟦", gray: "⬜" };

const handleShare = async () => {
  const grid = guesses
    .map(g => g.result.map(r => emojiMap[r]).join(""))
    .join("\n");

const text = `Consider myself puzzled.\n\n${grid}\n\nYour turn → MadTiles.com`;

  try {
    if (navigator.share) {
      await navigator.share({
        text,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  } catch (err) {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}
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
  style={{ ...styles.playButton, ...styles.pulse }}
>
  Play now
</button>

      <button
        onClick={() => setShowInstructions(false)}
        style={{ ...styles.secondaryButton, marginTop: 10 }}
      >
        Back
      </button>
      <div
  onClick={() => {
    const newCount = secretTapCount + 1;
    setSecretTapCount(newCount);

    if (newCount === 5) {
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

      localStorage.setItem(
        "capitol_streak",
        JSON.stringify({
          streak: 5,
          lastPlayed: key
        })
      );

      window.location.reload();
    }

    // reset if they pause too long
    setTimeout(() => setSecretTapCount(0), 2000);
  }}
  style={{
    height: 40,
    width: "100%",
    marginTop: 10,
    opacity: 0
  }}
/>


    </div>
  );
}
if (showTrophies) {

  const sortedBadges = [...BADGES].sort((a, b) => a.days - b.days);

const earnedBadges = sortedBadges.filter(b =>
  unlockedBadges.includes(b.label)
);

const nextBadges = sortedBadges
  .filter(b => !unlockedBadges.includes(b.label))
  .slice(0, 4);

  return (
    
    <div style={{ 
  ...styles.launchContainer, 
  justifyContent: "flex-start",
  paddingTop: 100
}}>
<div style={{
  display: "flex",
  gap: 6,
  backgroundColor: "#ffffff",
  borderRadius: 10,
  padding: 4,
  marginBottom: 16
}}>  

<div
  onClick={() => setShowTrophiesTab(false)}
  style={{
    flex: 1,
    textAlign: "center",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    backgroundColor: !showTrophiesTab ? "#fff" : "transparent",
    color: !showTrophiesTab ? "#111" : "#888",
    boxShadow: !showTrophiesTab ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
  }}
>
  BADGES
</div>

  <div
  onClick={() => setShowTrophiesTab(true)}
  style={{
    flex: 1,
    textAlign: "center",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    backgroundColor: showTrophiesTab ? "#fff" : "transparent",
    color: showTrophiesTab ? "#111" : "#888",
    boxShadow: showTrophiesTab ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
  }}
>
  TROPHIES
</div>

</div>
      {!showTrophiesTab ? (
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
) : (
  <div style={{ marginTop: 10 }}>
    {TROPHIES.map((t, i) => {
      const unlocked = trophies.includes(t.id);

      return (
        <div
          key={i}
          style={{
            ...styles.badgeCard,
            opacity: unlocked ? 1 : 0.3
          }}
        >
          {unlocked ? t.label : t.description}
        </div>
      );
    })}
  </div>
)}

      <button
        onClick={() => setShowTrophies(false)}
        style={{ ...styles.secondaryButton, marginTop: 20 }}
      >
        Back
      </button>

  
    </div>
  );
}

if (showArchive) {
  return (
    <div style={styles.launchContainer}>
      <h2 style={{ marginBottom: 20, fontWeight: "600", color: "#171717" }}>
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

      
    </div>
  );
}

if (isLandscape) {
  return (
    <div style={styles.launchContainer}>
      <h2 style={{ fontWeight: "600", color: "#171717" }}>Rotate your phone</h2>
      <p style={{ color: "#171717", marginTop: 10 }}>
        For now, this experience only works in portrait mode. Just know that I tried.
      </p>
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
      onMouseDown={(e) => e.currentTarget.style.opacity = "0.9"}
      onMouseUp={(e) => e.currentTarget.style.opacity = "1"}
      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      onTouchStart={(e) => e.currentTarget.style.opacity = "0.9"}
      onTouchEnd={(e) => e.currentTarget.style.opacity = "1"}
      style={{ ...styles.playButton, ...styles.pulse }}
    >
      Play now
    </button>

        <button
          onClick={() => setShowTrophies(true)}
           style={styles.secondaryButton} >
        Achievements
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
        {formatDate()} • Puzzle {getPuzzleNumber()} •{" "}
        <a
          href="https://instagram.com/mad__tiles"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#888", textDecoration: "none" }}
        >
          @mad__tiles
        </a>
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
              This week's forecast: Wed 53°⛅ Thu 50°⛅ Fri 48°⛅ Sat 53°⛅ Sun 66°⛅ • 100% chance of puzzles
            </div>
          </div>
        )}
      
      </div>
    );
  }

  return (
    <div style={styles.gameContainer}>
  
  <button
  onClick={() => {
  setStarted(false);

  if (!hasPlayedToday) {
    setGameOver(false);
    setGuesses([]);
    setCurrent("");
    setKeyStatus({});
    setNewBadge(null);
  }
}}
  style={{
    ...styles.backButton,
    opacity: gameOver ? 0 : 1,
    pointerEvents: gameOver ? "none" : "auto"
  }}
>
  ←
</button>

      <div
  style={{
    ...styles.gridWrapper,
    paddingBottom: gameOver ? 0 : 260,
    opacity: gameOver ? 0.6 : 1,
    transition: "opacity 0.5s ease"
  }}
>
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

    {/* BADGE */}
{newBadge && (
  <div style={styles.badgeCard}>
    <div style={styles.badgeTitle}>New badge unlocked!</div>
    <div style={styles.badgeName}>{newBadge}</div>

    <button
      onClick={() => {
        setNewBadge(null);

        // AFTER badge is dismissed, trophy will show if it exists
      }}
      style={styles.achievementButton}
    >
      {newTrophy ? "Next" : "See achievements"}
    </button>
  </div>
)}

{/* TROPHY (only shows AFTER badge is cleared) */}
{!newBadge && newTrophy && (
  <div style={styles.badgeCard}>
    <div style={styles.badgeTitle}>New trophy earned!</div>
    <div style={styles.badgeName}>{newTrophy}</div>

    <button
      onClick={() => {
        setNewTrophy(null);
        setShowTrophies(true);
      }}
      style={styles.achievementButton}
    >
      See achievements
    </button>
  </div>
)}

 <div style={styles.buttonStack}>
  <button
    onClick={handleShare}
    style={{ ...styles.share, ...styles.pulse }}
  >
    Share with friends
  </button>

  {gameOver && (
  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
    Next puzzle: {timeLeft}
  </div>
)}

  <a
  href="https://instagram.com/mad__tiles"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    fontSize: 12,
    color: "#888",
    marginTop: 1,
    textDecoration: "none"
  }}
>
  Follow @mad__tiles on IG
</a>

  <button
    onClick={() => {
  setStarted(false);

  if (!hasPlayedToday) {
    setGameOver(false);
    setGuesses([]);
    setCurrent("");
    setKeyStatus({});
    setNewBadge(null);
  }
}}
    style={styles.secondaryButton}
  >
    Back to home
  </button>
</div>

{copied && <div style={styles.copied}>Copied to clipboard, challenge your friends</div>}

        </div>
     
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

  pulse: {
    animation: "pulse 1.8s ease-in-out infinite"
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
    animation: "scrollText 8s linear infinite"
  }
};
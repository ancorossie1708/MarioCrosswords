import React, { useState, useEffect, useRef } from 'react';

// --- אייקונים מותאמים אישית (בסגנון מריו) ---
const Coins = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="#FBD000" stroke="#E59400" strokeWidth="2" />
    <rect x="10" y="6" width="4" height="12" fill="#E59400" rx="1" />
  </svg>
);

const Star = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FBD000" stroke="#E59400" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="10" cy="11" r="1.5" fill="#E59400" />
    <circle cx="14" cy="11" r="1.5" fill="#E59400" />
  </svg>
);

const ArrowLeft = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>;
const ArrowDown = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>;
const HomeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

const AppWrapper = ({ children, bgClass = "bg-black", bgImage, dir = "rtl", onMove, onUp, onLeave }) => (
  <div className="fixed inset-0 w-full h-full bg-[#111] flex justify-center sm:items-center overflow-hidden z-0">
    <style>{`
      @font-face {
        font-family: 'MarioGameFont';
        src: url('/fonts/GameFont.ttf') format('truetype'); 
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'MarioCrosswordFont';
        src: url('/fonts/CrosswordFont.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }

      html, body { 
          overscroll-behavior-y: none; 
          touch-action: none; 
          overflow: hidden; 
          background-color: #111; 
          margin: 0; 
          padding: 0;
          font-family: 'MarioGameFont', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .crossword-letter {
          font-family: 'MarioCrosswordFont', Arial, Helvetica, sans-serif !important;
      }

      @keyframes introVideoAnim { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      .anim-intro { animation: introVideoAnim 2s ease-out forwards; }
      @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .animate-bounce-slow { animation: bounce-slow 1.5s infinite; }
      @keyframes dance { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-20px) rotate(-10deg); } 50% { transform: translateY(0) rotate(0deg); } 75% { transform: translateY(-20px) rotate(10deg); } }
      .animate-dance { animation: dance 0.6s infinite; }
      @keyframes bossRevealAnim { 0% { transform: scale(0.1) rotate(180deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
      .anim-boss { animation: bossRevealAnim 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      .anim-drag { animation: float-drag 0.8s ease-in-out infinite; }
      @keyframes sink { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(100px); opacity: 0; } }
      .anim-sink { animation: sink 3s ease-in forwards; }
    `}</style>
    <div 
      dir={dir} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onLeave} 
      className={`w-full max-w-[450px] h-[100dvh] sm:h-[95dvh] sm:rounded-[2.5rem] flex flex-col select-none touch-none shadow-[0_0_50px_rgba(0,0,0,0.6)] sm:border-[6px] border-[#222] relative transition-colors duration-1000 overflow-hidden ${!bgImage ? bgClass : ''}`}
      style={bgImage ? { backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {children}
    </div>
  </div>
);

const PLAYABLE_CHARS = [
    { id: "mario", imgSrc: "/assets/ui/mario.png", emoji: "👨🏻‍🔧", name: "מריו", partnerEmoji: "👸🏼", partnerName: "פיץ'", color: "bg-red-500" },
    { id: "peach", imgSrc: "/assets/ui/peach.png", emoji: "👸🏼", name: "פיץ'", partnerEmoji: "👨🏻‍🔧", partnerName: "מריו", color: "bg-pink-500" },
    { id: "luigi", imgSrc: "/assets/ui/luigi.png", emoji: "🧑🏻‍🔧", name: "לואיג'י", partnerEmoji: "🌼", partnerName: "דייזי", color: "bg-green-500" },
    { id: "daisy", imgSrc: "/assets/ui/daisy.png", emoji: "🌼", name: "דייזי", partnerEmoji: "🧑🏻‍🔧", partnerName: "לואיג'י", color: "bg-yellow-500" }
];

const FULL_FALLBACK_DATA = [{
  "gridSize": { "rows": 8, "cols": 8 },
  "words": [
    { "id": 1, "direction": "down", "len": 5, "startRow": 0, "startCol": 0, "word": "מדרגה", "clue": "שלב קטן שדורכים עליו כשעולים או יורדים בבניין", "isStarWord": false },
    { "id": 1, "direction": "across", "len": 4, "startRow": 0, "startCol": 0, "word": "מברג", "clue": "כלי עבודה שמסובב ומחזק ברגים למקומם היציב", "isStarWord": false },
    { "id": 2, "direction": "down", "len": 4, "startRow": 0, "startCol": 3, "word": "גוזר", "clue": "חותך ניירות או בדים לחתיכות בעזרת מספריים חדות", "isStarWord": false },
    { "id": 3, "direction": "across", "len": 3, "startRow": 0, "startCol": 5, "word": "צבר", "clue": "השיח הקוצני ממנו צומחות סברס מתוקות", "isStarWord": false },
    { "id": 4, "direction": "down", "len": 5, "startRow": 0, "startCol": 6, "word": "בעיות", "clue": "קשיים או שאלות מסובכות שצריך לפתור", "isStarWord": false },
    { "id": 5, "direction": "across", "len": 5, "startRow": 2, "startCol": 3, "word": "זחלימ", "clue": "חרקים ארוכים שהולכים על הבטן ובהמשך הופכים לפרפרים", "isStarWord": true },
    { "id": 6, "direction": "across", "len": 3, "startRow": 4, "startCol": 0, "word": "הוד", "clue": "מראה מלכותי ומרשים מאוד המעורר כבוד", "isStarWord": false },
    { "id": 7, "direction": "down", "len": 3, "startRow": 4, "startCol": 1, "word": "ורד", "clue": "הפרח האדום והרומנטי שיש לו גם קוצים על הגבעול", "isStarWord": false },
    { "id": 8, "direction": "across", "len": 4, "startRow": 4, "startCol": 4, "word": "מפתח", "clue": "הכלי ממתכת שאנחנו מכניסים לחור שבדלת כדי לסובב ולפתוח אותה", "isStarWord": false },
    { "id": 9, "direction": "down", "len": 4, "startRow": 4, "startCol": 7, "word": "חוסנ", "clue": "הכוח והיכולת שלנו להישאר יציבים ולא להישבר תחת לחץ", "isStarWord": false },
    { "id": 10, "direction": "down", "len": 3, "startRow": 5, "startCol": 3, "word": "צבי", "clue": "חיה עדינה וזריזה עם קרניים שרצה באזורי הספר", "isStarWord": false },
    { "id": 11, "direction": "across", "len": 2, "startRow": 6, "startCol": 0, "word": "שד", "clue": "יצור מפחיד ודמיוני מהאגדות שלפעמים מגשים משאלות כשהוא יוצא מתוך מנורת קסמים", "isStarWord": false },
    { "id": 11, "direction": "down", "len": 2, "startRow": 6, "startCol": 0, "word": "שר", "clue": "אדם בממשלה שאחראי על תחום מסוים וחשוב במדינה, כמו חינוך או ביטחון", "isStarWord": false },
    { "id": 12, "direction": "down", "len": 2, "startRow": 6, "startCol": 5, "word": "רז", "clue": "מילה נרדפת לסוד קסום או לדבר נסתר שאסור בשום אופן לגלות לאף אחד", "isStarWord": false },
    { "id": 13, "direction": "across", "len": 6, "startRow": 7, "startCol": 2, "word": "חילזונ", "clue": "בעל חיים איטי שהולך עם הבית שלו על הגב ומשאיר שובל לח", "isStarWord": false }
  ]
}];

const MAP_POSITIONS = [
    { x: 80, y: 15 }, { x: 25, y: 30 }, { x: 70, y: 45 }, { x: 25, y: 65 }, { x: 70, y: 80 }, { x: 25, y: 95 }
];

const CHARACTER_WORLDS = {
  mario: [
    { theme: "מישורי הפטריות", enTheme: "Mushroom Plains", bg: "bg-[#43B047]", icon: "🍄", iconSrc: "/assets/map/mario-peach/Mushroom_Plains_icon.png", bgSrc: "/assets/stories/mario-peach/Mushroom_Plains.png" },
    { theme: "מערת האגם הנסתר", enTheme: "Hidden Lagoon Cave", bg: "bg-[#049CD8]", icon: "💧", iconSrc: "/assets/map/mario-peach/Hidden_Lagoon_Cave_icon.png", bgSrc: "/assets/stories/mario-peach/Hidden_Lagoon_Cave.png" },
    { theme: "יער הענקים", enTheme: "Giant Tree Forest", bg: "bg-[#228B22]", icon: "🌲", iconSrc: "/assets/map/mario-peach/Giant_Tree_Forest_icon.png", bgSrc: "/assets/stories/mario-peach/Giant_Tree_Forest.png" },
    { theme: "מפרץ הפיראטים", enTheme: "Pirate Cove", bg: "bg-[#4682B4]", icon: "🏴‍☠️", iconSrc: "/assets/map/mario-peach/Pirate_Cove_icon.png", bgSrc: "/assets/stories/mario-peach/Pirate_Cove.png" },
    { theme: "אחוזת הרוחות", enTheme: "Haunted Mansion", bg: "bg-[#4B0082]", icon: "👻", iconSrc: "/assets/map/mario-peach/Haunted_Mansion_icon.png", bgSrc: "/assets/stories/mario-peach/Haunted_Mansion.png" },
    { theme: "ממלכת העננים הסוערת", enTheme: "Stormy Cloud Kingdom", bg: "bg-[#708090]", icon: "🌩️", iconSrc: "/assets/map/mario-peach/Stormy_Cloud_Kingdom_icon.png", bgSrc: "/assets/stories/mario-peach/Stormy_Cloud_Kingdom.png" }
  ],
  peach: [
    { theme: "גני הצוף", enTheme: "Nectar Gardens", bg: "bg-[#FF69B4]", icon: "🌺", iconSrc: "/assets/map/peach-mario/Nectar_Gardens_icon.png", bgSrc: "/assets/stories/peach-mario/Nectar_Gardens.png" },
    { theme: "מפעל הצעצועים", enTheme: "Toy Factory", bg: "bg-[#FF8C00]", icon: "🧸", iconSrc: "/assets/map/peach-mario/Toy_Factory_icon.png", bgSrc: "/assets/stories/peach-mario/Toy_Factory.png" },
    { theme: "הביצה הרעילה", enTheme: "Toxic Swamp", bg: "bg-[#800080]", icon: "☠️", iconSrc: "/assets/map/peach-mario/Toxic_Swamp_icon.png", bgSrc: "/assets/stories/peach-mario/Toxic_Swamp.png" },
    { theme: "מעלה הברקים", enTheme: "Lightning Ridge", bg: "bg-[#DAA520]", icon: "⚡", iconSrc: "/assets/map/peach-mario/Lightning_Ridge_icon.png", bgSrc: "/assets/stories/peach-mario/Lightning_Ridge.png" },
    { theme: "מנהרות הכורים", enTheme: "Minecart Tunnels", bg: "bg-[#8B4513]", icon: "⛏️", iconSrc: "/assets/map/peach-mario/Minecart_Tunnels_icon.png", bgSrc: "/assets/stories/peach-mario/Minecart_Tunnels.png" },
    { theme: "עמק הלבה הגועש", enTheme: "Roaring Lava Valley", bg: "bg-[#FF0000]", icon: "🌋", iconSrc: "/assets/map/peach-mario/Roaring_Lava_Valley_icon.png", bgSrc: "/assets/stories/peach-mario/Roaring_Lava_Valley.png" }
  ],
  luigi: [
    { theme: "אחוזת מסתורין", enTheme: "Mystery Manor", bg: "bg-[#2F4F4F]", icon: "🏚️" },
    { theme: "מזרקת הצינורות", enTheme: "Pipe Fountain", bg: "bg-[#00CED1]", icon: "⛲" },
    { theme: "מעמקי האוקיינוס", enTheme: "Deep Ocean Trench", bg: "bg-[#00008B]", icon: "🌊" },
    { theme: "יער האשליות", enTheme: "Forest of Illusion", bg: "bg-[#556B2F]", icon: "🌳" },
    { theme: "קניון האבן", enTheme: "Stone Canyon", bg: "bg-[#A0522D]", icon: "🪨" },
    { theme: "מדבר סופת החול", enTheme: "Sandstorm Desert", bg: "bg-[#EDC9AF]", icon: "🏜️" }
  ],
  daisy: [
    { theme: "עמק הפרחים החי", enTheme: "Lively Flower Valley", bg: "bg-[#FFD700]", icon: "🌻" },
    { theme: "מקדש עתיק", enTheme: "Ancient Temple Ruins", bg: "bg-[#BDB76B]", icon: "🏛️" },
    { theme: "גבישי הקרח", enTheme: "Ice Crystals", bg: "bg-[#E0FFFF]", icon: "🧊" },
    { theme: "ממלכת המתיקות", enTheme: "Sweet Kingdom", bg: "bg-[#FFC0CB]", icon: "🍭" },
    { theme: "גלקסיית הכוכבים", enTheme: "Star Galaxy", bg: "bg-[#111111]", icon: "🌌" },
    { theme: "מדרון הקרח ההרוס", enTheme: "Ruined Ice Slope", bg: "bg-[#B0E0E6]", icon: "🏔️" }
  ]
};

const HEBREW_KEYBOARD = [
  ["ק", "ר", "א", "ט", "ו", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל"],
  ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת"]
];

export default function App() {
  const [gameState, setGameState] = useState("START"); 
  const [playerObj, setPlayerObj] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(0); 
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activeLevels, setActiveLevels] = useState([]); 
  
  const [generatedLevelData, setGeneratedLevelData] = useState(null);
  const [directionChoice, setDirectionChoice] = useState(null);
  
  const [coins, setCoins] = useState(3); 
  const [stars, setStars] = useState(1); 
  
  const [grid, setGrid] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [solvedWords, setSolvedWords] = useState([]);
  const [errorWordId, setErrorWordId] = useState(null);
  const [successWordId, setSuccessWordId] = useState(null);
  const [wordNumbers, setWordNumbers] = useState({});
  const [isRevealedMode, setIsRevealedMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [dragState, setDragState] = useState({ active: false, char: "", x: 0, y: 0 });
  const [recentlyErrored, setRecentlyErrored] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [showLevelUI, setShowLevelUI] = useState(false);

  const boardContainerRef = useRef(null);

  const TOTAL_JSON_FILES = 105; 

  const fetchPuzzleData = async (selectedChar) => {
    setIsLoadingData(true);
    const currentThemes = CHARACTER_WORLDS[selectedChar.id]; 
    
    try {
      let playedHistory = JSON.parse(localStorage.getItem('mario_played_jsons') || '[]');
      const chosenIds = [];
      
      for(let i = 0; i < 6; i++) {
        let availableIds = Array.from({length: TOTAL_JSON_FILES}, (_, idx) => idx + 1)
                                .filter(id => !playedHistory.includes(id) && !chosenIds.includes(id));
        
        if (availableIds.length === 0) {
          playedHistory = [];
          availableIds = Array.from({length: TOTAL_JSON_FILES}, (_, idx) => idx + 1).filter(id => !chosenIds.includes(id));
          if(availableIds.length === 0) availableIds = Array.from({length: TOTAL_JSON_FILES}, (_, idx) => idx + 1);
        }

        const chosen = availableIds[Math.floor(Math.random() * availableIds.length)];
        chosenIds.push(chosen);
        playedHistory.push(chosen);
      }

      localStorage.setItem('mario_played_jsons', JSON.stringify(playedHistory));

      const levelsArray = [];
      for(let i = 0; i < chosenIds.length; i++) {
        const id = chosenIds[i];
        try {
          const response = await fetch(`/Crosswords_Jsons/Crossword_${id}.json?t=${new Date().getTime()}`);
          if(response.ok) {
            const data = await response.json();
            const levelData = Array.isArray(data) ? data[0] : data;
            
            levelsArray.push({
               ...levelData,
               theme: currentThemes[i].theme,
               enTheme: currentThemes[i].enTheme,
               bg: currentThemes[i].bg,
               icon: currentThemes[i].icon,
               iconSrc: currentThemes[i].iconSrc,
               bgSrc: currentThemes[i].bgSrc 
            });
          } else {
            levelsArray.push({ ...FULL_FALLBACK_DATA[0], ...currentThemes[i] });
          }
        } catch(err) {
           levelsArray.push({ ...FULL_FALLBACK_DATA[0], ...currentThemes[i] });
        }
      }
      
      setActiveLevels(levelsArray);
      setGameState("INTRO");
    } catch (err) {
      console.warn("External JSON load failed, using fallback.", err);
      let fallback = [];
      for(let i=0; i<6; i++) fallback.push({ ...FULL_FALLBACK_DATA[0], ...currentThemes[i] });
      setActiveLevels(fallback);
      setGameState("INTRO");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
      let t;
      if (gameState === "LEVEL_CELEBRATION") {
          t = setTimeout(() => setGameState("PARTNER_HELP"), 2500);
      } else if (gameState === "PARTNER_HELP") {
          t = setTimeout(() => {
              const nextUnlocked = Math.max(unlockedLevels, currentLevelIndex + 1);
              setUnlockedLevels(nextUnlocked);
              if (nextUnlocked >= activeLevels.length) setGameState("BOSS_PRE_VIDEO");
              else setGameState("MAP");
          }, 3000);
      } else if (gameState === "ABANDON_ANIMATION") {
          t = setTimeout(() => {
              setUnlockedLevels(0);
              setCurrentLevelIndex(0);
              setGrid([]);
              setGeneratedLevelData(null);
              setGameState("START");
          }, 4500);
      }
      return () => clearTimeout(t);
  }, [gameState, unlockedLevels, currentLevelIndex, activeLevels.length]);

  const loadPuzzle = (index) => {
    // הגנה קריטית: מוודאים שהנתונים מה-JSON עוברים סינון בטוח כדי למנוע קריסה (מסך לבן)
    const rawData = activeLevels[index];
    if (!rawData) return;
    const data = JSON.parse(JSON.stringify(rawData)); 

    const rows = data.gridSize?.rows || 8;
    const cols = data.gridSize?.cols || 8;

    data.words = (Array.isArray(data.words) ? data.words : FULL_FALLBACK_DATA[0].words).map((w, idx) => ({ 
        ...w, 
        word: w.word || "", 
        clue: w.clue || "...", 
        internalId: `w_${idx}`, 
        displayNum: w.id || idx + 1,
        startRow: w.startRow || 0,
        startCol: w.startCol || 0,
        direction: w.direction || "across"
    }));

    setGeneratedLevelData({
        ...data,
        gridSize: { rows, cols }
    });

    const newGrid = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isActive: false, isLocked: false, correctChar: "", currentUserChar: "",
        wordIds: { across: null, down: null }, cellNumber: null 
      }))
    );
    
    let wNums = {}; let cellNums = {};
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const starters = data.words.filter(w => w.startRow === r && w.startCol === c);
            if (starters.length > 0) {
                cellNums[`${r}-${c}`] = starters[0].displayNum;
                starters.forEach(w => { wNums[w.internalId] = w.displayNum; });
            }
        }
    }
    setWordNumbers(wNums);

    data.words.forEach(wordObj => {
      for (let i = 0; i < wordObj.word.length; i++) {
        const r = wordObj.direction === "down" ? wordObj.startRow + i : wordObj.startRow;
        const c = wordObj.direction === "across" ? wordObj.startCol + i : wordObj.startCol;
        
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          newGrid[r][c].isActive = true;
          newGrid[r][c].correctChar = wordObj.word[i];
          if (wordObj.direction === "across") newGrid[r][c].wordIds.across = wordObj.internalId;
          if (wordObj.direction === "down") newGrid[r][c].wordIds.down = wordObj.internalId;
          if (i === 0) newGrid[r][c].cellNumber = cellNums[`${r}-${c}`];
        }
      }
    });

    setCurrentLevelIndex(index);
    setGrid(newGrid);
    setSolvedWords([]);
    setIsRevealedMode(false);
    setIsGameOver(false);
    setDirectionChoice(null);
    setRecentlyErrored([]);
    setErrorWordId(null);
    
    setCoins(3);
    setStars(1);
    setShowLevelUI(false); 
    
    if (data.words.length > 0) setSelectedWord(data.words[0]);
    setGameState("PLAYING");
  };

  const handleGameOver = (failedWordId) => {
      setIsGameOver(true);
      setErrorWordId(failedWordId); 
      
      const newGrid = grid.map(row => row.map(cell => {
          if (!cell.isActive) return cell;
          if (cell.isLocked) return cell; 
          
          if (failedWordId && (cell.wordIds.across === failedWordId || cell.wordIds.down === failedWordId)) {
              return { ...cell, currentUserChar: cell.correctChar, isLocked: true };
          }
          
          return { ...cell, currentUserChar: "", isLocked: true };
      }));
      setGrid(newGrid);
  };

  const buyLetterHint = () => {
      if (coins < 1 || isRevealedMode || isGameOver || !generatedLevelData) return;
      const unsolvedWordsList = generatedLevelData.words.filter(w => !solvedWords.includes(w.internalId));
      if (unsolvedWordsList.length === 0) return;
      const randomWord = unsolvedWordsList[Math.floor(Math.random() * unsolvedWordsList.length)];

      let unlockedCells = [];
      for (let i = 0; i < randomWord.word.length; i++) {
          const r = randomWord.direction === "down" ? randomWord.startRow + i : randomWord.startRow;
          const c = randomWord.direction === "across" ? randomWord.startCol + i : randomWord.startCol;
          if (!grid[r][c].isLocked) unlockedCells.push({r, c});
      }
      if (unlockedCells.length === 0) return; 

      const { r, c } = unlockedCells[Math.floor(Math.random() * unlockedCells.length)];
      setCoins(prev => prev - 1);

      const newGrid = [...grid];
      newGrid[r] = [...grid[r]];
      newGrid[r][c] = { ...newGrid[r][c], currentUserChar: newGrid[r][c].correctChar, isLocked: true };
      setGrid(newGrid);

      const cellRef = newGrid[r][c];
      if (cellRef.wordIds.across) checkWordCompletion(newGrid, generatedLevelData.words.find(w => w.internalId === cellRef.wordIds.across));
      if (cellRef.wordIds.down) checkWordCompletion(newGrid, generatedLevelData.words.find(w => w.internalId === cellRef.wordIds.down));
  };

  const buyWordHint = () => {
      if (stars < 1 || isRevealedMode || isGameOver || !generatedLevelData) return;
      const unsolvedWordsList = generatedLevelData.words.filter(w => !solvedWords.includes(w.internalId));
      if (unsolvedWordsList.length === 0) return;
      const randomWord = unsolvedWordsList[Math.floor(Math.random() * unsolvedWordsList.length)];
      
      setStars(prev => prev - 1);
      const updatedGrid = [...grid];
      for (let i = 0; i < randomWord.word.length; i++) {
          const rr = randomWord.direction === "down" ? randomWord.startRow + i : randomWord.startRow;
          const cc = randomWord.direction === "across" ? randomWord.startCol + i : randomWord.startCol;
          updatedGrid[rr] = [...updatedGrid[rr]];
          updatedGrid[rr][cc] = { ...updatedGrid[rr][cc], currentUserChar: updatedGrid[rr][cc].correctChar, isLocked: true };
      }
      setGrid(updatedGrid);
      checkWordCompletion(updatedGrid, randomWord);
  };

  const selectDirection = (internalId) => {
    const wordObj = generatedLevelData.words.find(w => w.internalId === internalId);
    setSelectedWord(wordObj);
    setDirectionChoice(null); 
  };

  const handleCellClick = (r, c) => {
    const cell = grid[r][c];
    if (!cell.isActive || isGameOver || !generatedLevelData) return;
    if (cell.currentUserChar && !cell.isLocked) {
      const newGrid = [...grid];
      newGrid[r] = [...grid[r]];
      newGrid[r][c] = { ...cell, currentUserChar: "" };
      setGrid(newGrid);
      return; 
    }
    const wAcross = cell.wordIds.across ? generatedLevelData.words.find(w => w.internalId === cell.wordIds.across) : null;
    const wDown = cell.wordIds.down ? generatedLevelData.words.find(w => w.internalId === cell.wordIds.down) : null;
    if (wAcross && wDown) {
        if (directionChoice && directionChoice.r === r && directionChoice.c === c) setDirectionChoice(null);
        else setDirectionChoice({ r, c, across: wAcross.internalId, down: wDown.internalId });
    } else if (wAcross) setSelectedWord(wAcross);
    else if (wDown) setSelectedWord(wDown);
  };

  const handlePointerDown = (e, char) => {
    if (isGameOver) return;
    e.preventDefault();
    if(e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragState({ active: true, char, x: e.clientX, y: e.clientY });
    setDirectionChoice(null); 
  };

  const handlePointerMove = (e) => {
    if (!dragState.active) return;
    setDragState(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
  };

  const handlePointerUp = (e) => {
    if (!dragState.active) return;
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    const cellElement = dropTarget?.closest("[data-row]");
    if (cellElement) {
      const r = parseInt(cellElement.getAttribute("data-row"));
      const c = parseInt(cellElement.getAttribute("data-col"));
      applyCharToCell(r, c, dragState.char);
    }
    setDragState({ active: false, char: "", x: 0, y: 0 });
  };

  const applyCharToCell = (r, c, char) => {
    const cell = grid[r][c];
    if (!cell.isActive || cell.isLocked || isRevealedMode || isGameOver || !generatedLevelData) return;
    const nextGrid = [...grid];
    nextGrid[r] = [...nextGrid[r]];
    nextGrid[r][c] = { ...cell, currentUserChar: char };
    setGrid(nextGrid);
    if (cell.wordIds.across) checkWordCompletion(nextGrid, generatedLevelData.words.find(w => w.internalId === cell.wordIds.across));
    if (cell.wordIds.down) checkWordCompletion(nextGrid, generatedLevelData.words.find(w => w.internalId === cell.wordIds.down));
  };

  const checkWordCompletion = (currentGrid, wordObj) => {
    if (!wordObj || !generatedLevelData) return;
    let isFull = true, isCorrect = true;
    for (let i = 0; i < wordObj.word.length; i++) {
      const r = wordObj.direction === "down" ? wordObj.startRow + i : wordObj.startRow;
      const c = wordObj.direction === "across" ? wordObj.startCol + i : wordObj.startCol;
      if (!currentGrid[r]?.[c]) { isFull = false; continue; }
      if (!currentGrid[r][c].currentUserChar) isFull = false;
      if (currentGrid[r][c].currentUserChar !== currentGrid[r][c].correctChar) isCorrect = false;
    }
    if (isFull) {
      if (isCorrect && !solvedWords.includes(wordObj.internalId)) {
        const nextGrid = [...currentGrid];
        for (let i = 0; i < wordObj.word.length; i++) {
          const r = wordObj.direction === "down" ? wordObj.startRow + i : wordObj.startRow;
          const c = wordObj.direction === "across" ? wordObj.startCol + i : wordObj.startCol;
          nextGrid[r] = [...nextGrid[r]];
          nextGrid[r][c] = { ...nextGrid[r][c], isLocked: true };
        }
        setGrid(nextGrid);
        setSuccessWordId(wordObj.internalId);
        setSolvedWords(prev => {
          const newSolved = [...prev, wordObj.internalId];
          if (newSolved.length === generatedLevelData.words.length) setGameState("LEVEL_CELEBRATION");
          return newSolved;
        });
        setTimeout(() => setSuccessWordId(null), 1500);
      } else if (!isCorrect && !solvedWords.includes(wordObj.internalId)) {
        handleError(wordObj.internalId);
      }
    }
  };

  const handleError = (internalId) => {
     if (recentlyErrored.includes(internalId)) return;
     setRecentlyErrored(p => [...p, internalId]);
     
     let fail = false;
     if (coins > 0) setCoins(c => c - 1);
     else if (stars > 0) setStars(s => s - 1);
     else fail = true;

     if (fail) { handleGameOver(internalId); return; }

     setErrorWordId(internalId);
     setTimeout(() => {
        setErrorWordId(null);
        setGrid(prev => prev.map(row => row.map(cell => 
          (cell.wordIds.across === internalId || cell.wordIds.down === internalId) && !cell.isLocked ? { ...cell, currentUserChar: "" } : cell
        )));
        setRecentlyErrored(p => p.filter(x => x !== internalId));
     }, 800);
  };

  const handleAbandon = () => {
    setGameState("ABANDON_ANIMATION");
  };

  const isDanger = coins === 0 && stars === 0 && !isGameOver && !isRevealedMode;

  // הגנה קריטית: המרת טקסט ההגדרה למחרוזת בטוחה (מונע White Screen)
  const clueText = String(selectedWord?.clue || "...");
  
  // חישוב גודל הפונט שיתאים בול למסגרת ללא גלילה
  let clueSizeClass = "text-lg sm:text-2xl leading-tight"; 
  if (clueText.length > 90) clueSizeClass = "text-[10px] sm:text-[13px] leading-tight";
  else if (clueText.length > 60) clueSizeClass = "text-[12px] sm:text-[15px] leading-tight";
  else if (clueText.length > 35) clueSizeClass = "text-[14px] sm:text-[18px] leading-snug";

  if (gameState === "START") {
    return (
      <AppWrapper bgClass="bg-[#049CD8]">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
          <h1 
             className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-yellow-400 tracking-wide" 
             style={{ WebkitTextStroke: '2px #b00' }}
          >
            הצילו! תשבץ
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold mb-10 drop-shadow-md text-white/90">
            בחרו את הגיבור.ה שלכם
          </h2>
          {isLoadingData ? ( <div className="text-2xl font-bold animate-pulse">טוען נתונים...</div> ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg md:max-w-2xl">
               {PLAYABLE_CHARS.map(char => (
                  <button key={char.id} onClick={() => { 
                     setPlayerObj(char); 
                     fetchPuzzleData(char); 
                  }}
                     className={`${char.color} border-b-8 border-black/40 rounded-[2rem] p-4 flex flex-col items-center justify-center hover:scale-105 active:translate-y-2 transition-all aspect-square shadow-xl hover:brightness-110 overflow-hidden`}>
                     <img src={char.imgSrc} alt={char.name} className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
                  </button>
               ))}
            </div>
          )}
        </div>
      </AppWrapper>
    );
  }

  const IntroScreen = ({ playerObj, onComplete }) => {
    const [showButton, setShowButton] = useState(false);
    useEffect(() => { const t = setTimeout(() => setShowButton(true), 2500); return () => clearTimeout(t); }, []);
    return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-6 text-center text-white relative h-full">
        <div className={`anim-intro ${showButton ? "opacity-50 blur-sm transition-all duration-1000" : ""}`}>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-400 mb-6">[סרטון אנימציה: החטיפה]</div>
            <div className="flex items-center justify-center gap-6 text-7xl sm:text-8xl md:text-9xl">
                <span>{playerObj?.emoji}</span><span>💔</span><span className="opacity-50">{playerObj?.partnerEmoji}</span>
            </div>
            <p className="mt-8 text-3xl md:text-4xl font-black text-yellow-400">אוי לא! {playerObj?.partnerName} נחטף/ה!</p>
        </div>
        {showButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 cursor-pointer w-full h-full" onClick={onComplete}>
                <button className="bg-red-600 text-white border-4 border-white text-2xl md:text-3xl font-black px-10 py-6 rounded-full hover:bg-red-500 animate-pulse shadow-[0_0_40px_rgba(255,0,0,0.6)]">
                    הקלק להתחלת המשחק
                </button>
            </div>
        )}
      </div>
    );
  };

  if (gameState === "INTRO") {
    return <AppWrapper bgClass="bg-black"><IntroScreen playerObj={playerObj} onComplete={() => setGameState("MAP")} /></AppWrapper>;
  }

  if (gameState === "ABANDON_ANIMATION") {
    return (
      <AppWrapper bgClass="bg-[#0a0a0a]">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white relative h-full">
          <div className="anim-intro opacity-100 transition-all duration-1000">
             <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-400 mb-6">
                 [סרטון אנימציה: נטישה]
             </div>
             <div className="flex flex-col items-center justify-center mt-10">
                 <div className="text-8xl sm:text-9xl anim-sink">
                    {playerObj?.partnerEmoji}
                 </div>
                 <div className="text-6xl sm:text-7xl -mt-10 animate-pulse opacity-80">
                    🌊🌊🌊
                 </div>
             </div>
             <p className="mt-12 text-3xl md:text-5xl font-black text-red-500">
                 אוי לא! עזבת את המסע...
             </p>
             <p className="mt-4 text-xl md:text-3xl font-bold text-gray-300">
                 {playerObj?.partnerName} נשאר/ה מאחור!
             </p>
          </div>
        </div>
      </AppWrapper>
    );
  }

  if (gameState === "LEVEL_CELEBRATION") {
      return (
         <AppWrapper bgClass="bg-[#43B047]">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="bg-white/20 backdrop-blur-md rounded-[3rem] p-10 shadow-2xl flex flex-col items-center border-4 border-white/40">
                  <div className="text-8xl animate-dance drop-shadow-lg">{playerObj?.emoji}</div>
                  <h2 className="text-5xl font-black mt-8">כל הכבוד!</h2>
                  <p className="text-2xl font-bold mt-4">סיימת את התשבץ!</p>
              </div>
            </div>
         </AppWrapper>
      );
  }

  if (gameState === "PARTNER_HELP") {
      return (
         <AppWrapper bgClass="bg-red-900">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="border-8 border-red-500 bg-black/50 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center">
                  <div className="text-8xl animate-pulse drop-shadow-lg">{playerObj?.partnerEmoji}</div>
                  <h2 className="text-6xl font-black mt-8 animate-bounce">הצילו!</h2>
                  <p className="text-2xl font-bold text-red-200 mt-4">אני עדיין כלוא/ה...</p>
              </div>
            </div>
         </AppWrapper>
      );
  }

  if (gameState === "BOSS_PRE_VIDEO") {
      return (
         <AppWrapper bgClass="bg-black">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="anim-boss flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-400 mb-8">[סרטון: {playerObj?.name} לכאורה הציל את {playerObj?.partnerName}...]</div>
                  <div className="flex gap-6 text-8xl mb-8"><span>{playerObj?.emoji}</span><span>{playerObj?.partnerEmoji}</span></div>
                  <div className="text-red-600 text-6xl md:text-8xl animate-pulse mb-6">🐢🔥</div>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-400 leading-relaxed max-w-lg">
                     אבל אז הגיח באוזר המרושע מתוך הלבה!
                  </p>
                  <button onClick={() => setGameState("BOSS_STAGE")}
                     className="mt-10 bg-red-700 text-white border-4 border-red-400 text-3xl md:text-4xl font-black px-10 py-5 rounded-full hover:bg-red-600 transition-colors">
                     אל הקרב הסופי!
                  </button>
              </div>
            </div>
         </AppWrapper>
      );
  }

  if (gameState === "BOSS_STAGE") {
      return (
         <AppWrapper bgClass="bg-red-900 border-[16px] border-red-950">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="text-8xl md:text-9xl mb-8">🌋🐢</div>
              <h2 className="text-5xl md:text-6xl font-black text-yellow-500 mb-6">שלב בוס סודי!</h2>
              <p className="text-2xl md:text-3xl font-bold text-red-200 mb-10 max-w-lg leading-relaxed">
                 הקרב הגדול מול באוזר מתחיל עכשיו! עזור ל{playerObj?.name} להביס אותו אחת ולתמיד.
              </p>
              <button onClick={() => setGameState("BOSS_VICTORY_VIDEO")}
                 className="bg-yellow-500 text-black border-4 border-yellow-200 text-3xl md:text-4xl font-black px-10 py-5 rounded-full hover:bg-yellow-400 transition-colors">
                 הבס את באוזר!
              </button>
            </div>
         </AppWrapper>
      );
  }

  if (gameState === "BOSS_VICTORY_VIDEO") {
      return (
         <AppWrapper bgClass="bg-black">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="anim-intro flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-400 mb-8">[סרטון: סוף טוב {playerObj?.name} הציל את {playerObj?.partnerName}]</div>
                  <div className="flex gap-6 text-9xl animate-bounce"><span>{playerObj?.emoji}</span><span>❤️</span><span>{playerObj?.partnerEmoji}</span></div>
                  <p className="text-4xl font-black text-green-400 mt-10">הם מאוחדים שוב!</p>
                  <button onClick={() => setGameState("FINAL_VICTORY")}
                     className="mt-10 bg-white text-black text-2xl font-black px-8 py-4 rounded-full">סיום</button>
              </div>
            </div>
         </AppWrapper>
      );
  }

  if (gameState === "FINAL_VICTORY") {
      return (
         <AppWrapper bgClass="bg-[#049CD8]">
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div className="bg-white border-8 border-yellow-400 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl">
                  <h2 className="text-5xl font-black text-[#E52521] mb-6">ניצחון!</h2>
                  <p className="text-2xl font-bold text-gray-700 mb-10">הצלת את {playerObj?.partnerName} והבסת את באוזר!</p>
                  <button onClick={() => { setUnlockedLevels(0); setCurrentLevelIndex(0); setGameState("START"); }} 
                      className="w-full bg-[#43B047] text-white border-b-4 border-[#2B732E] rounded-2xl py-4 font-black text-2xl hover:bg-green-500 transition-colors">
                      שחק שוב מהתחלה
                  </button>
              </div>
            </div>
         </AppWrapper>
      );
  }

  if (gameState === "MAP") {
     const mapPath = "M 80 15 C 50 15, 25 20, 25 30 C 25 40, 70 35, 70 45 C 70 55, 25 55, 25 65 C 25 75, 70 70, 70 80 C 70 90, 25 85, 25 95";
     return (
       <AppWrapper bgClass="bg-green-200 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" dir="ltr">
          <header dir="rtl" className="bg-orange-600 text-white p-4 sm:p-5 border-b-8 border-orange-800 shadow-lg shrink-0 flex justify-between items-center z-20 relative">
            <h1 className="text-2xl sm:text-3xl font-black uppercase">מפת העולמות</h1>
            <button onClick={handleAbandon} className="p-2 sm:p-3 bg-red-700 rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-md border-2 border-orange-300">
               <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </header>
          <div className="flex-1 relative w-full h-full overflow-hidden">
             <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none">
                 <path d={mapPath} fill="none" stroke="#8B4513" strokeWidth="1.2" strokeDasharray="3, 3" />
             </svg>
             {activeLevels.map((level, idx) => {
                const pos = MAP_POSITIONS[idx];
                const isUnlocked = idx <= unlockedLevels;
                return (
                   <div key={idx} className="absolute flex flex-col items-center" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', direction: 'rtl' }}>
                      {idx === unlockedLevels && ( <div className="text-6xl absolute -top-14 animate-bounce-slow z-20">{playerObj?.emoji}</div> )}
                      {idx === activeLevels.length - 1 && ( <div className="absolute right-[115%] top-1/2 -translate-y-1/2 animate-pulse text-5xl opacity-80 z-10">{playerObj?.partnerEmoji}</div> )}
                      <button onClick={() => isUnlocked && loadPuzzle(idx)}
                         className={`w-16 h-16 sm:w-20 rounded-full border-4 shadow-xl flex items-center justify-center text-4xl transition-all overflow-hidden
                         ${isUnlocked ? "bg-white border-green-600 hover:scale-105 active:scale-95" : "bg-gray-300 border-gray-500 opacity-50 grayscale cursor-not-allowed"}`}>
                         {level.iconSrc ? (
                            <img src={level.iconSrc} alt={level.enTheme} className="w-full h-full object-cover" />
                         ) : (
                            level.icon
                         )}
                      </button>
                   </div>
                );
             })}
          </div>
       </AppWrapper>
     );
  }

  const getCellClasses = (r, c, cell) => {
    if (!cell.isActive) return "bg-[#111] border border-gray-800 cursor-default opacity-90 w-full h-full"; 
    
    let classes = "crossword-letter flex items-center justify-center font-black text-xl sm:text-3xl lg:text-4xl border transition-all duration-150 relative w-full h-full ";
    const isPartOfSelectedWord = selectedWord && (cell.wordIds.across === selectedWord.internalId || cell.wordIds.down === selectedWord.internalId);
    
    const isFailedCell = errorWordId && isGameOver && (cell.wordIds.across === errorWordId || cell.wordIds.down === errorWordId);
    const isError = errorWordId && !isGameOver && (cell.wordIds.across === errorWordId || cell.wordIds.down === errorWordId);
    const isSuccess = successWordId && (cell.wordIds.across === successWordId || cell.wordIds.down === successWordId);

    if (isSuccess) classes += "bg-[#9ae08f] border-green-700 text-black animate-pulse z-20 ";
    else if (isError) classes += "bg-red-500 border-red-800 text-white z-20 ";
    else if (isFailedCell) classes += "bg-white border-gray-400 text-green-600 "; 
    else if (cell.isLocked && cell.currentUserChar) classes += "bg-[#9ae08f] text-black border-green-800 "; 
    else if (isPartOfSelectedWord && !isRevealedMode) classes += "bg-yellow-100 border-yellow-500 text-black z-10 ";
    else classes += "bg-white border-gray-400 text-black ";

    return classes;
  };

  return (
    <AppWrapper 
      bgClass={generatedLevelData?.bg} 
      bgImage={generatedLevelData?.bgSrc} 
      dir="rtl"
      onMove={handlePointerMove} onUp={handlePointerUp} onLeave={handlePointerUp}
    >
      <div 
        onClick={() => !showLevelUI && setShowLevelUI(true)}
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${showLevelUI ? "opacity-0 pointer-events-none z-0" : "opacity-100 z-50 cursor-pointer"}`}
      >
         {generatedLevelData?.iconSrc ? (
            <img src={generatedLevelData.iconSrc} alt="Icon" className="w-32 h-32 mb-4 drop-shadow-2xl rounded-full border-4 border-white/50" />
         ) : (
            <span className="text-8xl drop-shadow-2xl mb-4">{generatedLevelData?.icon}</span>
         )}
         <h2 className="text-4xl sm:text-5xl font-black text-white text-center drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] px-4" style={{ WebkitTextStroke: '1.5px black' }}>
            {generatedLevelData?.theme}
         </h2>
         <h3 className="text-xl sm:text-2xl font-bold text-gray-200 mt-2 drop-shadow-md tracking-widest">{generatedLevelData?.enTheme}</h3>
      </div>

      <div 
        className="absolute inset-0 flex flex-col w-full h-full z-10"
        style={{ 
            opacity: showLevelUI ? 1 : 0, 
            visibility: showLevelUI ? 'visible' : 'hidden',
            transition: 'opacity 1s ease-in-out' 
        }}
      >
          <button onClick={() => setGameState("LEVEL_CELEBRATION")} className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 text-xs z-[100] rounded font-bold shadow-md hover:bg-purple-500">DEV: Skip</button>

          {dragState.active && (
            <div className="crossword-letter fixed pointer-events-none z-[100] bg-white border-4 border-gray-800 flex items-center justify-center font-black shadow-2xl opacity-90 scale-110 anim-drag rounded-lg"
              style={{ left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", width: '3.5rem', height: '3.5rem', fontSize: '2rem' }}>{dragState.char}</div>
          )}

          <header dir="rtl" className={`bg-black/80 text-white p-4 border-b-4 border-black shadow-lg flex justify-between items-center shrink-0 z-20 backdrop-blur-md ${isGameOver ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
               <button onClick={() => setGameState("MAP")} disabled={isGameOver} className="p-2 sm:p-3 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-50 shrink-0">
                  <ArrowLeft className="w-5 h-5 sm:w-7 sm:h-7" />
               </button>
               <div className="flex flex-col truncate">
                 <h1 className="text-sm sm:text-xl md:text-2xl font-black tracking-wider uppercase truncate leading-tight">
                   {generatedLevelData?.theme} {generatedLevelData?.icon}
                 </h1>
                 <span className="text-xs sm:text-sm text-gray-300 font-bold truncate tracking-widest">{generatedLevelData?.enTheme}</span>
               </div>
            </div>
            <button onClick={handleAbandon} disabled={isGameOver} className="p-2 sm:p-3 bg-red-600/90 rounded-full hover:bg-red-500 active:scale-95 transition-all ml-2 shrink-0 border-2 border-white/20 disabled:opacity-50">
               <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </header>

          <div dir="rtl" className={`px-4 sm:px-5 shrink-0 flex flex-col gap-2 mt-4 sm:mt-6 mb-2 relative z-10`}>
            {/* מסגרת ההגדרה מוגנת לחלוטין בפני גלילה עם חישוב פונט קפדני */}
            <div className={`bg-white/95 backdrop-blur-sm p-2 sm:p-4 rounded-xl border-4 shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex flex-col items-center justify-center transition-colors duration-300 h-24 sm:h-28 ${(isDanger && !isGameOver) ? "border-red-600" : "border-black"}`}>
              <div className="flex-1 min-w-0 w-full h-full flex flex-col justify-center items-center overflow-hidden">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1 flex items-center justify-center truncate shrink-0 w-full">
                  {selectedWord && selectedWord.isStarWord && <span className="text-[#E59400] ml-1 font-black tracking-wide">⭐ מילת כוכב!</span>}
                  {selectedWord ? wordNumbers[selectedWord.internalId] : ""} {selectedWord && selectedWord.direction === "across" ? "מאוזן" : "מאונך"}
                </p>
                <p className={`font-black text-gray-900 text-center w-full px-1 ${clueSizeClass}`}>
                  {clueText}
                </p>
              </div>
            </div>

            {isGameOver && (
              <div className="bg-red-700 border-2 border-red-900 rounded-lg p-2 flex items-center justify-between shadow-lg text-white animate-bounce-slow">
                   <span className="text-sm sm:text-base font-black px-2">פסלת! נגמרו הנסיונות 💀</span>
                   <button onClick={() => setGameState("MAP")} className="bg-white text-red-800 font-black px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-md active:scale-95">חזור למפה</button>
              </div>
            )}
          </div>

          <div className="flex-1 w-full flex items-center justify-center p-2 min-h-0 relative z-10" dir="rtl">
            <div className={`bg-black/95 backdrop-blur-sm p-1.5 rounded-xl shadow-2xl border-4 sm:border-8 flex aspect-square h-full max-h-[85vw] sm:max-h-[400px] transition-colors duration-300 ${isDanger || isGameOver ? "border-red-600" : "border-black"} ${isGameOver ? "animate-pulse" : ""}`}>
              <div className="grid relative w-full h-full flex-1" style={{ gap: "0", gridTemplateRows: `repeat(${generatedLevelData?.gridSize?.rows || 8}, minmax(0, 1fr))`, gridTemplateColumns: `repeat(${generatedLevelData?.gridSize?.cols || 8}, minmax(0, 1fr))` }}>
                {grid.map((row, r) => row.map((cell, c) => {
                    const isShowingDirectionChoice = directionChoice && directionChoice.r === r && directionChoice.c === c;
                    
                    return (
                      <div key={`${r}-${c}`} data-row={r} data-col={c} onClick={() => handleCellClick(r, c)}
                        className={`${getCellClasses(r, c, cell)} ${isShowingDirectionChoice ? "!z-[60]" : ""}`}>
                        {cell.cellNumber && <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[7px] sm:text-[9px] font-normal text-black/80 z-30 leading-none pointer-events-none">{cell.cellNumber}</span>}
                        
                        {isShowingDirectionChoice && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 sm:gap-2 bg-white/95 p-1.5 sm:p-2 rounded-xl shadow-2xl z-[70] border-2 border-black scale-110 sm:scale-125 cursor-default">
                            <button onClick={(e) => { e.stopPropagation(); selectDirection(directionChoice.across); }} className="bg-[#E52521] text-white p-1 sm:p-2 rounded-lg active:scale-95 border-b-2 border-red-800"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); selectDirection(directionChoice.down); }} className="bg-[#43B047] text-white p-1 sm:p-2 rounded-lg active:scale-95 border-b-2 border-green-800"><ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                          </div>
                        )}
                        <span className="relative z-10 pointer-events-none">{cell.currentUserChar}</span>
                      </div>
                    );
                }))}
              </div>
            </div>
          </div>

          {!isGameOver && (
            <div dir="rtl" className="p-3 sm:p-5 pb-8 sm:pb-10 shrink-0 relative z-20">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
                {Array.from({ length: stars }).map((_, i) => (
                  <button key={`s-${i}`} onClick={buyWordHint} className="active:scale-95 transition-transform hover:scale-110 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    <Star className="w-12 h-12 sm:w-14 sm:h-14" />
                  </button>
                ))}
                {Array.from({ length: coins }).map((_, i) => (
                  <button key={`c-${i}`} onClick={buyLetterHint} className="active:scale-95 transition-transform hover:scale-110 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    <Coins className="w-12 h-12 sm:w-14 sm:h-14" />
                  </button>
                ))}
              </div>

              <div className="max-w-3xl mx-auto flex flex-col gap-2 sm:gap-3" dir="ltr">
                {HEBREW_KEYBOARD.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-1.5 sm:gap-2.5">
                    {row.map((key) => (
                      <div key={key} onPointerDown={(e) => handlePointerDown(e, key)}
                        className={`crossword-letter bg-white text-gray-800 border-gray-300 w-10 sm:w-12 md:w-14 h-12 sm:h-14 md:h-16 rounded-xl font-black text-xl sm:text-2xl md:text-3xl border-b-4 border-2 flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing ${dragState.char === key ? "opacity-50 bg-gray-200" : "opacity-100"}`}>
                        {key}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </AppWrapper>
  );
}
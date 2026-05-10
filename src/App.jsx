import React, { useState, useEffect, useRef } from 'react';

// --- מערכת סאונד מובנית: צלילי UI מודרניים ורכים ---
let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playSound = (name) => {
  try {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);

    if (name === 'transition') {
      const osc = audioCtx.createOscillator();
      osc.connect(gain);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (name === 'correct') {
      const osc = audioCtx.createOscillator();
      osc.connect(gain);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); 
      osc.frequency.setValueAtTime(659.25, t + 0.1); 
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.02); 
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (name === 'wrong') {
      const osc = audioCtx.createOscillator();
      osc.connect(gain);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    } else if (name === 'bossHit') {
      const duration = 0.8; 
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine'; 
      subOsc.frequency.setValueAtTime(150, t); 
      subOsc.frequency.exponentialRampToValueAtTime(40, t + 0.1); 
      subGain.gain.setValueAtTime(0, t);
      subGain.gain.linearRampToValueAtTime(1.0, t + 0.02); 
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4); 
      subOsc.connect(subGain);
      subGain.connect(audioCtx.destination);
      subOsc.start(t);
      subOsc.stop(t + duration);

      const bufferSize = audioCtx.sampleRate * duration; 
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; 
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2500, t); 
      noiseFilter.frequency.exponentialRampToValueAtTime(100, t + duration); 
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(0.5, t + 0.05); 
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration); 
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(t);

    } else if (name === 'playerHit') {
      const osc = audioCtx.createOscillator();
      osc.connect(gain);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.setValueAtTime(150, t + 0.1);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
};

const AutoFitText = ({ text }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const resizeText = () => {
      if (!container || !textEl) return;
      textEl.style.fontSize = '12px';
      const cHeight = container.clientHeight;
      const cWidth = container.clientWidth;
      if (cHeight === 0 || cWidth === 0) return;
      let min = 14; 
      let max = 45; 
      let best = min;
      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        textEl.style.fontSize = mid + 'px';
        if (textEl.scrollHeight <= cHeight && textEl.scrollWidth <= cWidth) {
          best = mid;
          min = mid + 1; 
        } else {
          max = mid - 1; 
        }
      }
      textEl.style.fontSize = best + 'px';
    };

    const observer = new ResizeObserver(() => requestAnimationFrame(resizeText));
    observer.observe(container);
    resizeText(); 
    const t1 = setTimeout(resizeText, 50);
    const t2 = setTimeout(resizeText, 300);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [text]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden px-2">
      <div ref={textRef} className="text-center font-black text-gray-900 leading-tight w-full break-words">
        {text}
      </div>
    </div>
  );
};

const MOCK_BOSS_QUESTIONS = [
  { clue: "מכשיר חשמלי שמוציא אוויר חם לייבוש שיער", correctAnswer: "פן", wrongAnswer: "מזגן" },
  { clue: "כלי עבודה שמסובב ומחזק ברגים למקומם", correctAnswer: "מברג", wrongAnswer: "פטיש" },
  { clue: "החלק העליון של הבית המגן מפני גשם", correctAnswer: "גג", wrongAnswer: "רצפה" },
  { clue: "פרי הדר כתום עשיר בויטמין סי", correctAnswer: "תפוז", wrongAnswer: "תפוח" },
  { clue: "הבירה של מדינת ישראל", correctAnswer: "ירושלים", wrongAnswer: "תל אביב" }
];

const Coins = ({ className }) => (
  <img src="./assets/stories/coin.png" alt="מטבע" className={`object-contain ${className}`} />
);

const Star = ({ className }) => (
  <img src="./assets/stories/star.png" alt="כוכב" className={`object-contain ${className}`} />
);

const ArrowLeft = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>;
const ArrowDown = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>;
const HomeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

const AppWrapper = ({ children, bgClass = "bg-black", bgImage, dir = "rtl", onMove, onUp, onLeave }) => (
  <div className="fixed inset-0 w-full h-full bg-[#111] flex justify-center sm:items-center overflow-hidden z-0">
    <style>{`
      @font-face { font-family: 'MankalaFont'; src: url('./assets/Fonts/it_mankala.ttf') format('truetype'); }
      html, body { overscroll-behavior-y: none; touch-action: none; overflow: hidden; background-color: #111; margin: 0; padding: 0; font-family: 'MankalaFont', sans-serif; }
      .crossword-letter { font-family: 'MankalaFont', Arial, sans-serif !important; }
      
      @keyframes introVideoAnim { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      .anim-intro { animation: introVideoAnim 2s ease-out forwards; }
      @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .animate-bounce-slow { animation: bounce-slow 1.5s infinite; }
      @keyframes dance { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-20px) rotate(-10deg); } 50% { transform: translateY(0) rotate(0deg); } 75% { transform: translateY(-20px) rotate(10deg); } }
      .animate-dance { animation: dance 0.6s infinite; }
      @keyframes bossRevealAnim { 0% { transform: scale(0.1) rotate(180deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
      .anim-boss { animation: bossRevealAnim 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      @keyframes sink { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(100px); opacity: 0; } }
      .anim-sink { animation: sink 3s ease-in forwards; }
      @keyframes float-drag { 0% { transform: translate(-50%, -50%) scale(1.1); } 50% { transform: translate(-50%, -50%) scale(1.3); } 100% { transform: translate(-50%, -50%) scale(1.1); } }
      .anim-drag { animation: float-drag 0.6s infinite; }
      @keyframes boss-hit { 0%, 100% { filter: drop-shadow(0 0 0 red); transform: scale(1); } 50% { filter: drop-shadow(0 0 50px red) sepia(1) saturate(5); transform: scale(1.2) translateY(-30px); } }
      .anim-boss-hit { animation: boss-hit 0.6s ease-in-out; }
      
      @keyframes throw-correct-from-right { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(-72px, -75vh) scale(0) rotate(1080deg); opacity: 0; } }
      @keyframes throw-correct-from-left { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(72px, -75vh) scale(0) rotate(1080deg); opacity: 0; } }
      .anim-throw-correct-left { animation: throw-correct-from-right 0.6s ease-in forwards; z-index: 50; }
      .anim-throw-correct-right { animation: throw-correct-from-left 0.6s ease-in forwards; z-index: 50; }
      
      @keyframes block-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-15px); } 75% { transform: translateX(15px); } }
      .anim-wrong-shake { animation: block-shake 0.4s ease-in-out; background-color: #ef4444 !important; }
      @keyframes player-hit { 0%, 100% { opacity: 1; filter: grayscale(0); } 50% { opacity: 0.4; filter: grayscale(1); transform: translateX(-8px); } }
      .anim-player-hit { animation: player-hit 0.2s ease-in-out infinite; }
      @keyframes boss-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
      .anim-boss-float { animation: boss-float 3s ease-in-out infinite; }
      @keyframes phaseTransition { 0%, 100% { transform: translateX(0); filter: brightness(1); } 20%, 60% { transform: translateX(-10px); filter: brightness(1.5) sepia(1) hue-rotate(-50deg); } 40%, 80% { transform: translateX(10px); filter: brightness(1.5) sepia(1) hue-rotate(-50deg); } }
      .anim-phase-transition { animation: phaseTransition 1.5s ease-in-out; }

      @keyframes dropIn { 0% { transform: translateY(-200px) scale(2); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      .anim-drop-in { animation: dropIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
      @keyframes shakeScreen { 0%, 100% { transform: translateX(0) translateY(0); } 20%, 60% { transform: translateX(-15px) translateY(-5px) rotate(-2deg); } 40%, 80% { transform: translateX(15px) translateY(5px) rotate(2deg); } }
      .anim-shake-screen { animation: shakeScreen 0.6s ease-in-out; }
      @keyframes fadeOutUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-150px) scale(0.5) rotate(180deg); opacity: 0; } }
      .anim-fade-out-up { animation: fadeOutUp 1s ease-in forwards; }
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
    { 
        id: "mario", 
        imgSrc: "./assets/ui/mario.png", 
        partnerImgSrc: "./assets/ui/peach.png", 
        name: "מריו", 
        partnerName: "פיץ'", 
        color: "bg-red-500", 
        introVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach_opening_scene.mp4",
        quitImgSrc: "./assets/stories/mario-peach/mario_quits.png",
        outroVideoSrc: "./assets/animations/Mario_saves_peach/mario peach closing scene.mp4"
    }
];

const CHARACTER_WORLDS = {
  mario: [
    { theme: "מישורי הפטריות", iconSrc: "./assets/map/mario-peach/Mushroom_Plains_icon.png", bgSrc: "./assets/stories/mario-peach/Mushroom_Plains.png", transitionVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach_scene_1.mp4" },
    { theme: "מערת האגם הנסתר", iconSrc: "./assets/map/mario-peach/Hidden_Lagoon_Cave_icon.png", bgSrc: "./assets/stories/mario-peach/Hidden_Lagoon_Cave.png", transitionVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach_scene_2.mp4" },
    { theme: "יער הענקים", iconSrc: "./assets/map/mario-peach/Giant_Tree_Forest_icon.png", bgSrc: "./assets/stories/mario-peach/Giant_Tree_Forest.png", transitionVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach_scene_3.mp4" },
    { theme: "מפרץ הפיראטים", iconSrc: "./assets/map/mario-peach/Pirate_Cove_icon.png", bgSrc: "./assets/stories/mario-peach/Pirate_Cove.png", transitionVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach_scene_4.mp4" },
    { theme: "אחוזת הרוחות", iconSrc: "./assets/map/mario-peach/Haunted_Mansion_icon.png", bgSrc: "./assets/stories/mario-peach/Haunted_Mansion.png", transitionVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach-scene_5.mp4" },
    { theme: "ממלכת העננים הסוערת", iconSrc: "./assets/map/mario-peach/Stormy_Cloud_Kingdom_icon.png", bgSrc: "./assets/stories/mario-peach/Stormy_Cloud_Kingdom.png", transitionVideoSrc: "./assets/animations/Mario_saves_peach/mario-peach_scene_6.mp4" }
  ]
};

const MAP_POSITIONS = [ { x: 80, y: 15 }, { x: 25, y: 30 }, { x: 70, y: 45 }, { x: 25, y: 65 }, { x: 70, y: 80 }, { x: 25, y: 95 } ];
const HEBREW_KEYBOARD = [ ["ק", "ר", "א", "ט", "ו", "פ"], ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל"], ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת"] ];

const StoryIntro = ({ playerObj, onComplete }) => {
    const [videoFailed, setVideoFailed] = useState(false);
    const [phase, setPhase] = useState(0); 

    useEffect(() => {
        if (!playerObj?.introVideoSrc || videoFailed) {
            const t1 = setTimeout(() => setPhase(1), 2000); 
            const t2 = setTimeout(() => setPhase(2), 4500); 
            const t3 = setTimeout(() => setPhase(3), 6000); 
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [playerObj, videoFailed]);

    if (playerObj?.introVideoSrc && !videoFailed) {
        return (
            <AppWrapper bgClass="bg-black">
                <div onDoubleClick={onComplete} className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden cursor-pointer">
                    <video src={playerObj.introVideoSrc} autoPlay playsInline onEnded={onComplete} onError={() => setVideoFailed(true)} className="w-full h-full object-contain pointer-events-none" />
                </div>
            </AppWrapper>
        );
    }

    return (
        <AppWrapper bgClass="bg-black">
            <div onDoubleClick={onComplete} dir="rtl" className={`flex-1 flex flex-col items-center justify-center p-6 text-center text-white w-full h-full overflow-hidden transition-all duration-300 cursor-pointer ${phase === 1 ? 'anim-shake-screen bg-red-950/40' : 'bg-black'}`}>
                {phase === 0 && (
                    <div className="anim-intro flex flex-col items-center">
                        <div className="flex items-center justify-center gap-6 h-32 mb-8">
                            <img src={playerObj?.imgSrc} className="h-full object-contain" alt="Player" />
                            <span className="text-7xl animate-bounce">❤️</span>
                            <img src={playerObj?.partnerImgSrc} className="h-full object-contain" alt="Partner" />
                        </div>
                    </div>
                )}
                {phase === 1 && (
                    <div className="flex flex-col items-center w-full">
                        <div className="flex items-center justify-center gap-6 h-32 mb-8 relative w-full">
                            <img src={playerObj?.imgSrc} className="h-full object-contain z-10" alt="Player" />
                            <div className="absolute z-20 text-[10rem] anim-drop-in drop-shadow-[0_0_30px_red] top-[-40px]">🐢</div>
                            <img src={playerObj?.partnerImgSrc} className="h-full object-contain anim-fade-out-up z-10" alt="Partner" />
                        </div>
                    </div>
                )}
                {phase >= 2 && (
                    <div className="anim-intro flex flex-col items-center">
                        <div className="flex items-center justify-center gap-6 h-32 mb-8">
                            <img src={playerObj?.imgSrc} className="h-full object-contain" alt="Player" />
                            <span className="text-7xl animate-pulse">💔</span>
                            <div className="h-full opacity-0 w-24"></div>
                        </div>
                        {phase === 3 && (
                            <button onClick={onComplete} className="mt-8 bg-red-600 border-4 border-white text-2xl font-black px-10 py-5 rounded-full animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.6)] active:scale-95 transition-all">צא למסע ההצלה!</button>
                        )}
                    </div>
                )}
            </div>
        </AppWrapper>
    );
};

const BossBattleStage = ({ playerObj, questions, onWin }) => {
    const [totalHits, setTotalHits] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [battlePhase, setBattlePhase] = useState("IDLE");
    const [animatingBlock, setAnimatingBlock] = useState(null);
    const [shuffledPool, setShuffledPool] = useState([]);
    
    const bossPhase = totalHits < 3 ? 1 : totalHits < 6 ? 2 : 3;
    const bgMusicRef = useRef(null);

    useEffect(() => {
        const charName = playerObj?.id || 'mario';
        const partnerName = playerObj?.partnerImgSrc?.split('/').pop().replace('.png', '') || 'peach';
        const audioPath = `./assets/animations/Boss/${charName}-${partnerName}-boss_${bossPhase}.mp3`;
        
        if (bgMusicRef.current) bgMusicRef.current.pause();
        const audio = new Audio(audioPath);
        audio.loop = true;
        audio.volume = 0.5; 
        audio.play().catch(e => console.warn("Music play block (expected if no interaction):", e));
        bgMusicRef.current = audio;

        return () => { if (bgMusicRef.current) bgMusicRef.current.pause(); };
    }, [bossPhase, playerObj]);

    useEffect(() => {
        if (battlePhase === "SINKING" && bgMusicRef.current) bgMusicRef.current.pause();
    }, [battlePhase]);
    
    useEffect(() => {
        const pool = (questions && questions.length > 0) ? questions : MOCK_BOSS_QUESTIONS;
        setShuffledPool([...pool].sort(() => Math.random() - 0.5));
    }, [questions]);

    const currentQuestion = shuffledPool[currentIndex % (shuffledPool.length || 1)] || { clue: "טוען...", correctAnswer: "", wrongAnswer: "" };
    const [correctIsLeft, setCorrectIsLeft] = useState(Math.random() > 0.5);

    const handleBlockClick = (isCorrect, side) => {
        if (battlePhase !== "IDLE" || !currentQuestion.correctAnswer) return;
        setAnimatingBlock(side);
        
        if (isCorrect) {
            setBattlePhase("CORRECT_ANIM");
            playSound('correct');
            setTimeout(() => {
                setBattlePhase("BOSS_HIT");
                playSound('bossHit');
                setTotalHits(prev => {
                    const newHits = prev + 1;
                    if (newHits === 9) setTimeout(onWin, 600); 
                    else if (newHits === 3 || newHits === 6) { 
                        setTimeout(() => {
                            setBattlePhase("PHASE_TRANSITION");
                            setTimeout(() => {
                                setCurrentIndex(p => p + 1); 
                                setCorrectIsLeft(Math.random() > 0.5);
                                setBattlePhase("IDLE"); 
                                setAnimatingBlock(null); 
                            }, 1500); 
                        }, 600);
                    } else { 
                        setTimeout(() => { 
                            setCurrentIndex(p => p + 1); 
                            setCorrectIsLeft(Math.random() > 0.5);
                            setBattlePhase("IDLE"); 
                            setAnimatingBlock(null); 
                        }, 1000); 
                    }
                    return newHits;
                });
            }, 500);
        } else {
            setBattlePhase("WRONG_ANIM");
            playSound('wrong');
            setTimeout(() => { 
                setBattlePhase("PLAYER_HIT"); 
                playSound('playerHit');
                setTimeout(() => { 
                    setCurrentIndex(p => p + 1);
                    setCorrectIsLeft(Math.random() > 0.5);
                    setBattlePhase("IDLE"); 
                    setAnimatingBlock(null); 
                }, 800); 
            }, 500);
        }
    };

    let bowserImg = `./assets/boss/bowser_${bossPhase}.png`;
    const bossScale = bossPhase === 1 ? 1 : bossPhase === 2 ? 1.6 : 2.3;
    const bossTranslateY = bossPhase === 1 ? '0px' : bossPhase === 2 ? '15px' : '30px'; 
    const bossFilterClass = bossPhase === 1 ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' : bossPhase === 2 ? 'drop-shadow(0 0 25px orange)' : 'drop-shadow(0 0 40px red)';

    return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-between p-4 relative z-10">
            <div className={`mt-16 sm:mt-20 flex flex-col items-center z-10 ${battlePhase === "PHASE_TRANSITION" ? "anim-phase-transition" : "anim-boss-float"}`}>
                <div className="transition-all duration-1000 ease-in-out origin-top" style={{ transform: `scale(${bossScale}) translateY(${bossTranslateY})` }}>
                    <div className={`h-32 sm:h-40 ${battlePhase === "BOSS_HIT" ? "anim-boss-hit" : ""}`}>
                         <img src={bowserImg} alt="Bowser" className="h-full object-contain" style={{ filter: bossFilterClass, transition: 'filter 1s ease-in-out' }} />
                    </div>
                </div>
            </div>

            <div className={`bg-white/95 w-full max-w-sm p-4 rounded-xl border-4 border-red-800 shadow-2xl flex flex-col items-center justify-center h-28 sm:h-32 transition-opacity duration-300 relative z-50`}>
                <AutoFitText text={currentQuestion.clue} />
            </div>

            <div className="flex flex-col items-center gap-6 mb-4 w-full relative z-50">
                <div className={`flex justify-center gap-4 w-full`}>
                    <button onClick={() => handleBlockClick(correctIsLeft, 'left')} className={`bg-yellow-400 border-b-8 border-yellow-600 rounded-xl p-3 w-32 h-24 flex items-center justify-center shadow-lg font-black text-xl text-black active:translate-y-2 transition-all ${battlePhase === "CORRECT_ANIM" && animatingBlock === 'left' ? "anim-throw-correct-left" : ""} ${battlePhase === "WRONG_ANIM" && animatingBlock === 'left' ? "anim-wrong-shake" : ""}`}>
                        {correctIsLeft ? currentQuestion.correctAnswer : currentQuestion.wrongAnswer}
                    </button>
                    <button onClick={() => handleBlockClick(!correctIsLeft, 'right')} className={`bg-yellow-400 border-b-8 border-yellow-600 rounded-xl p-3 w-32 h-24 flex items-center justify-center shadow-lg font-black text-xl text-black active:translate-y-2 transition-all ${battlePhase === "CORRECT_ANIM" && animatingBlock === 'right' ? "anim-throw-correct-right" : ""} ${battlePhase === "WRONG_ANIM" && animatingBlock === 'right' ? "anim-wrong-shake" : ""}`}>
                        {!correctIsLeft ? currentQuestion.correctAnswer : currentQuestion.wrongAnswer}
                    </button>
                </div>
                <div className={`h-20 flex items-center justify-center drop-shadow-2xl ${battlePhase === "PLAYER_HIT" ? "anim-player-hit" : ""}`}>
                    <img src={playerObj?.imgSrc} alt={playerObj?.name} className="h-full object-contain" />
                </div>
            </div>
        </div>
    );
};

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
  const [isGameOver, setIsGameOver] = useState(false);
  const [dragState, setDragState] = useState({ active: false, char: "", x: 0, y: 0 });
  const [recentlyErrored, setRecentlyErrored] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showLevelUI, setShowLevelUI] = useState(false);
  const [bossQuestions, setBossQuestions] = useState([]);
  const [devMode, setDevMode] = useState(false);
  const [homeClicks, setHomeClicks] = useState(0);

  const TOTAL_JSON_FILES = 105; 

  const fetchPuzzleData = async (selectedChar) => {
    setIsLoadingData(true);
    const currentThemes = CHARACTER_WORLDS[selectedChar.id]; 
    try {
      let playedHistory = JSON.parse(localStorage.getItem('mario_played_jsons') || '[]');
      const chosenIds = [];
      for(let i = 0; i < 6; i++) {
        let availableIds = Array.from({length: TOTAL_JSON_FILES}, (_, idx) => idx + 1).filter(id => !playedHistory.includes(id) && !chosenIds.includes(id));
        if (availableIds.length === 0) { playedHistory = []; availableIds = Array.from({length: TOTAL_JSON_FILES}, (_, idx) => idx + 1).filter(id => !chosenIds.includes(id)); }
        const chosen = availableIds[Math.floor(Math.random() * availableIds.length)];
        chosenIds.push(chosen); playedHistory.push(chosen);
      }
      localStorage.setItem('mario_played_jsons', JSON.stringify(playedHistory));
      const levelsArray = [];
      for(let i = 0; i < chosenIds.length; i++) {
        const id = chosenIds[i];
        try {
          const response = await fetch(`./Crosswords_Jsons/Crossword_${id}.json?t=${new Date().getTime()}`);
          if(response.ok) {
            const data = await response.json();
            const levelData = Array.isArray(data) ? data[0] : data;
            levelsArray.push({ 
                ...levelData, 
                theme: currentThemes[i].theme, 
                iconSrc: currentThemes[i].iconSrc, 
                bgSrc: currentThemes[i].bgSrc,
                transitionVideoSrc: currentThemes[i].transitionVideoSrc
            });
          }
        } catch(err) { console.warn(err); }
      }
      setActiveLevels(levelsArray); setGameState("INTRO");
    } catch (err) { setGameState("INTRO"); } finally { setIsLoadingData(false); }
  };

  const fetchBossData = async () => {
    let dataLoaded = null;
    let errorReason = "סיבה לא ידועה";
    const pathsToTry = [`./Boss_Jsons/Boss_Questions.json?t=${new Date().getTime()}`, `./Boss_Jsons/Boss_Questions.json`];

    for (const path of pathsToTry) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                if (text && !text.trim().startsWith('<')) { 
                    try {
                        dataLoaded = JSON.parse(text);
                        break; 
                    } catch (parseError) {
                        try {
                            let cleanedText = text.replace(/^\uFEFF/, '').replace(/,\s*([\]}])/g, '$1'); 
                            cleanedText = cleanedText.replace(/([א-ת])"([א-ת])/g, (match, p1, p2) => p1 + '\\"' + p2);
                            dataLoaded = JSON.parse(cleanedText);
                            break;
                        } catch (parseError2) {
                            errorReason = `${parseError2.message}`;
                            continue;
                        }
                    }
                } else {
                    errorReason = "השרת החזיר קובץ HTML במקום טקסט.";
                }
            } else {
                errorReason = `שגיאה ${response.status}: הקובץ לא נמצא.`;
            }
        } catch (err) {
            errorReason = `החיבור לשרת נכשל.`;
        }
    }

    if (dataLoaded && Array.isArray(dataLoaded) && dataLoaded.length > 0) {
        const normalized = dataLoaded.map(item => {
            if (!item || typeof item !== 'object') return null;
            return {
                clue: item.clue || item.question || item["הגדרה"] || "שאלה חסרה",
                correctAnswer: item.correctAnswer || item.answer || item["תשובה נכונה"] || "נכון",
                wrongAnswer: item.wrongAnswer || item.fake_answer || item["תשובה שגויה"] || "שגוי"
            };
        }).filter(item => item && item.clue !== "שאלה חסרה");

        if (normalized.length > 0) {
            setBossQuestions(normalized);
            return;
        }
    }
    setBossQuestions([{ clue: `שגיאת JSON: ${errorReason}`, correctAnswer: "הבנתי", wrongAnswer: "אוף" }, ...MOCK_BOSS_QUESTIONS.slice(1)]);
  };

  const advanceToNextStage = () => {
      playSound('transition');
      const nextUnlocked = Math.max(unlockedLevels, currentLevelIndex + 1);
      setUnlockedLevels(nextUnlocked);
      if (nextUnlocked >= activeLevels.length) { 
          fetchBossData(); 
          setGameState("BOSS_STAGE"); 
      } else { 
          setGameState("MAP"); 
      }
  };

  useEffect(() => {
    let t;
    if (gameState === "LEVEL_COMPLETE") {
        t = setTimeout(() => {
            const completedLevelData = activeLevels[currentLevelIndex];
            if (completedLevelData?.transitionVideoSrc) {
                setGameState("TRANSITION_VIDEO");
            } else {
                advanceToNextStage();
            }
        }, 800);
    }
    return () => clearTimeout(t);
  }, [gameState, unlockedLevels, currentLevelIndex, activeLevels]);

  const handleDevSkip = () => setGameState("LEVEL_COMPLETE");

  const loadPuzzle = (index) => {
    playSound('transition');
    const rawData = activeLevels[index];
    if (!rawData) return;
    const data = JSON.parse(JSON.stringify(rawData));
    const rows = data.gridSize?.rows || 8, cols = data.gridSize?.cols || 8;
    data.words = (Array.isArray(data.words) ? data.words : []).map((w, idx) => ({ ...w, word: w.word || "", clue: w.clue || "...", internalId: `w_${idx}`, displayNum: w.id || idx + 1, startRow: w.startRow || 0, startCol: w.startCol || 0, direction: w.direction || "across" }));
    setGeneratedLevelData({ ...data, gridSize: { rows, cols } });
    const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => ({ isActive: false, isLocked: false, correctChar: "", currentUserChar: "", wordIds: { across: null, down: null }, cellNumber: null })));
    let wNums = {}, cellNums = {};
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const starters = data.words.filter(w => w.startRow === r && w.startCol === c);
            if (starters.length > 0) { cellNums[`${r}-${c}`] = starters[0].displayNum; starters.forEach(w => wNums[w.internalId] = w.displayNum); }
        }
    }
    setWordNumbers(wNums);
    data.words.forEach(wordObj => {
      for (let i = 0; i < wordObj.word.length; i++) {
        const r = wordObj.direction === "down" ? wordObj.startRow + i : wordObj.startRow;
        const c = wordObj.direction === "across" ? wordObj.startCol + i : wordObj.startCol;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          newGrid[r][c].isActive = true; newGrid[r][c].correctChar = wordObj.word[i];
          if (wordObj.direction === "across") newGrid[r][c].wordIds.across = wordObj.internalId;
          if (wordObj.direction === "down") newGrid[r][c].wordIds.down = wordObj.internalId;
          if (i === 0) newGrid[r][c].cellNumber = cellNums[`${r}-${c}`];
        }
      }
    });
    setCurrentLevelIndex(index); setGrid(newGrid); setSolvedWords([]); setIsGameOver(false); setDirectionChoice(null); setRecentlyErrored([]); setErrorWordId(null); setCoins(3); setStars(1); setShowLevelUI(false); 
    if (data.words.length > 0) setSelectedWord(data.words[0]);
    setGameState("PLAYING");
  };

  const handleGameOver = (failedWordId) => {
      setIsGameOver(true); setErrorWordId(failedWordId); 
      setGrid(prev => prev.map(row => row.map(cell => {
          if (!cell.isActive || cell.isLocked) return cell;
          return { ...cell, currentUserChar: cell.correctChar, isLocked: true };
      })));
  };

  const handleCellClick = (r, c) => {
    const cell = grid[r][c];
    if (!cell.isActive || isGameOver) return;
    
    if (cell.currentUserChar && !cell.isLocked) { 
        setGrid(prev => { const next = [...prev]; next[r][c] = { ...cell, currentUserChar: "" }; return next; }); 
        return; 
    }
    
    const wAcross = cell.wordIds.across ? generatedLevelData.words.find(w => w.internalId === cell.wordIds.across) : null;
    const wDown = cell.wordIds.down ? generatedLevelData.words.find(w => w.internalId === cell.wordIds.down) : null;
    const isAcrossSolved = wAcross && solvedWords.includes(wAcross.internalId);
    const isDownSolved = wDown && solvedWords.includes(wDown.internalId);

    if (wAcross && wDown) { 
        if (isAcrossSolved && !isDownSolved) { setSelectedWord(wDown); setDirectionChoice(null); }
        else if (isDownSolved && !isAcrossSolved) { setSelectedWord(wAcross); setDirectionChoice(null); }
        else if (isAcrossSolved && isDownSolved) { setSelectedWord(wAcross); setDirectionChoice(null); }
        else {
            if (directionChoice?.r === r && directionChoice?.c === c) setDirectionChoice(null); 
            else setDirectionChoice({ r, c, across: wAcross.internalId, down: wDown.internalId }); 
        }
    }
    else if (wAcross) { setSelectedWord(wAcross); setDirectionChoice(null); } 
    else if (wDown) { setSelectedWord(wDown); setDirectionChoice(null); }
  };

  const handlePointerDown = (e, char) => { if (isGameOver) return; e.preventDefault(); setDragState({ active: true, char, x: e.clientX, y: e.clientY }); setDirectionChoice(null); };
  const handlePointerMove = (e) => { if (!dragState.active) return; setDragState(prev => ({ ...prev, x: e.clientX, y: e.clientY })); };
  const handlePointerUp = (e) => {
    if (!dragState.active) return;
    const cellElement = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-row]");
    if (cellElement) {
      const r = parseInt(cellElement.getAttribute("data-row")), c = parseInt(cellElement.getAttribute("data-col"));
      if (grid[r][c].isActive && !grid[r][c].isLocked) {
          playSound('transition');
          const nextGrid = [...grid]; nextGrid[r][c] = { ...grid[r][c], currentUserChar: dragState.char }; setGrid(nextGrid);
          const wAcross = nextGrid[r][c].wordIds.across ? generatedLevelData.words.find(w => w.internalId === nextGrid[r][c].wordIds.across) : null;
          const wDown = nextGrid[r][c].wordIds.down ? generatedLevelData.words.find(w => w.internalId === nextGrid[r][c].wordIds.down) : null;
          [wAcross, wDown].forEach(w => {
              if(!w) return;
              let full = true, correct = true;
              for(let i=0; i<w.word.length; i++) {
                  const rr = w.direction === "down" ? w.startRow + i : w.startRow, cc = w.direction === "across" ? w.startCol + i : w.startCol;
                  if(!nextGrid[rr][cc].currentUserChar) full = false;
                  if(nextGrid[rr][cc].currentUserChar !== nextGrid[rr][cc].correctChar) correct = false;
              }
              if(full) {
                  if(correct && !solvedWords.includes(w.internalId)) {
                      playSound('correct');
                      setGrid(g => g.map(row => row.map(cell => (cell.wordIds.across === w.internalId || cell.wordIds.down === w.internalId) ? { ...cell, isLocked: true } : cell)));
                      setSuccessWordId(w.internalId); setSolvedWords(prev => { const n = [...prev, w.internalId]; if(n.length === generatedLevelData.words.length) setGameState("LEVEL_COMPLETE"); return n; });
                      setTimeout(() => setSuccessWordId(null), 1500);
                  } else if(!correct && !solvedWords.includes(w.internalId)) {
                      playSound('wrong');
                      if(recentlyErrored.includes(w.internalId)) return;
                      setRecentlyErrored(p => [...p, w.internalId]);
                      let fail = false;
                      if(coins > 0) setCoins(c => c-1); else if(stars > 0) setStars(s => s-1); else fail = true;
                      if(fail) handleGameOver(w.internalId);
                      else { setErrorWordId(w.internalId); setTimeout(() => { setErrorWordId(null); setGrid(g => g.map(row => row.map(cell => (cell.wordIds.across === w.internalId || cell.wordIds.down === w.internalId) && !cell.isLocked ? { ...cell, currentUserChar: "" } : cell))); setRecentlyErrored(p => p.filter(x => x !== w.internalId)); }, 800); }
                  }
              }
          });
      }
    }
    setDragState({ active: false, char: "", x: 0, y: 0 });
  };

  const buyLetterHint = () => {
    if (coins < 1 || isGameOver || !generatedLevelData) return;
    const unsolvedWordsList = generatedLevelData.words.filter(w => !solvedWords.includes(w.internalId));
    if (unsolvedWordsList.length === 0) return;
    const randomWord = unsolvedWordsList[Math.floor(Math.random() * unsolvedWordsList.length)];
    let availableCells = [];
    for (let i = 0; i < randomWord.word.length; i++) {
        const r = randomWord.direction === "down" ? randomWord.startRow + i : randomWord.startRow;
        const c = randomWord.direction === "across" ? randomWord.startCol + i : randomWord.startCol;
        if (!grid[r][c].isLocked) availableCells.push({r, c});
    }
    if (availableCells.length === 0) return;
    const { r, c } = availableCells[Math.floor(Math.random() * availableCells.length)];
    setCoins(prev => prev - 1);
    const nextGrid = [...grid];
    nextGrid[r][c] = { ...nextGrid[r][c], currentUserChar: nextGrid[r][c].correctChar, isLocked: true };
    setGrid(nextGrid);
    
    [nextGrid[r][c].wordIds.across, nextGrid[r][c].wordIds.down].forEach(wId => {
      if(!wId) return;
      const w = generatedLevelData.words.find(x => x.internalId === wId);
      let full = true, correct = true;
      for(let i=0; i<w.word.length; i++) {
          const rr = w.direction === "down" ? w.startRow + i : w.startRow, cc = w.direction === "across" ? w.startCol + i : w.startCol;
          if(!nextGrid[rr][cc].currentUserChar) full = false;
          if(nextGrid[rr][cc].currentUserChar !== nextGrid[rr][cc].correctChar) correct = false;
      }
      if(full && correct && !solvedWords.includes(wId)) {
          playSound('correct');
          setGrid(g => g.map(row => row.map(c => (c.wordIds.across === wId || c.wordIds.down === wId) ? { ...c, isLocked: true } : c)));
          setSuccessWordId(wId); setSolvedWords(prev => { const n = [...prev, wId]; if(n.length === generatedLevelData.words.length) setGameState("LEVEL_COMPLETE"); return n; });
          setTimeout(() => setSuccessWordId(null), 1500);
      }
    });
  };

  const buyWordHint = () => {
    if (stars < 1 || isGameOver || !generatedLevelData) return;
    const unsolvedWordsList = generatedLevelData.words.filter(w => !solvedWords.includes(w.internalId));
    if (unsolvedWordsList.length === 0) return;
    const randomWord = unsolvedWordsList[Math.floor(Math.random() * unsolvedWordsList.length)];
    setStars(prev => prev - 1);
    const nextGrid = [...grid];
    for (let i = 0; i < randomWord.word.length; i++) {
        const r = randomWord.direction === "down" ? randomWord.startRow + i : randomWord.startRow;
        const c = randomWord.direction === "across" ? randomWord.startCol + i : randomWord.startCol;
        nextGrid[r][c] = { ...nextGrid[r][c], currentUserChar: nextGrid[r][c].correctChar, isLocked: true };
    }
    setGrid(nextGrid);
    playSound('correct');
    setSolvedWords(prev => {
        const n = [...prev, randomWord.internalId];
        if(n.length === generatedLevelData.words.length) setGameState("LEVEL_COMPLETE");
        return n;
    });
    setSuccessWordId(randomWord.internalId);
    setTimeout(() => setSuccessWordId(null), 1500);
  };

  const selectDirection = (internalId) => {
    const wordObj = generatedLevelData.words.find(w => w.internalId === internalId);
    setSelectedWord(wordObj); setDirectionChoice(null); 
  };

  const finalLevelData = activeLevels[5] || (playerObj ? CHARACTER_WORLDS[playerObj.id][5] : null);
  const isDanger = coins === 0 && stars === 0 && !isGameOver;

  if (gameState === "START") return (
    <AppWrapper bgImage="./assets/ui/home_bacground.png">
      <div 
        className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white w-full h-full"
        onClick={() => {
            setHomeClicks(c => {
                const next = c + 1;
                if (next === 10) setDevMode(true);
                return next;
            });
        }}
      >
        {isLoadingData ? <div className="text-2xl animate-pulse">טוען...</div> : (
          <div className="flex flex-col items-center justify-center w-full mt-4">
             {PLAYABLE_CHARS.map(char => (
                <button key={char.id} onClick={(e) => { e.stopPropagation(); initAudio(); playSound('transition'); setPlayerObj(char); fetchPuzzleData(char); }}
                   className={`${char.color} border-b-8 border-black/40 rounded-[2rem] p-6 flex flex-col items-center hover:scale-110 active:translate-y-2 transition-all aspect-square w-48 sm:w-56 animate-bounce-slow shadow-2xl`}>
                   <img src={char.imgSrc} alt={char.name} className="w-full h-full object-contain drop-shadow-lg" />
                </button>
             ))}
          </div>
        )}
      </div>
    </AppWrapper>
  );

  if (gameState === "INTRO") return <StoryIntro playerObj={playerObj} onComplete={() => { playSound('transition'); setGameState("MAP"); }} />;

  if (gameState === "TRANSITION_VIDEO") {
      const transitionVideoSrc = activeLevels[currentLevelIndex]?.transitionVideoSrc;
      return (
        <AppWrapper bgClass="bg-black">
            <div onDoubleClick={advanceToNextStage} className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden cursor-pointer">
                <video src={transitionVideoSrc} autoPlay playsInline onEnded={advanceToNextStage} onError={advanceToNextStage} className="w-full h-full object-contain pointer-events-none" />
            </div>
        </AppWrapper>
      );
  }

  if (gameState === "ABANDON_ANIMATION") return (
      <div 
        className="fixed inset-0 w-full h-full bg-black flex items-center justify-center z-50 cursor-pointer"
        onClick={() => { playSound('transition'); setUnlockedLevels(0); setCurrentLevelIndex(0); setGameState("START"); }}
      >
         {playerObj?.quitImgSrc ? (
             <img src={playerObj.quitImgSrc} className="w-full h-full object-contain" alt="Quit" />
         ) : (
             <div className="text-white text-2xl font-bold">...</div>
         )}
      </div>
  );

  if (gameState === "MAP") return (
    <AppWrapper bgClass="bg-green-200 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" dir="ltr">
        {devMode && (
          <div className="absolute top-[80px] left-2 flex flex-col gap-2 z-[100]">
              <button onClick={handleDevSkip} className="bg-purple-600 text-white px-2 py-1 text-xs rounded font-bold shadow-md hover:bg-purple-500">DEV: Skip</button>
              <button onClick={() => { fetchBossData(); setGameState("BOSS_STAGE"); }} className="bg-red-600 text-white px-2 py-1 text-xs rounded font-bold shadow-md hover:bg-red-500">DEV: Boss</button>
          </div>
        )}

        <header dir="rtl" className="bg-orange-600 text-white p-4 border-b-8 border-orange-800 shadow-lg flex justify-end items-center z-20">
            <button onClick={() => { playSound('transition'); setGameState("ABANDON_ANIMATION"); }} className="p-2 bg-red-700 rounded-full border-2 border-white/20 active:scale-95 transition-all"><HomeIcon className="w-6 h-6" /></button>
        </header>
        <div className="flex-1 relative w-full h-full overflow-hidden">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none">
                <path d="M 80 15 C 50 15, 25 20, 25 30 C 25 40, 70 35, 70 45 C 70 55, 25 55, 25 65 C 25 75, 70 70, 70 80 C 70 90, 25 85, 25 95" fill="none" stroke="#8B4513" strokeWidth="1.2" strokeDasharray="3, 3" />
            </svg>
            
            {activeLevels.map((level, idx) => (
                <div key={idx} className="absolute" style={{ left: `${MAP_POSITIONS[idx].x}%`, top: `${MAP_POSITIONS[idx].y}%`, transform: 'translate(-50%, -50%)' }}>
                    {idx === unlockedLevels && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 animate-bounce-slow z-20 pointer-events-none">
                            <img src={playerObj?.imgSrc} className="w-full h-full object-contain drop-shadow-md" alt="Player" />
                        </div>
                    )}
                    {idx === activeLevels.length - 1 && (
                        <div className="absolute left-[110%] top-1/2 -translate-y-1/2 animate-pulse z-[100] pointer-events-none w-16 h-16 sm:w-20 sm:h-20">
                            <img src={playerObj?.partnerImgSrc} className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,1)]" alt="Partner" />
                        </div>
                    )}
                    <button onClick={() => idx <= unlockedLevels && loadPuzzle(idx)}
                        className={`w-16 h-16 sm:w-20 rounded-full border-4 shadow-xl overflow-hidden transition-all ${idx <= unlockedLevels ? "bg-white border-green-600 hover:scale-110 active:scale-95" : "bg-gray-300 border-gray-500 opacity-50 grayscale cursor-not-allowed"}`}>
                        <img src={level.iconSrc} className="w-full h-full object-cover" alt="World Icon" />
                    </button>
                </div>
            ))}
        </div>
    </AppWrapper>
  );

  if (gameState === "BOSS_STAGE") return (
     <AppWrapper bgImage={finalLevelData?.bgSrc}>
         <div className="flex-1 w-full h-full bg-red-950/40 backdrop-blur-sm">
            <BossBattleStage playerObj={playerObj} questions={bossQuestions} onWin={() => setGameState("BOSS_VICTORY_VIDEO")} />
         </div>
     </AppWrapper>
  );

  if (gameState === "BOSS_VICTORY_VIDEO") {
      const handleGameComplete = () => {
          playSound('transition');
          setUnlockedLevels(0);
          setCurrentLevelIndex(0);
          setGameState("START");
      };

      if (playerObj?.outroVideoSrc) {
          return (
              <AppWrapper bgClass="bg-black">
                  <div onDoubleClick={handleGameComplete} className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden cursor-pointer">
                      <video src={playerObj.outroVideoSrc} autoPlay playsInline onEnded={handleGameComplete} onError={handleGameComplete} className="w-full h-full object-contain pointer-events-none" />
                  </div>
              </AppWrapper>
          );
      }
      handleGameComplete();
      return null;
  }

  return (
    <AppWrapper bgImage={generatedLevelData?.bgSrc} dir="rtl" onMove={handlePointerMove} onUp={handlePointerUp} onLeave={handlePointerUp}>
      {dragState.active && (
        <div className="fixed pointer-events-none z-[200] bg-white border-4 border-gray-800 flex items-center justify-center font-black shadow-2xl rounded-lg anim-drag"
          style={{ left: dragState.x, top: dragState.y, width: '3.5rem', height: '3.5rem', fontSize: '2rem' }}>{dragState.char}</div>
      )}

      {!showLevelUI ? (
        <div onClick={() => setShowLevelUI(true)} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 cursor-pointer animate-in fade-in duration-500">
           <img src={generatedLevelData?.iconSrc} alt="Level Icon" className="w-32 h-32 mb-4 drop-shadow-2xl rounded-full border-4 border-white/50 object-cover" />
        </div>
      ) : (
      <div className="absolute inset-0 flex flex-col w-full h-full z-10 overflow-hidden">
          {devMode && (
            <div className="absolute top-[80px] left-2 flex flex-col gap-2 z-[100]">
              <button onClick={handleDevSkip} className="bg-purple-600 text-white px-2 py-1 text-xs rounded font-bold shadow-md hover:bg-purple-500">DEV: Skip</button>
              <button onClick={() => { fetchBossData(); setGameState("BOSS_STAGE"); }} className="bg-red-600 text-white px-2 py-1 text-xs rounded font-bold shadow-md hover:bg-red-500">DEV: Boss</button>
            </div>
          )}

          <header className={`bg-black/80 text-white p-4 border-b-4 border-black flex justify-between items-center shrink-0 z-20 backdrop-blur-md ${isGameOver ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-4">
               <button onClick={() => { playSound('transition'); setGameState("MAP"); }} disabled={isGameOver} className="p-2 bg-white/20 rounded-full active:scale-95 transition-all"><ArrowLeft className="w-6 h-6" /></button>
            </div>
            <button onClick={() => { playSound('transition'); setGameState("ABANDON_ANIMATION"); }} className="p-2 bg-red-600/90 rounded-full active:scale-95 border-2 border-white/10 transition-all"><HomeIcon className="w-6 h-6" /></button>
          </header>

          <div className="px-4 mt-6 mb-2 z-10 flex flex-col gap-2 shrink-0">
            <div className={`bg-white/95 p-2 rounded-xl border-4 shadow-[4px_4px_0_black] flex flex-col items-center h-28 transition-all duration-500 ${isDanger ? "border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse" : "border-black"}`}>
                <div className="flex-1 w-full overflow-hidden">
                    <AutoFitText text={selectedWord?.clue || "..."} />
                </div>
            </div>
            {isGameOver && <div className="w-full flex justify-center mt-1 z-20"><span className="bg-red-700 text-white border-2 border-red-900 rounded-lg px-4 py-1 font-black animate-pulse shadow-lg text-sm sm:text-base uppercase tracking-wider">פסלת! נגמרו הנסיונות 💀</span></div>}
          </div>

          <div className="flex-1 flex items-center justify-center p-2 relative z-10 min-h-0 overflow-hidden">
            <div className={`w-full max-w-full aspect-square bg-black/90 p-1.5 rounded-xl shadow-2xl border-4 sm:border-8 transition-all duration-500 ${isDanger || isGameOver ? "border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.7)]" : "border-black"}`}>
              <div className="grid w-full h-full" style={{ gridTemplateRows: 'repeat(8, 1fr)', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1px' }}>
                {grid.map((row, r) => row.map((cell, c) => {
                    const isShowingDirectionChoice = directionChoice && directionChoice.r === r && directionChoice.c === c;
                    const isPartOfSelection = selectedWord && (cell.wordIds.across === selectedWord.internalId || cell.wordIds.down === selectedWord.internalId);
                    const isSuccess = successWordId && (cell.wordIds.across === successWordId || cell.wordIds.down === successWordId);
                    const isError = errorWordId && (cell.wordIds.across === errorWordId || cell.wordIds.down === errorWordId);
                    let bg = "bg-white";
                    if (!cell.isActive) bg = "bg-[#111] border-gray-800";
                    else if (isSuccess) bg = "bg-green-400";
                    else if (isError) bg = "bg-red-500";
                    else if (cell.isLocked) bg = "bg-[#9ae08f]";
                    else if (isPartOfSelection) bg = "bg-yellow-100 border-yellow-500";
                    return (
                      <div key={`${r}-${c}`} data-row={r} data-col={c} onClick={() => handleCellClick(r, c)}
                        className={`w-full h-full flex items-center justify-center font-black border relative ${bg} ${isShowingDirectionChoice ? "!z-[60]" : ""}`}>
                        {cell.cellNumber && <span className="absolute top-0.5 right-0.5 text-[8px] font-normal text-black/70 pointer-events-none leading-none">{cell.cellNumber}</span>}
                        {isShowingDirectionChoice && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 bg-white p-2 rounded-xl shadow-2xl z-[70] border-2 border-black scale-110">
                            <button onClick={(e) => { e.stopPropagation(); selectDirection(directionChoice.across); }} className="bg-red-500 text-white p-1 rounded active:scale-95 transition-all"><ArrowLeft /></button>
                            <button onClick={(e) => { e.stopPropagation(); selectDirection(directionChoice.down); }} className="bg-green-500 text-white p-1 rounded active:scale-95 transition-all"><ArrowDown /></button>
                          </div>
                        )}
                        <span className="crossword-letter text-lg sm:text-2xl text-black">{cell.currentUserChar || (cell.isLocked ? cell.correctChar : "")}</span>
                      </div>
                    );
                }))}
              </div>
            </div>
          </div>

          {isGameOver ? (
             <div className="p-4 flex justify-center items-center z-20 h-40 shrink-0">
               <button onClick={() => { playSound('transition'); setGameState("MAP"); }} className="bg-white text-red-800 font-black px-8 py-3 rounded-full border-b-4 border-gray-300 text-lg shadow-xl active:translate-y-1 transition-all">חזור למפה</button>
             </div>
          ) : (
            <div dir="rtl" className="p-2 pb-8 shrink-0 relative z-20 h-40 flex flex-col justify-end w-full max-w-[450px] mx-auto">
              <div className="flex justify-center gap-6 mb-2">
                <div className="flex gap-2 w-[40px] justify-center">
                   {Array.from({ length: 1 }).map((_, i) => (
                    <button key={`s-${i}`} onClick={buyWordHint} className={`active:scale-95 drop-shadow-md transition-all ${i < stars ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      <Star className="w-10 h-10 fill-[#FBD000] text-[#E59400]" />
                    </button>
                   ))}
                </div>
                <div className="flex gap-2 w-[136px] justify-center">
                   {Array.from({ length: 3 }).map((_, i) => (
                    <button key={`c-${i}`} onClick={buyLetterHint} className={`active:scale-95 drop-shadow-md transition-all ${i < coins ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      <Coins className="w-10 h-10" />
                    </button>
                   ))}
                </div>
              </div>
              <div dir="ltr" className="w-full flex flex-col gap-1.5 px-1">
                {HEBREW_KEYBOARD.map((row, idx) => (
                  <div key={idx} className="flex justify-center gap-1 sm:gap-2">
                    {row.map(key => (
                      <div key={key} onPointerDown={(e) => handlePointerDown(e, key)}
                        className={`crossword-letter bg-white border-gray-300 w-10 sm:w-12 h-11 sm:h-13 rounded-xl font-black text-xl border-b-4 border-2 flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-colors active:bg-gray-100 ${dragState.char === key ? "opacity-50" : ""}`}>{key}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
      )}
    </AppWrapper>
  );
}
import { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import './App.css';
import { Heart, Zap, Sparkles } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, gameover, win
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(1);
  const [sonicScreamReady, setSonicScreamReady] = useState(false);

  const audioRefs = useRef(null);

  useEffect(() => {
    audioRefs.current = {
      bgMusic: new Audio('/BackgroundBubbles.mp3'),
      missionBegin: new Audio('/MissionBegin.mp3'),
      winMusic: new Audio('/PrettiestGirl.mp3')
    };
    
    audioRefs.current.bgMusic.loop = true;
    audioRefs.current.bgMusic.volume = 0.25;
    audioRefs.current.missionBegin.volume = 0.3;
    audioRefs.current.winMusic.volume = 0.48; // Boosted again by 20% for an even louder Sonic Scream

    return () => {
      audioRefs.current.bgMusic.pause();
      audioRefs.current.missionBegin.pause();
      audioRefs.current.winMusic.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioRefs.current) return;
    const refs = audioRefs.current;

    if (gameState === 'playing') {
      refs.winMusic.pause();
      refs.winMusic.currentTime = 0;
      
      refs.missionBegin.currentTime = 0;
      refs.missionBegin.play().catch(e => console.log("Audio play prevented:", e));
      
      refs.bgMusic.play().catch(e => console.log("Audio play prevented:", e));
    } else {
      refs.bgMusic.pause();
      refs.bgMusic.currentTime = 0;
    }

    if (gameState === 'win') {
      refs.winMusic.currentTime = 0;
      refs.winMusic.play().catch(e => console.log("Audio play prevented:", e));
    }
  }, [gameState]);

  useEffect(() => {
    const handleSonicScreamAudio = () => {
      if (audioRefs.current) {
        audioRefs.current.winMusic.currentTime = 0;
        audioRefs.current.winMusic.play().catch(e => console.log("Audio play prevented:", e));
      }
    };
    window.addEventListener('trigger-sonic-scream', handleSonicScreamAudio);
    return () => window.removeEventListener('trigger-sonic-scream', handleSonicScreamAudio);
  }, []);
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setRound(1);
    setSonicScreamReady(false);
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
  }, []);

  const handleWin = useCallback(() => {
    setGameState('win');
  }, []);

  return (
    <div className="app-container">
      {gameState === 'playing' && (
        <div className="ui-layer">
          <div className="top-bar">
            <div className="stats">
              <div className="stat-pill">Round {round} / 12</div>
              <div className="stat-pill">Score: {score}</div>
              <div className="lives">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`heart ${i < lives ? 'filled' : 'empty'}`}
                    fill={i < lives ? '#ff6b81' : 'transparent'}
                    color={i < lives ? '#ff6b81' : '#a4b0be'}
                    size={28}
                  />
                ))}
              </div>
            </div>
            {sonicScreamReady && (
              <button 
                className="sonic-button" 
                id="sonic-btn"
                onClick={(e) => {
                  e.currentTarget.blur(); // remove focus so spacebar doesn't trigger click again
                  window.dispatchEvent(new Event('trigger-sonic-scream'));
                }}
              >
                <Zap fill="#fbc531" color="#fbc531" />
                SONIC SCREAM! (Space)
              </button>
            )}
          </div>
        </div>
      )}

      {gameState === 'start' && (
        <div className="overlay menu">
          <div className="menu-card">
            <h1>Bubbles' Bubble-Pop Adventure</h1>
            <p className="subtitle">Help Bubbles rescue the animals!</p>
            <div className="instructions">
              <p>🐾 <strong>Click</strong> falling animals to bubble them so they float up to safety!</p>
              <p>🛡️ <strong>Drag</strong> your mouse to create a shield and push away Mojo Jojo's drones.</p>
              <p>🤖 <strong>Drones</strong> will pop bubbled animals!</p>
              <p>💔 Don't let the animals fall to the ground!</p>
            </div>
            <button className="btn-primary" onClick={startGame}>
              <Sparkles className="icon" /> Play Now
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="overlay menu">
          <div className="menu-card">
            <h1>Game Over!</h1>
            <p className="subtitle">Oh no! Mojo Jojo's drones got the best of you.</p>
            <p>Final Score: {score}</p>
            <p>Reached Round: {round}</p>
            <button className="btn-primary" onClick={startGame}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {gameState === 'win' && (
        <div className="overlay menu">
          <div className="menu-card win-card">
            <h1>You Won!</h1>
            <p className="subtitle">YAY! You saved all the animals with Bubbles and Octi!</p>
            <div className="win-image-placeholder">🐙 👧🏼</div>
            <p>Final Score: {score}</p>
            <button className="btn-primary" onClick={startGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'gameover' || gameState === 'win') && (
        <GameCanvas 
          gameState={gameState}
          setScore={setScore}
          setLives={setLives}
          lives={lives}
          round={round}
          setRound={setRound}
          onGameOver={handleGameOver}
          onWin={handleWin}
          sonicScreamReady={sonicScreamReady}
          setSonicScreamReady={setSonicScreamReady}
        />
      )}
    </div>
  );
}

export default App;

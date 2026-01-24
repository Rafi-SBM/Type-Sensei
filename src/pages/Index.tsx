import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/typing-game/Header';
import ModeSelector from '@/components/typing-game/ModeSelector';
import QuoteDisplay from '@/components/typing-game/QuoteDisplay';
import TypingInput from '@/components/typing-game/TypingInput';
import StatsBar from '@/components/typing-game/StatsBar';
import ResultsPanel from '@/components/typing-game/ResultsPanel';
import { getMoreWords } from '@/data/quotes';
import { generateTextAsync, generateTextLocal } from '@/lib/generator';

type Level = 'easy' | 'medium' | 'hard';
type GameState = 'idle' | 'playing' | 'finished';

const Index: React.FC = () => {
  const [level, setLevel] = useState<Level>('medium');
  const [duration, setDuration] = useState<number>(30);
  const [text, setText] = useState<string>('');
  const [typedChars, setTypedChars] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [bestWpm, setBestWpm] = useState<number>(0);
  const [consecutivePlayCount, setConsecutivePlayCount] = useState<number>(0);

  // Load best WPM from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('typingGameBestWpm');
    if (stored) {
      setBestWpm(parseInt(stored, 10));
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (gameState === 'idle') {
      // Force new generation after 2 consecutive plays of the same mode
      const forceNew = consecutivePlayCount >= 2;

      // Immediately show a locally-generated passage to avoid blank UI
      setText(generateTextLocal(level, 100));

      (async () => {
        try {
          const t = await generateTextAsync(level, 100);
          if (mounted && t) setText(t);
        } catch (e) {
          console.warn('Async generation failed (background)', e);
        }
      })();
      setTimeLeft(duration);
    }
    return () => {
      mounted = false;
    };
  }, [level, gameState, duration, consecutivePlayCount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && typedChars.length > text.length - 100) {
      setText((prev) => prev + getMoreWords(level, 50));
    }
  }, [typedChars.length, text.length, gameState, level]);

  const stats = useMemo(() => {
    let correctChars = 0;
    let wrongChars = 0;

    for (let i = 0; i < typedChars.length; i++) {
      if (typedChars[i] === text[i]) {
        correctChars++;
      } else {
        wrongChars++;
      }
    }

    const totalTyped = typedChars.length;
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);
    const minutes = elapsedTime / 60 || 1 / 60;
    const wpm = Math.round((correctChars / 5) / minutes);

    return { correctChars, wrongChars, totalTyped, accuracy, wpm };
  }, [typedChars, text, elapsedTime]);

  // Handle starting the game
  const handleStart = useCallback(() => {
    if (gameState === 'idle') {
      setGameState('playing');
    }
  }, [gameState]);

  const handleTypingChange = useCallback((value: string) => {
    setTypedChars(value);
  }, []);

  const handleLevelChange = useCallback((newLevel: Level) => {
    if (gameState === 'idle') {
      if (newLevel !== level) {
        setConsecutivePlayCount(0);
      }
      setLevel(newLevel);
    }
  }, [gameState, level]);

  const handleDurationChange = useCallback((newDuration: number) => {
    if (gameState === 'idle') {
      setDuration(newDuration);
      setTimeLeft(newDuration);
    }
  }, [gameState]);

  const handlePlayAgain = useCallback(() => {
    if (stats.wpm > bestWpm) {
      setBestWpm(stats.wpm);
      localStorage.setItem('typingGameBestWpm', stats.wpm.toString());
    }

    setConsecutivePlayCount((prev) => prev + 1);

    setTypedChars('');
    setTimeLeft(duration);
    setElapsedTime(0);
    setGameState('idle');
    setText(generateTextLocal(level, 100));
  }, [stats.wpm, bestWpm, level, duration]);

  useEffect(() => {
    if (gameState === 'finished' && stats.wpm > bestWpm) {
      setBestWpm(stats.wpm);
      localStorage.setItem('typingGameBestWpm', stats.wpm.toString());
    }
  }, [gameState, stats.wpm, bestWpm]);

  return (
    <div className="min-h-screen py-8">
      <div className="typing-container">
        <Header />
        
        <ModeSelector
          currentLevel={level}
          currentDuration={duration}
          onLevelChange={handleLevelChange}
          onDurationChange={handleDurationChange}
          disabled={gameState !== 'idle'}
        />

        <QuoteDisplay
          quote={text}
          typedChars={typedChars}
          currentIndex={typedChars.length}
        />

        <TypingInput
          value={typedChars}
          onChange={handleTypingChange}
          onStart={handleStart}
          disabled={gameState === 'finished'}
          isStarted={gameState === 'playing'}
        />

        <StatsBar
          timeLeft={timeLeft}
          correctChars={stats.correctChars}
          wrongChars={stats.wrongChars}
          totalTyped={stats.totalTyped}
          elapsedTime={elapsedTime}
          isPlaying={gameState === 'playing'}
        />

        {gameState === 'finished' && (
          <ResultsPanel
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            correctChars={stats.correctChars}
            errors={stats.wrongChars}
            bestWpm={Math.max(bestWpm, stats.wpm)}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

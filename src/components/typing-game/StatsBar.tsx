import React, { useMemo } from 'react';

interface StatsBarProps {
  timeLeft: number;
  correctChars: number;
  wrongChars: number;
  totalTyped: number;
  elapsedTime: number;
  isPlaying: boolean;
}

// StatsBar - shows live game statistics
const StatsBar: React.FC<StatsBarProps> = React.memo(({ 
  timeLeft, 
  correctChars, 
  wrongChars, 
  totalTyped,
  elapsedTime,
  isPlaying
}) => {
  // Calculate live WPM and accuracy
  const liveStats = useMemo(() => {
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);
    const minutes = elapsedTime / 60 || 1 / 60;
    const wpm = Math.round((correctChars / 5) / minutes);
    
    return { accuracy, wpm };
  }, [correctChars, totalTyped, elapsedTime]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value stat-time">{formatTime(timeLeft)}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">wpm</span>
        <span className="stat-value">{isPlaying ? liveStats.wpm : '--'}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">acc</span>
        <span className="stat-value">{isPlaying ? `${liveStats.accuracy}%` : '--'}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">chars</span>
        <span className="stat-value">
          <span className="text-correct">{correctChars}</span>
          /
          <span className="text-wrong">{wrongChars}</span>
        </span>
      </div>
    </div>
  );
});

StatsBar.displayName = 'StatsBar';

export default StatsBar;

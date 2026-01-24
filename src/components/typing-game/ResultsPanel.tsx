import React from 'react';

interface ResultsPanelProps {
  wpm: number;
  accuracy: number;
  correctChars: number;
  errors: number;
  bestWpm: number;
  onPlayAgain: () => void;
}

// ResultsPanel - shows final stats after game ends
const ResultsPanel: React.FC<ResultsPanelProps> = React.memo(({ 
  wpm, 
  accuracy, 
  correctChars, 
  errors, 
  bestWpm,
  onPlayAgain 
}) => {
  const isNewBest = wpm >= bestWpm && wpm > 0;

  return (
    <div className="results-card mt-6">
      <h2 className="results-title">
        {isNewBest ? 'New Best Score!' : 'Results'}
      </h2>
      
      <div className="results-grid">
        <div className="result-item">
          <div className="result-label">WPM</div>
          <div className="result-value">{wpm}</div>
        </div>
        <div className="result-item">
          <div className="result-label">Accuracy</div>
          <div className="result-value">{accuracy}%</div>
        </div>
        <div className="result-item">
          <div className="result-label">Characters</div>
          <div className="result-value">{correctChars}</div>
        </div>
        <div className="result-item">
          <div className="result-label">Errors</div>
          <div className="result-value">{errors}</div>
        </div>
      </div>

      <div className="best-score">
        <div className="result-label">Best WPM</div>
        <div className="result-value">{bestWpm}</div>
      </div>

      <button onClick={onPlayAgain} className="play-btn">
        Play Again
      </button>
    </div>
  );
});

ResultsPanel.displayName = 'ResultsPanel';

export default ResultsPanel;

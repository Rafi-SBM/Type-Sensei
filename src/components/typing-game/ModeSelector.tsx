import React, { useState, useRef, useEffect } from 'react';

type Level = 'easy' | 'medium' | 'hard';

interface ModeSelectorProps {
  currentLevel: Level;
  currentDuration: number;
  onLevelChange: (level: Level) => void;
  onDurationChange: (duration: number) => void;
  disabled: boolean;
}

// ModeSelector - combined difficulty and time duration selection with custom time
const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({ 
  currentLevel,
  currentDuration,
  onLevelChange,
  onDurationChange,
  disabled 
}) => {
  const levels: Level[] = ['easy', 'medium', 'hard'];
  const presetDurations = [15, 30, 60, 120];
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isPreset = presetDurations.includes(currentDuration);

  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const getDurationLabel = (d: number) => {
    if (d >= 60) return `${d / 60}m`;
    return `${d}s`;
  };

  const handleCustomClick = () => {
    if (disabled) return;
    setShowCustomInput(true);
    // Show current duration in minutes for custom input
    if (isPreset) setCustomValue('');
    else {
      const minutes = Math.ceil(currentDuration / 60);
      setCustomValue(minutes.toString());
    }
  };

  const handleCustomSubmit = () => {
    // customValue is entered in minutes; convert to seconds
    const mins = parseInt(customValue, 10);
    if (!Number.isNaN(mins) && mins >= 1 && mins <= 180) {
      const seconds = mins * 60;
      onDurationChange(seconds);
    }
    setShowCustomInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
    }
  };

  return (
    <div className="mode-selector mb-6">
      {/* Time Duration Row */}
      <div className="flex justify-center items-center gap-2 mb-3">
        <span className="mode-label">time</span>
        {presetDurations.map((duration) => (
          <button
            key={duration}
            onClick={() => {
              onDurationChange(duration);
              setShowCustomInput(false);
            }}
            disabled={disabled}
            className={`mode-btn ${
              currentDuration === duration && !showCustomInput ? 'mode-btn-active' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {getDurationLabel(duration)}
          </button>
        ))}
        
        {/* Custom time button/input */}
        {showCustomInput ? (
          <div className="custom-time-input">
            <input
              ref={inputRef}
              type="number"
              min="1"
              max="180"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onBlur={handleCustomSubmit}
              onKeyDown={handleKeyDown}
              placeholder="min"
              className="time-input"
              disabled={disabled}
            />
          </div>
        ) : (
          <button
            onClick={handleCustomClick}
            disabled={disabled}
            className={`mode-btn ${
              !isPreset ? 'mode-btn-active' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!isPreset ? getDurationLabel(currentDuration) : 'custom'}
          </button>
        )}
      </div>

      {/* Difficulty Row */}
      <div className="flex justify-center gap-2">
        <span className="mode-label">words</span>
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            disabled={disabled}
            className={`mode-btn capitalize ${
              currentLevel === level ? 'mode-btn-active' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
});

ModeSelector.displayName = 'ModeSelector';

export default ModeSelector;

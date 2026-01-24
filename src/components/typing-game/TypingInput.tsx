import React, { useRef, useEffect } from 'react';

interface TypingInputProps {
  value: string;
  onChange: (value: string) => void;
  onStart: () => void;
  disabled: boolean;
  isStarted: boolean;
}

// TypingInput - the main input field for typing
const TypingInput: React.FC<TypingInputProps> = React.memo(({ 
  value, 
  onChange, 
  onStart,
  disabled,
  isStarted
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused while game is active
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Start the game on first keystroke
    if (!isStarted && newValue.length > 0) {
      onStart();
    }
    
    onChange(newValue);
  };

  // Handle click to refocus
  const handleContainerClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="mb-4" onClick={handleContainerClick}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={disabled ? "Game over" : "Start typing here..."}
        className="typing-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
});

TypingInput.displayName = 'TypingInput';

export default TypingInput;


import React, { useMemo, useRef, useEffect } from 'react';

interface QuoteDisplayProps {
  quote: string;
  typedChars: string;
  currentIndex: number;
}

// QuoteDisplay - shows the text with character highlighting and auto-scroll
const QuoteDisplay: React.FC<QuoteDisplayProps> = React.memo(({ 
  quote, 
  typedChars, 
  currentIndex 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to keep current character visible
  useEffect(() => {
    if (currentCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentChar = currentCharRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const charRect = currentChar.getBoundingClientRect();
      
      // Check if current character is below visible area
      if (charRect.top > containerRect.bottom - 40) {
        container.scrollTop += charRect.top - containerRect.top - 60;
      }
    }
  }, [currentIndex]);

  // Memoize the character array to avoid recalculating on every render
  const characters = useMemo(() => {
    return quote.split('').map((char, index) => {
      let className = 'char';
      
      if (index < typedChars.length) {
        // Character has been typed
        if (typedChars[index] === char) {
          className += ' char-correct';
        } else {
          className += ' char-wrong';
        }
      }
      
      if (index === currentIndex) {
        className += ' char-current';
      }
      
      return { char, className, index };
    });
  }, [quote, typedChars, currentIndex]);

  return (
    <div ref={containerRef} className="quote-box mb-4">
      {characters.map(({ char, className, index }) => (
        <span 
          key={index} 
          className={className}
          ref={index === currentIndex ? currentCharRef : null}
        >
          {char}
        </span>
      ))}
    </div>
  );
});

QuoteDisplay.displayName = 'QuoteDisplay';

export default QuoteDisplay;

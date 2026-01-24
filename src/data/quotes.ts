// Easy: Common, short words (2-5 letters)
export const easyWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so",
  "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "into",
  "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after",
  "use", "two", "how", "our", "work", "first", "well", "way", "even", "new",
  "want", "give", "day", "most", "us", "is", "are", "was", "were", "been",
  "has", "had", "did", "does", "may", "cat", "dog", "run", "sun", "fun",
  "big", "red", "blue", "tree", "home", "car", "book", "door", "hand", "eye",
  "man", "boy", "girl", "old", "yes", "help", "ask", "need", "try", "let",
  "put", "end", "why", "too", "any", "same", "tell", "boy", "own", "still"
];

// Medium: Common words with moderate length (5-9 letters)
export const mediumWords = [
  "about", "above", "across", "address", "almost", "always", "another", "answer", "around", "asked",
  "because", "become", "before", "behind", "believe", "between", "beyond", "brought", "building", "business",
  "called", "cannot", "center", "change", "children", "city", "close", "company", "control", "country",
  "course", "during", "early", "enough", "every", "example", "family", "father", "feeling", "figure",
  "finally", "follow", "found", "friend", "getting", "great", "group", "happened", "having", "himself",
  "history", "house", "however", "hundred", "important", "interest", "itself", "language", "large", "later",
  "learn", "letter", "level", "light", "little", "living", "making", "matter", "maybe", "members",
  "million", "minutes", "money", "month", "morning", "mother", "moving", "music", "myself", "national",
  "never", "night", "nothing", "number", "office", "often", "order", "others", "outside", "paper",
  "parents", "party", "perhaps", "person", "picture", "place", "please", "point", "possible", "power",
  "present", "problem", "program", "public", "question", "rather", "reason", "remember", "result", "right",
  "running", "school", "second", "seems", "sense", "service", "several", "should", "simple", "social",
  "someone", "special", "started", "states", "still", "strong", "system", "taking", "things", "thought",
  "through", "together", "turned", "under", "united", "until", "using", "water", "without", "woman"
];

// Hard: Complex, longer words (9+ letters)
export const hardWords = [
  "absolutely", "achievement", "acknowledge", "acquisition", "administration", "advertisement", "approximately", "architecture", "assassination", "authentication",
  "bibliography", "bureaucratic", "cardiovascular", "characteristic", "circumstances", "communication", "comprehensive", "concentration", "configuration", "consciousness",
  "consequences", "considerable", "constitutional", "contemporary", "controversial", "correspondence", "demonstration", "determination", "developmental", "differentiation",
  "discrimination", "distinguished", "documentation", "electromagnetic", "entertainment", "environmental", "establishment", "extraordinary", "fundamentally", "globalization",
  "grandchildren", "headquarters", "hypothesis", "identification", "illustration", "implementation", "independently", "infrastructure", "institutional", "instrumentation",
  "intellectual", "international", "interpretation", "investigation", "jurisdiction", "knowledgeable", "manufacturing", "mathematician", "mediterranean", "microprocessor",
  "misunderstanding", "multiplication", "neighborhoods", "nevertheless", "notwithstanding", "observation", "opportunities", "organizational", "overwhelming", "parliamentary",
  "participation", "philosophical", "photographers", "possibilities", "predominantly", "presentations", "professionals", "pronunciation", "psychological", "qualifications",
  "questionnaire", "recommendations", "refrigerator", "rehabilitation", "relationships", "representative", "responsibilities", "revolutionary", "satisfactory", "semiconductor",
  "simultaneously", "sophisticated", "specifications", "straightforward", "superintendent", "telecommunications", "thermodynamics", "transformation", "transportation", "undergraduate",
  "unfortunately", "unprecedented", "vulnerability", "collaboration", "compatibility", "confidential", "congratulations", "controversial", "accomplishment", "acknowledgement"
];

// Common punctuation patterns to make text feel natural
const punctuationPatterns = [
  { pattern: ',', frequency: 0.08 },
  { pattern: '.', frequency: 0.05 },
];

// Generate adaptive text based on difficulty
export function generateText(level: 'easy' | 'medium' | 'hard', wordCount: number = 50): string {
  const pools = {
    easy: easyWords,
    medium: mediumWords,
    hard: hardWords,
  };
  
  const pool = pools[level];
  const words: string[] = [];
  let sentenceLength = 0;
  const targetSentenceLength = level === 'easy' ? 6 : level === 'medium' ? 10 : 14;
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    let word = pool[randomIndex];
    
    // Capitalize first word of sentence
    if (sentenceLength === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    sentenceLength++;
    
    // Add punctuation naturally
    if (sentenceLength >= targetSentenceLength - 2) {
      const shouldEndSentence = Math.random() < 0.4 || sentenceLength > targetSentenceLength + 2;
      if (shouldEndSentence) {
        word += '.';
        sentenceLength = 0;
      } else if (Math.random() < 0.15) {
        word += ',';
      }
    } else if (sentenceLength > 3 && Math.random() < 0.08) {
      word += ',';
    }
    
    words.push(word);
  }
  
  // Ensure text ends with period
  const lastWord = words[words.length - 1];
  if (!lastWord.endsWith('.')) {
    words[words.length - 1] = lastWord.replace(/[,]$/, '') + '.';
  }
  
  return words.join(' ');
}

// Get more words to append when user is running low
export function getMoreWords(level: 'easy' | 'medium' | 'hard', count: number = 30): string {
  return ' ' + generateText(level, count);
}

// Legacy exports for compatibility
export const easyQuotes = easyWords;
export const mediumQuotes = mediumWords;
export const hardQuotes = hardWords;

export function getRandomQuote(level: 'easy' | 'medium' | 'hard'): string {
  return generateText(level, 50);
}

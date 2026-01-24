import { easyWords, mediumWords, hardWords, getMoreWords as localGetMoreWords } from '@/data/quotes';
import { generateWithOpenRouter } from './openrouter';

const USE_REMOTE = Boolean(import.meta.env.VITE_OPENROUTER_KEY);

const randInt = (max: number) => Math.floor(Math.random() * max);
const sample = (pool: string[], n: number) => Array.from({ length: n }, () => pool[randInt(pool.length)]);

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Local deterministic generator that creates coherent, meaningful passages
function localMeaningfulGenerate(level: 'easy' | 'medium' | 'hard', wordCount: number) {
  const easyPassages = [
    'Modern web development has changed dramatically. Developers can now build applications that run everywhere. Mobile phones and tablets are everywhere in our daily lives. The internet connects people across the globe instantly. Technology shapes how we work, learn, and communicate with one another.',
    'Cloud computing has revolutionized how companies store data. Businesses no longer need expensive servers in their offices. Instead, they use remote servers on the internet. This saves money and makes systems more reliable. Teams can work together from different locations easily.',
    'Artificial intelligence is becoming more common each day. AI helps doctors diagnose diseases early. It powers recommendation systems on popular websites. Virtual assistants understand spoken language and respond to questions. The future will bring even more AI innovations.',
    'Web design focuses on making sites easy to use. Good design means clean layouts and simple navigation. Users should find what they need quickly. Mobile-friendly design is essential today. Colors and fonts should work together harmoniously.',
    'Remote work gives people flexibility and freedom. Many companies now allow employees to work from home. Teams communicate through video calls and instant messaging. This approach saves commute time and increases productivity. Work-life balance improves for many professionals.',
  ];

  const mediumPassages = [
    'Microservices architecture breaks applications into smaller, independent services. Each service handles a specific business function. Services communicate through APIs using standardized protocols. This approach improves scalability and allows independent deployment. Development teams can work on different services simultaneously. Docker containers package services with all dependencies included.',
    'Progressive web applications provide native app experiences through browsers. Users can install them like mobile apps without app stores. PWAs work offline by caching essential resources locally. Push notifications keep users engaged and informed. Service workers handle background synchronization tasks automatically.',
    'DevOps practices streamline continuous integration and deployment pipelines. Automated testing catches bugs before production deployment. Infrastructure-as-code manages cloud resources programmatically. Monitoring systems track application health and performance metrics. Teams practice rapid iteration and frequent releases safely.',
    'RESTful APIs establish standard communication protocols between services. HTTP methods like GET, POST, PUT define operations clearly. JSON format structures data in human-readable formats. API versioning manages changes without breaking clients. Rate limiting prevents abuse while allowing fair access.',
    'Database optimization reduces query execution times significantly. Proper indexing strategy improves lookup performance dramatically. Query analysis identifies bottlenecks in application code. Caching frequently accessed data reduces database load. Partitioning large tables distributes data across multiple servers.',
  ];

  const hardPassages = [
    'Distributed systems face complex challenges regarding consistency, availability, and partition tolerance. The CAP theorem explains fundamental trade-offs in system design. Consensus algorithms like Raft and Paxos solve coordination problems. Eventually consistent systems sacrifice immediate consistency for availability. Distributed transactions require careful coordination across multiple nodes. Byzantine fault tolerance handles malicious node failures.',
    'Asynchronous programming patterns enable non-blocking operations and improved concurrency. Event-driven architectures decouple producers from consumers. Message queues like RabbitMQ and Kafka handle high-throughput data streams. Promises and async-await syntax simplify asynchronous code readability. Reactive programming streams handle continuous data flows elegantly.',
    'Blockchain technology utilizes cryptographic consensus mechanisms for decentralized trust. Smart contracts execute automatically when conditions are met. Merkle trees ensure data integrity across distributed ledgers. Proof-of-work algorithms secure networks through computational difficulty. Zero-knowledge proofs verify statements without revealing sensitive information.',
    'Containerized microservices orchestrated by Kubernetes enable elastic scalability. Container registries store and distribute application images globally. Service discovery automatically routes requests to healthy instances. StatefulSets manage stateful workloads with persistent storage. Network policies enforce security boundaries between services.',
    'GraphQL provides flexible query languages that reduce over-fetching and under-fetching inefficiencies. Resolvers map fields to data sources dynamically. Subscription types enable real-time data updates through websockets. Introspection allows clients to discover available types and operations. Type safety prevents common query errors at development time.',
  ];

  const passages = level === 'easy' ? easyPassages : level === 'medium' ? mediumPassages : hardPassages;
  const selected = passages[Math.floor(Math.random() * passages.length)];
  const words = selected.split(/\s+/).filter(Boolean);
  
  // Return approximately requested word count
  return words.slice(0, Math.max(20, wordCount)).join(' ') + (selected.endsWith('.') ? '' : '.');
}

export function generateTextLocal(level: 'easy' | 'medium' | 'hard', wordCount = 50) {
  return enforceCapsAndOdd(cleanupRepeatedPhrases(localMeaningfulGenerate(level, wordCount)));
}

export async function generateTextAsync(level: 'easy' | 'medium' | 'hard', wordCount = 50) {
  const levelGuide = level === 'easy' 
    ? 'simple sentences with common words, suitable for beginners'
    : level === 'medium'
    ? 'clear technical sentences about modern technology and development practices'
    : 'complex technical content about software engineering, system design, and advanced computing concepts';

  const prompt = `Generate a coherent, meaningful passage of approximately ${wordCount} words about technology, web development, artificial intelligence, or software engineering. The passage should tell a story or explain a concept, not just list random words.

Level: ${level}
Style: ${levelGuide}

Requirements:
- Write complete, grammatically correct sentences
- Each sentence should logically connect to the previous one
- Use professional, clear language
- Focus on tech industry topics (AI, cloud, DevOps, APIs, databases, microservices, web design, etc.)
- Return ONLY the plain text passage, nothing else
- Do NOT include quotes, asterisks, or markdown formatting`;

  if (USE_REMOTE) {
    const MAX_TRIES = 2;
    for (let attempt = 0; attempt <= MAX_TRIES; attempt++) {
      try {
        const text = await generateWithOpenRouter(prompt, undefined, Math.min(1024, Math.max(256, wordCount * 6)), 4000);
        const cleaned = enforceCapsAndOdd(cleanupRepeatedPhrases(String(text || '')));
        if (isMeaningful(cleaned)) return cleaned;
      } catch (e) {
        console.warn('OpenRouter attempt failed', e);
      }
    }
  }

  let local = enforceCapsAndOdd(cleanupRepeatedPhrases(localMeaningfulGenerate(level, wordCount)));
  if (isMeaningful(local)) return local;

  for (let i = 0; i < 3 && !isMeaningful(local); i++) {
    local = enforceCapsAndOdd(cleanupRepeatedPhrases(localMeaningfulGenerate(level, Math.max(20, Math.floor(wordCount / 2)))));
  }

  return local;
}

export function getMoreWords(level: 'easy' | 'medium' | 'hard', count = 30) {
  return localGetMoreWords(level, count);
}

function cleanupRepeatedPhrases(s: string) {
  if (!s) return s;
  let out = s.replace(/[\u2013\u2014]/g, ' ');
  out = out.replace(/\b(\w+)(\s+\1\b)+/gi, '$1');
  out = out.replace(/(\b[^.?!]+[.?!])(\s*\1)+/g, '$1');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

function isMeaningful(s: string) {
  if (!s) return false;
  const cleaned = s.replace(/[^\w\s]/g, '');
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;
  const unique = new Set(words.map((w) => w.toLowerCase()));
  const uniqueRatio = unique.size / words.length;
  if (uniqueRatio < 0.35) return false;
  const gibberishCount = words.reduce((acc, w) => {
    const letters = w.replace(/[^a-zA-Z]/g, '');
    if (!letters) return acc;
    const vowels = (letters.match(/[aeiouAEIOU]/g) || []).length;
    if (vowels / letters.length < 0.25 && letters.length > 3) return acc + 1;
    return acc;
  }, 0);
  if (gibberishCount > Math.max(1, Math.floor(words.length * 0.15))) return false;
  const nonLetterRatio = (s.replace(/[\w\s]/g, '').length) / Math.max(1, s.length);
  if (nonLetterRatio > 0.2) return false;
  return true;
}

function enforceCapsAndOdd(input: string) {
  if (!input) return input;
  let out = input.trim();
  out = out.replace(/[\u2013\u2014]/g, ' ');
  out = out.replace(/^\s*([a-z])/, (_, c) => c.toUpperCase());
  out = out.replace(/(\.['")\]]*\s+)([a-z])/g, (_m, p1, p2) => p1 + p2.toUpperCase());
  out = out.replace(/(\.\s*)([a-z])/g, (_m, p1, p2) => p1 + p2.toUpperCase());
  if (out.length % 2 === 0) out = out + '.';
  return out;
}

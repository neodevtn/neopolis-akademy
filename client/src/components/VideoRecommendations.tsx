import { ExternalLink, Play, BookOpen, Lightbulb, Tv } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface I18nText {
  en?: string;
  fr?: string;
}

interface RecommendedVideo {
  videoId: string;
  title: string;
  channel: string;
  type: 'tutorial' | 'deep_dive' | 'complementary' | 'masterclass';
  topics: string[];
}

interface VideoRecommendationsProps {
  lesson: {
    title?: I18nText | string;
    chapters?: Array<{
      title?: I18nText | string;
      blocks?: Array<{ type?: string; title?: I18nText | string; body?: I18nText | string }>;
    }>;
  };
  lang: string;
  t: (i18n: { en: string; fr: string }) => string;
}

// ─── Curated Video Database ───────────────────────────────────────────────────
const VIDEO_DATABASE: RecommendedVideo[] = [
  // RAG & Retrieval
  { videoId: '63B-3rqRFbQ', title: 'RAG Tutorial 2025: Complete Introduction', channel: 'pixegami', type: 'tutorial', topics: ['rag', 'retrieval', 'augmented generation', 'vector', 'embedding', 'knowledge base', 'document'] },
  { videoId: 'swvzKSOEluc', title: 'RAG Crash Course for Beginners', channel: 'freeCodeCamp', type: 'tutorial', topics: ['rag', 'retrieval', 'beginner', 'crash course', 'llm application'] },
  { videoId: 'sVcwVQRHIc8', title: 'Learn RAG From Scratch (LangChain)', channel: 'freeCodeCamp', type: 'deep_dive', topics: ['rag', 'langchain', 'python', 'from scratch', 'engineer'] },
  { videoId: 'vAK0iqA6-QI', title: 'RAG Tutorial 2026: Build from Scratch', channel: 'pixegami', type: 'tutorial', topics: ['rag', 'retrieval', '2026', 'build', 'application'] },

  // AI Agents
  { videoId: 'G42J2MSKyc8', title: 'CrewAI Tutorial: Agentic AI Fundamentals', channel: 'Krish Naik', type: 'tutorial', topics: ['agent', 'crewai', 'agentic', 'multi-agent', 'autonomous', 'orchestration'] },
  { videoId: '8HqeY5v0ohM', title: 'AutoGen vs CrewAI vs LangGraph Comparison', channel: 'AI Jason', type: 'deep_dive', topics: ['agent', 'autogen', 'crewai', 'langgraph', 'comparison', 'framework', 'multi-agent'] },
  { videoId: 'cS-CXkA8XYw', title: 'Production AI Agents with LangGraph', channel: 'AI Engineer', type: 'masterclass', topics: ['agent', 'langgraph', 'production', 'deployment', 'workflow', 'state machine'] },
  { videoId: 'pTN95F3sZG0', title: 'LangGraph Masterclass: Build AI Agents', channel: 'AI Makerspace', type: 'masterclass', topics: ['agent', 'langgraph', 'masterclass', 'build', 'orchestration'] },
  { videoId: '77nHShlpCfQ', title: 'Definitive Guide to Building AI Agents 2025', channel: 'AI Engineer', type: 'deep_dive', topics: ['agent', 'agentic', 'patterns', 'architecture', 'guide', 'use cases'] },

  // Vector Databases
  { videoId: '8KrTO9bS91s', title: 'Vector Databases: ChromaDB, Pinecone & Weaviate', channel: 'Krish Naik', type: 'tutorial', topics: ['vector', 'database', 'chromadb', 'pinecone', 'weaviate', 'embedding', 'similarity'] },
  { videoId: 'god8Pox1laE', title: 'ChromaDB Crash Course', channel: 'Coding Crashcourses', type: 'tutorial', topics: ['vector', 'chromadb', 'crash course', 'embedding', 'storage'] },
  { videoId: 'AGKY_Q3GjRc', title: 'Pinecone Getting Started Guide', channel: 'James Briggs', type: 'tutorial', topics: ['vector', 'pinecone', 'getting started', 'semantic search', 'index'] },

  // Claude API & Anthropic
  { videoId: 'H7LZb20-fUY', title: 'Claude API Crash Course: Introduction & Setup', channel: 'Coding Crashcourses', type: 'tutorial', topics: ['claude', 'api', 'anthropic', 'sdk', 'setup', 'introduction', 'messages'] },
  { videoId: 'TqC1qOfiVcQ', title: 'Claude Agent SDK Full Workshop', channel: 'Anthropic', type: 'masterclass', topics: ['claude', 'agent', 'sdk', 'anthropic', 'workshop', 'development', 'code'] },
  { videoId: 'EstrsAlmxd4', title: 'Haiku vs Sonnet vs Opus: Which Claude Model?', channel: 'AI Explained', type: 'deep_dive', topics: ['claude', 'model', 'haiku', 'sonnet', 'opus', 'comparison', 'selection', 'anthropic'] },
  { videoId: 'jC_rX86O1Q8', title: "Anthropic's Claude Haiku 4.5 in 6 Minutes", channel: 'Fireship', type: 'complementary', topics: ['claude', 'haiku', 'anthropic', 'model', 'fast', 'cost-effective'] },

  // LLMOps & Observability
  { videoId: 'TDcT9ao47Tk', title: 'Observability for AI Apps: LangSmith, Langfuse', channel: 'Langflow', type: 'tutorial', topics: ['observability', 'langsmith', 'langfuse', 'monitoring', 'tracing', 'llmops', 'production'] },
  { videoId: 'HH887f9sozs', title: 'Langfuse vs LangSmith 2025 Comparison', channel: 'AI Tools Review', type: 'deep_dive', topics: ['langfuse', 'langsmith', 'comparison', 'observability', 'llmops', 'tracking', 'prompt'] },
  { videoId: 'w71RHxAWxaM', title: 'Ultimate MLOps Full Course', channel: 'TechWorld with Nana', type: 'masterclass', topics: ['mlops', 'operations', 'pipeline', 'deployment', 'monitoring', 'full course'] },
  { videoId: 'FWy9mf-rIwk', title: 'How to Learn MLOps in 2025', channel: 'Data Science Dojo', type: 'complementary', topics: ['mlops', 'learning path', 'roadmap', 'career', 'tools'] },

  // AI Security & Red Teaming
  { videoId: '0l5y-JM88EU', title: 'AI Red-Teaming 101: Prompt-Based Attacks', channel: 'AI Security', type: 'tutorial', topics: ['security', 'red team', 'prompt injection', 'attack', 'vulnerability', 'llm'] },
  { videoId: 'DwFVhFdD2fs', title: 'AI Red Teaming Full Course (Episodes 1-10)', channel: 'AI Security', type: 'masterclass', topics: ['security', 'red team', 'full course', 'generative ai', 'risks', 'beginner'] },
  { videoId: 'UaMpYKF7V5M', title: 'AI Red Teaming: Document Poisoning', channel: 'AI Security', type: 'deep_dive', topics: ['security', 'red team', 'document poisoning', 'prompt injection', 'rag', 'attack vector'] },
  { videoId: 'h3UuPCjv_us', title: 'Microsoft AI Red Teaming Labs Full Course', channel: 'John Savill', type: 'masterclass', topics: ['security', 'red team', 'microsoft', 'labs', 'llm hacking', 'hands-on'] },

  // Fine-Tuning & Open Source LLMs
  { videoId: 'D3pXSkGceY0', title: 'Fine-Tune LLM with LoRA (Custom Dataset)', channel: 'Nick Nochnack', type: 'tutorial', topics: ['fine-tuning', 'lora', 'custom dataset', 'training', 'llm', 'open source'] },
  { videoId: 'Vg3dS-NLUT4', title: 'Fine-Tune LLAMA 2 with QLoRA Step by Step', channel: 'Krish Naik', type: 'tutorial', topics: ['fine-tuning', 'qlora', 'llama', 'quantization', 'custom data', 'hugging face'] },
  { videoId: 'l5a_uKnbEr4', title: 'LoRA & QLoRA Mathematical Intuition', channel: 'Krish Naik', type: 'deep_dive', topics: ['fine-tuning', 'lora', 'qlora', 'math', 'intuition', 'technique', 'parameter efficient'] },

  // AI Product Management
  { videoId: 'K62p4ghDH0c', title: 'From Zero to AI Product Manager (Full Guide)', channel: 'Product School', type: 'tutorial', topics: ['product management', 'ai pm', 'career', 'roadmap', 'guide', 'strategy'] },
  { videoId: '77Ice08QPy0', title: 'AI Product Management Masterclass', channel: 'Product School', type: 'masterclass', topics: ['product management', 'ai pm', 'masterclass', 'skills', 'strategy', 'job'] },
  { videoId: 'KjYCEiBTHFo', title: 'AI Product Management Complete Course (3.5h)', channel: 'AI PM Academy', type: 'masterclass', topics: ['product management', 'ai pm', 'complete course', 'agents', 'rag', 'llm'] },

  // AI UX & Human-Centered Design
  { videoId: 'rf83vRxLWFQ', title: 'Designing Human-Centered AI Products (Google)', channel: 'Google', type: 'deep_dive', topics: ['ux', 'human-centered', 'design', 'ai products', 'user experience', 'google'] },
  { videoId: 'PNoGW3KkEAs', title: 'Human-AI eXperience (HAX) Toolkit Tutorial', channel: 'Microsoft Research', type: 'tutorial', topics: ['ux', 'human-centered', 'hax', 'toolkit', 'design', 'interaction'] },

  // AI Governance & Responsible AI
  { videoId: 'yh-3WU1FKrk', title: 'Responsible AI: A Guide to AI Governance', channel: 'IBM', type: 'deep_dive', topics: ['governance', 'responsible ai', 'ethics', 'transparency', 'compliance', 'framework'] },
  { videoId: 'IHsYWHfIe0Y', title: 'Responsible AI: Governance, Ethics & Best Practices', channel: 'IBM', type: 'tutorial', topics: ['governance', 'responsible ai', 'ethics', 'best practices', 'ai literacy'] },
  { videoId: '8Ra5L1aQ5YM', title: "Microsoft's Responsible AI Principles", channel: 'Microsoft', type: 'complementary', topics: ['governance', 'responsible ai', 'microsoft', 'principles', 'fairness', 'safety'] },

  // AI FinOps & Cost Optimization
  { videoId: 'I3eWSPVADZ4', title: 'AI FinOps: Building Observability for AI Spend', channel: 'FinOps Foundation', type: 'deep_dive', topics: ['finops', 'cost', 'observability', 'ai spend', 'optimization', 'attribution'] },
  { videoId: 'On0TNR6eZ9s', title: "AWS re:Invent: Leader's Guide to AI-Powered FinOps", channel: 'AWS', type: 'complementary', topics: ['finops', 'aws', 'cloud', 'cost management', 'ai-powered', 'strategy'] },
  { videoId: 'gea1nvRcMhc', title: 'LLM Cost Optimization: FinOps Strategies', channel: 'AI Engineer', type: 'tutorial', topics: ['finops', 'cost optimization', 'llm', 'tokens', 'caching', 'batching', 'gpu'] },

  // Prompt Engineering
  { videoId: '5i2Hn8OG94o', title: 'Prompt Engineering Full Course 2025', channel: 'AI Academy', type: 'masterclass', topics: ['prompt engineering', 'techniques', 'zero-shot', 'few-shot', 'chain of thought', 'full course'] },
  { videoId: 'IEouqolKqWs', title: 'Master Prompt Engineering: Step-by-Step Guide', channel: 'AI Mastery', type: 'tutorial', topics: ['prompt engineering', 'masterclass', 'step by step', 'claude', 'chatgpt', 'techniques'] },

  // Model Deployment & Infrastructure
  { videoId: 'q5IF2PHA5SA', title: 'vLLM: Deploying & Serving LLMs', channel: 'AI Engineering', type: 'tutorial', topics: ['deployment', 'vllm', 'serving', 'inference', 'llm', 'infrastructure', 'gpu'] },
  { videoId: 'kH63PGZsDY4', title: 'Serving AI Models at Scale with vLLM', channel: 'Google Cloud', type: 'deep_dive', topics: ['deployment', 'vllm', 'scale', 'multi-gpu', 'tpu', 'serving', 'production'] },
  { videoId: 'J15u1Y2b4sw', title: 'Hugging Face Inference Endpoints Tutorial', channel: 'Hugging Face', type: 'tutorial', topics: ['deployment', 'hugging face', 'inference', 'endpoints', 'model serving', 'cloud'] },
  { videoId: 'c_CzCsCnWoU', title: 'Deploy ML Models on Kubernetes with Docker', channel: 'MLOps World', type: 'tutorial', topics: ['deployment', 'kubernetes', 'docker', 'ml model', 'fastapi', 'containerization'] },
  { videoId: 'KC8HT0eWSGk', title: 'Build & Deploy AI Agent with Docker', channel: 'Docker', type: 'tutorial', topics: ['deployment', 'docker', 'agent', 'containerization', 'python', 'production'] },

  // LLM Evaluation & Testing
  { videoId: 'a3SMraZWNNs', title: 'Systematically Setup LLM Evals', channel: 'Stanford CS', type: 'deep_dive', topics: ['evaluation', 'evals', 'metrics', 'unit tests', 'llm-as-judge', 'quality'] },
  { videoId: '89NuzmKokIk', title: 'Strategies for LLM Evals (GuideLLM, lm-eval)', channel: 'AI Engineering', type: 'tutorial', topics: ['evaluation', 'evals', 'strategies', 'benchmarks', 'reasoning', 'consistency'] },
  { videoId: 'uz5BEadZwLc', title: 'Easiest Way to Test LLMs & AI Agents', channel: 'AI Testing', type: 'tutorial', topics: ['evaluation', 'testing', 'deepeval', 'agents', 'framework', 'easy'] },

  // Enterprise AI & Strategy
  { videoId: 'Ee8bGk7XhE8', title: 'AI Implementation Plan That Gets Executed', channel: 'AI Strategy', type: 'complementary', topics: ['enterprise', 'implementation', 'strategy', 'plan', 'executive', 'transformation'] },
  { videoId: 'WAezpbnpdk4', title: 'Enterprise AI Strategy for 2026', channel: 'AI Strategy', type: 'deep_dive', topics: ['enterprise', 'strategy', 'deployment', 'scale', 'security', 'compliance', 'platform'] },
  { videoId: '595244PsV7E', title: 'Build AI Applications: Architecture & Use Cases', channel: 'AI Architecture', type: 'deep_dive', topics: ['architecture', 'application', 'use cases', 'best practices', 'monitoring', 'guardrails'] },

  // General AI / Foundations
  { videoId: 'ocyFONwoJQg', title: 'Enterprise AI Playbook: Five Must-Have Strategies', channel: 'Google Cloud', type: 'complementary', topics: ['enterprise', 'strategy', 'playbook', 'data', 'ai', 'business'] },
  { videoId: 'NTRj2qVwVZY', title: 'AI Strategy Roadmap for Enterprise Leaders', channel: 'AI Strategy', type: 'complementary', topics: ['enterprise', 'strategy', 'roadmap', 'responsible', 'scale', 'innovation'] },
];

// ─── Topic Keywords Mapping ───────────────────────────────────────────────────
const TOPIC_ALIASES: Record<string, string[]> = {
  rag: ['rag', 'retrieval', 'augmented generation', 'knowledge base', 'document retrieval', 'context window', 'grounding'],
  agent: ['agent', 'agentic', 'autonomous', 'multi-agent', 'tool use', 'function calling', 'orchestration', 'workflow'],
  vector: ['vector', 'embedding', 'similarity', 'semantic search', 'chromadb', 'pinecone', 'weaviate', 'faiss'],
  claude: ['claude', 'anthropic', 'sonnet', 'haiku', 'opus', 'messages api', 'claude api'],
  security: ['security', 'red team', 'prompt injection', 'jailbreak', 'adversarial', 'safety', 'guardrails', 'attack'],
  'fine-tuning': ['fine-tuning', 'fine tune', 'lora', 'qlora', 'training', 'custom model', 'adapter', 'peft'],
  llmops: ['llmops', 'observability', 'monitoring', 'tracing', 'langfuse', 'langsmith', 'production', 'ops'],
  deployment: ['deployment', 'serving', 'inference', 'vllm', 'kubernetes', 'docker', 'container', 'infrastructure', 'gpu', 'model serving'],
  'product management': ['product management', 'product manager', 'ai pm', 'roadmap', 'stakeholder', 'user research'],
  governance: ['governance', 'responsible ai', 'ethics', 'compliance', 'regulation', 'fairness', 'transparency', 'bias'],
  finops: ['finops', 'cost', 'optimization', 'spending', 'token', 'pricing', 'budget', 'roi', 'cloud cost'],
  prompt: ['prompt', 'prompt engineering', 'chain of thought', 'few-shot', 'zero-shot', 'instruction', 'system prompt'],
  evaluation: ['evaluation', 'evals', 'benchmark', 'metrics', 'testing', 'quality', 'performance', 'accuracy'],
  enterprise: ['enterprise', 'strategy', 'implementation', 'transformation', 'business', 'scale', 'organization'],
  ux: ['ux', 'user experience', 'human-centered', 'design', 'interface', 'interaction', 'usability'],
  mlops: ['mlops', 'pipeline', 'ci/cd', 'experiment tracking', 'model registry', 'automation'],
  architecture: ['architecture', 'system design', 'patterns', 'microservices', 'api design', 'scalability'],
};

// ─── Helper: Extract keywords from lesson ─────────────────────────────────────
function extractKeywords(lesson: VideoRecommendationsProps['lesson'], lang: string): string[] {
  const resolveText = (t: I18nText | string | undefined): string => {
    if (!t) return '';
    if (typeof t === 'string') return t;
    return (lang === 'fr' ? t.fr : t.en) || t.en || t.fr || '';
  };

  const texts: string[] = [];

  // Lesson title
  texts.push(resolveText(lesson.title));

  // Chapter titles
  if (lesson.chapters) {
    for (const ch of lesson.chapters) {
      texts.push(resolveText(ch.title));
      // First few blocks for context
      if (ch.blocks) {
        for (const block of ch.blocks.slice(0, 3)) {
          if (block.title) texts.push(resolveText(block.title));
          if (block.body && typeof block.body === 'string') {
            texts.push(block.body.substring(0, 200));
          } else if (block.body && typeof block.body === 'object') {
            const bodyText = resolveText(block.body);
            texts.push(bodyText.substring(0, 200));
          }
        }
      }
    }
  }

  const combined = texts.join(' ').toLowerCase();
  return combined.split(/[\s,.\-_:;/()[\]{}]+/).filter(w => w.length > 2);
}

// ─── Helper: Score a video against keywords ───────────────────────────────────
function scoreVideo(video: RecommendedVideo, keywords: string[], lessonText: string): number {
  let score = 0;
  const lowerText = lessonText.toLowerCase();

  // Check topic aliases
  for (const [topicKey, aliases] of Object.entries(TOPIC_ALIASES)) {
    const topicMatches = aliases.some(alias => lowerText.includes(alias));
    if (topicMatches && video.topics.some(t => t.includes(topicKey) || aliases.some(a => t.includes(a)))) {
      score += 10;
    }
  }

  // Direct keyword matching
  for (const keyword of keywords) {
    if (video.topics.some(t => t.includes(keyword))) {
      score += 2;
    }
    if (video.title.toLowerCase().includes(keyword)) {
      score += 1;
    }
  }

  // Bonus for tutorials (more actionable)
  if (video.type === 'tutorial') score += 2;
  if (video.type === 'masterclass') score += 1;

  return score;
}

// ─── Helper: Get type badge config ────────────────────────────────────────────
function getTypeBadge(type: RecommendedVideo['type'], t: VideoRecommendationsProps['t']): { label: string; icon: typeof Play; color: string } {
  switch (type) {
    case 'tutorial':
      return { label: t({ en: 'Tutorial', fr: 'Tutoriel' }), icon: Play, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    case 'deep_dive':
      return { label: t({ en: 'Deep Dive', fr: 'Approfondissement' }), icon: BookOpen, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    case 'masterclass':
      return { label: t({ en: 'Masterclass', fr: 'Masterclass' }), icon: Tv, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    case 'complementary':
      return { label: t({ en: 'Complementary', fr: 'Complémentaire' }), icon: Lightbulb, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VideoRecommendations({ lesson, lang, t }: VideoRecommendationsProps) {
  const resolveText = (txt: I18nText | string | undefined): string => {
    if (!txt) return '';
    if (typeof txt === 'string') return txt;
    return (lang === 'fr' ? txt.fr : txt.en) || txt.en || txt.fr || '';
  };

  // Build lesson text for matching
  const lessonTitle = resolveText(lesson.title);
  const chapterTitles = (lesson.chapters || []).map(ch => resolveText(ch.title)).join(' ');
  const lessonText = `${lessonTitle} ${chapterTitles}`;

  // Extract keywords
  const keywords = extractKeywords(lesson, lang);

  // Score and rank videos
  const scoredVideos = VIDEO_DATABASE
    .map(video => ({ video, score: scoreVideo(video, keywords, lessonText) }))
    .filter(({ score }) => score >= 5) // Minimum relevance threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 recommendations

  // Don't render if no relevant videos found
  if (scoredVideos.length === 0) return null;

  return (
    <div className="mt-8 mb-4 px-1">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#c75b3a]/10 dark:bg-[#c75b3a]/20 flex items-center justify-center">
          <Tv className="w-4 h-4 text-[#c75b3a]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t({ en: 'Recommended Videos', fr: 'Vidéos recommandées' })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t({ en: 'Deepen your understanding with these complementary resources', fr: 'Approfondissez vos connaissances avec ces ressources complémentaires' })}
          </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scoredVideos.map(({ video }) => {
          const badge = getTypeBadge(video.type, t);
          const BadgeIcon = badge.icon;
          const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
          const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

          return (
            <a
              key={video.videoId}
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-[#c75b3a]/30 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-[#c75b3a] ml-0.5" fill="currentColor" />
                  </div>
                </div>
                {/* Type badge */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${badge.color}`}>
                  <BadgeIcon className="w-3 h-3" />
                  {badge.label}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-[#c75b3a] transition-colors">
                  {video.title}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[70%]">
                    {video.channel}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-[#c75b3a] transition-colors flex-shrink-0" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default VideoRecommendations;

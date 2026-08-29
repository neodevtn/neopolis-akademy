export type AiNewsSource = {
  id: string;
  label: string;
  feedUrl: string;
  category: "Annonces" | "Outils" | "Analyse" | "Recherche";
  description: string;
};

export type AiNewsArticle = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceCategory: AiNewsSource["category"];
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string | null;
  topics: string[];
};

export type AiNewsFeed = {
  articles: AiNewsArticle[];
  sources: Array<AiNewsSource & { status: "ok" | "unavailable"; articleCount: number }>;
  updatedAt: string;
  stale: boolean;
};

type FetchResponse = { ok: boolean; status: number; text: () => Promise<string> };
type Fetcher = (url: string, init?: RequestInit) => Promise<FetchResponse>;

export const AI_NEWS_SOURCES: AiNewsSource[] = [
  { id: "openai", label: "OpenAI News", feedUrl: "https://openai.com/news/rss.xml", category: "Annonces", description: "Annonces officielles de produits, modèles et politiques." },
  { id: "huggingface", label: "Hugging Face", feedUrl: "https://huggingface.co/blog/feed.xml", category: "Outils", description: "Modèles, outillage et retours pratiques open source." },
  { id: "google-ai", label: "Google AI Blog", feedUrl: "https://blog.google/technology/ai/rss/", category: "Annonces", description: "Annonces de recherche, de modèles et de plateformes Google." },
  { id: "mit-technology-review", label: "MIT Technology Review", feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed/", category: "Analyse", description: "Analyse éditoriale et contexte industriel." },
  { id: "marktechpost", label: "MarkTechPost", feedUrl: "https://www.marktechpost.com/feed/", category: "Analyse", description: "Veille de publications, modèles et lancements." },
  { id: "arxiv-cs-ai", label: "arXiv cs.AI", feedUrl: "https://rss.arxiv.org/rss/cs.AI", category: "Recherche", description: "Prépublications de recherche en intelligence artificielle." },
];

const CACHE_TTL_MS = 8 * 60 * 1000;
const ARTICLE_LIMIT_PER_SOURCE = 10;
let cachedFeed: { createdAt: number; value: AiNewsFeed } | null = null;

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function textFromFeed(value: string, maximum: number) {
  const stripped = decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  return stripped.length > maximum ? `${stripped.slice(0, Math.max(0, maximum - 1)).trimEnd()}…` : stripped;
}

function tagValue(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] || "";
}

function atomLinkValue(block: string) {
  const match = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || "";
}

function safeArticleUrl(value: string) {
  try {
    const url = new URL(textFromFeed(value, 1200));
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function toPublishedAt(value: string) {
  const timestamp = Date.parse(textFromFeed(value, 120));
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

export function parseAiNewsFeed(xml: string, source: AiNewsSource): AiNewsArticle[] {
  const blocks = Array.from(xml.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)).map((match) => match[1]);
  const seenUrls = new Set<string>();

  return blocks.flatMap((block, index) => {
    const title = textFromFeed(tagValue(block, "title"), 220);
    const url = safeArticleUrl(tagValue(block, "link") || atomLinkValue(block));
    if (!title || !url || seenUrls.has(url)) return [];
    seenUrls.add(url);

    const excerpt = textFromFeed(
      tagValue(block, "description") || tagValue(block, "summary") || tagValue(block, "content:encoded") || tagValue(block, "content"),
      360,
    );
    const topicBlocks = Array.from(block.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi));
    const topics = topicBlocks.map((match) => textFromFeed(match[1], 60)).filter(Boolean).slice(0, 3);
    const publishedAt = toPublishedAt(tagValue(block, "pubDate") || tagValue(block, "published") || tagValue(block, "updated"));
    const stableId = `${source.id}:${url}`;

    return [{
      id: stableId,
      sourceId: source.id,
      sourceLabel: source.label,
      sourceCategory: source.category,
      title,
      excerpt,
      url,
      publishedAt,
      topics,
      sortIndex: index,
    }];
  }).map(({ sortIndex: _sortIndex, ...article }) => article).slice(0, ARTICLE_LIMIT_PER_SOURCE);
}

async function loadSource(source: AiNewsSource, fetcher: Fetcher) {
  const response = await fetcher(source.feedUrl, {
    headers: {
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.2",
      "User-Agent": "Neopolis-Akademy-AI-News/1.0 (+https://akademy.neodev.click/ai-news)",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`RSS ${source.id}: HTTP ${response.status}`);
  return parseAiNewsFeed(await response.text(), source);
}

export async function getAiNewsFeed(options: { fetcher?: Fetcher; forceRefresh?: boolean } = {}): Promise<AiNewsFeed> {
  const now = Date.now();
  if (!options.fetcher && !options.forceRefresh && cachedFeed && now - cachedFeed.createdAt < CACHE_TTL_MS) return { ...cachedFeed.value, stale: false };

  const fetcher: Fetcher = options.fetcher || ((url, init) => fetch(url, init) as Promise<FetchResponse>);
  const results = await Promise.allSettled(AI_NEWS_SOURCES.map((source) => loadSource(source, fetcher)));
  const articles: AiNewsArticle[] = [];
  const sources = AI_NEWS_SOURCES.map((source, index) => {
    const result = results[index];
    if (result.status === "fulfilled") {
      articles.push(...result.value);
      return { ...source, status: "ok" as const, articleCount: result.value.length };
    }
    return { ...source, status: "unavailable" as const, articleCount: 0 };
  });

  const value: AiNewsFeed = {
    articles: articles.sort((first, second) => (second.publishedAt || "").localeCompare(first.publishedAt || "") || first.title.localeCompare(second.title)),
    sources,
    updatedAt: new Date(now).toISOString(),
    stale: false,
  };
  if (!options.fetcher) cachedFeed = { createdAt: now, value };
  return value;
}

export function clearAiNewsCacheForTests() {
  cachedFeed = null;
}

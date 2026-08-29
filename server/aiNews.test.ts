import { describe, expect, it, vi } from "vitest";
import { AI_NEWS_SOURCES, getAiNewsFeed, parseAiNewsFeed, textFromFeed } from "./aiNews";

const SAMPLE_RSS = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[New &amp; useful model]]></title><link>https://example.org/articles/model</link><pubDate>Fri, 28 Aug 2026 10:00:00 GMT</pubDate><category>Models</category><description><![CDATA[<p>A concise <strong>summary</strong>.</p><script>alert('x')</script>]]></description></item></channel></rss>`;

describe("AI News RSS aggregation", () => {
  it("extrait des cartes RSS sûres sans conserver le HTML du fournisseur", () => {
    const [article] = parseAiNewsFeed(SAMPLE_RSS, AI_NEWS_SOURCES[0]);

    expect(article).toMatchObject({ sourceId: "openai", title: "New & useful model", url: "https://example.org/articles/model", topics: ["Models"] });
    expect(article.excerpt).toContain("A concise summary.");
    expect(article.excerpt).not.toContain("alert");
  });

  it("borne et nettoie les extraits de flux externes", () => {
    expect(textFromFeed("<p>Hello <em>world</em></p>", 40)).toBe("Hello world");
    expect(textFromFeed("<script>danger()</script>Texte", 40)).toBe("Texte");
  });

  it("conserve les sources disponibles lorsque certains flux échouent", async () => {
    const fetcher = vi.fn(async (url: string) => ({
      ok: url.includes("openai"),
      status: url.includes("openai") ? 200 : 503,
      text: async () => SAMPLE_RSS,
    }));
    const feed = await getAiNewsFeed({ fetcher });

    expect(feed.articles).toHaveLength(1);
    expect(feed.sources.filter((source) => source.status === "ok")).toHaveLength(1);
    expect(feed.sources.filter((source) => source.status === "unavailable")).toHaveLength(AI_NEWS_SOURCES.length - 1);
  });
});

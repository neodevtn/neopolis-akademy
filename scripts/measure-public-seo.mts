import { getSeoPage } from "../server/seo.ts";

const routes = ["/", "/en", "/ar", "/ai-news", "/apply", "/refer", "/mentions-legales"];

for (const route of routes) {
  const page = getSeoPage(route);
  const keywordCount = page.keywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean).length ?? 0;
  console.log(JSON.stringify({
    route,
    titleLength: [...page.title].length,
    descriptionLength: [...page.description].length,
    keywordCount,
    title: page.title,
  }));
}

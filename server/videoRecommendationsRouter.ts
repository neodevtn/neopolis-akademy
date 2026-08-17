import { router, publicProcedure, adminProcedure } from "./_core/trpc";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const videoType = z.enum(["tutorial", "deep_dive", "complementary", "masterclass"]);
const catalogSchema = z.object({
  videos: z.array(z.object({
    videoId: z.string().regex(/^[A-Za-z0-9_-]{6,}$/),
    title: z.string().min(1).max(240),
    channel: z.string().min(1).max(160),
    type: videoType,
    topics: z.array(z.string().min(1).max(80)).min(1).max(20),
  })).max(300),
  topicAliases: z.record(z.string(), z.array(z.string().min(1).max(100)).max(30)),
});

function catalogPath() {
  const root = process.env.NODE_ENV === "production"
    ? path.resolve(import.meta.dirname, "..", "dist", "public", "data")
    : path.resolve(import.meta.dirname, "..", "client", "public", "data");
  return path.join(root, "videoRecommendations.json");
}

async function readCatalog() {
  const raw = await fs.readFile(catalogPath(), "utf-8");
  return catalogSchema.parse(JSON.parse(raw));
}

export const videoRecommendationsRouter = router({
  getCatalog: publicProcedure.query(() => readCatalog()),
  updateCatalog: adminProcedure.input(catalogSchema).mutation(async ({ input }) => {
    const duplicate = input.videos.find((video, index) => input.videos.findIndex((candidate) => candidate.videoId === video.videoId) !== index);
    if (duplicate) throw new Error(`La vidéo ${duplicate.videoId} est présente plusieurs fois dans le catalogue.`);
    await fs.writeFile(catalogPath(), JSON.stringify(input, null, 2), "utf-8");
    return { success: true, count: input.videos.length };
  }),
});
